const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Professional = require('../models/Professional');

// Subscription tier pricing (in cents)
const SUBSCRIPTION_PLANS = {
  Apprentice: {
    price: 0,
    priceId: null, // Free tier
    features: [
      'Basic profile with 25 images',
      'Receive 5 project requests/month',
      'AI Trade Score (basic)',
      'Access to Trade Academy free courses',
      'Standard payment processing (3.5%)'
    ]
  },
  Journeyman: {
    price: 4900, // $49.00
    priceId: process.env.STRIPE_JOURNEYMAN_PRICE_ID,
    features: [
      'Everything in Apprentice',
      'Unlimited project requests',
      'Priority search placement',
      'BuildBot AI Assistant (100/month)',
      'Business Command Center',
      'AR Portfolio Builder',
      'Reduced fees (2.5%)',
      'Custom branded invoices'
    ]
  },
  Master: {
    price: 14900, // $149.00
    priceId: process.env.STRIPE_MASTER_PRICE_ID,
    features: [
      'Everything in Journeyman',
      'AI Quality Verification (unlimited)',
      'Fleet & Crew Management (10 crew)',
      'Supply Chain Intelligence',
      'Guaranteed 24hr response badge',
      'Video portfolio (4K)',
      'Dedicated account manager',
      'Lowest fees (1.9%)',
      'API access'
    ]
  }
};

// @route   POST /api/payments/create-checkout-session
// @desc    Create Stripe checkout session for subscription
// @access  Private
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier, userId } = req.body;

    if (!SUBSCRIPTION_PLANS[tier]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid subscription tier' 
      });
    }

    if (tier === 'Apprentice') {
      return res.status(400).json({ 
        success: false, 
        message: 'Apprentice tier is free, no payment needed' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: SUBSCRIPTION_PLANS[tier].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: userId,
        tier: tier
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating checkout session',
      error: error.message 
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook events
// @access  Public (but verified by Stripe)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleSubscriptionCancelled(deletedSubscription);
      break;

    case 'invoice.payment_failed':
      const invoice = event.data.object;
      await handlePaymentFailed(invoice);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Handle successful checkout
async function handleCheckoutComplete(session) {
  try {
    const { userId, tier } = session.metadata;

    // Update user's professional profile with new subscription
    const professional = await Professional.findOne({ user: userId });
    
    if (professional) {
      professional.subscriptionTier = tier;
      professional.stripeCustomerId = session.customer;
      professional.stripeSubscriptionId = session.subscription;
      professional.subscriptionStatus = 'active';
      await professional.save();
    }

    console.log(`✅ Subscription activated: User ${userId} → ${tier} tier`);
  } catch (error) {
    console.error('Error handling checkout complete:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  try {
    const professional = await Professional.findOne({ 
      stripeSubscriptionId: subscription.id 
    });

    if (professional) {
      professional.subscriptionStatus = subscription.status;
      await professional.save();
    }

    console.log(`✅ Subscription updated: ${subscription.id} → ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
  try {
    const professional = await Professional.findOne({ 
      stripeSubscriptionId: subscription.id 
    });

    if (professional) {
      professional.subscriptionTier = 'Apprentice';
      professional.subscriptionStatus = 'cancelled';
      await professional.save();
    }

    console.log(`✅ Subscription cancelled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  try {
    const professional = await Professional.findOne({ 
      stripeCustomerId: invoice.customer 
    });

    if (professional) {
      professional.subscriptionStatus = 'past_due';
      await professional.save();

      // TODO: Send email notification to user
      console.log(`⚠️ Payment failed for user: ${professional.user}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// @route   POST /api/payments/create-portal-session
// @desc    Create Stripe customer portal session for managing subscription
// @access  Private
router.post('/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body;

    const professional = await Professional.findOne({ user: userId });
    
    if (!professional || !professional.stripeCustomerId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active subscription found' 
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: professional.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating portal session' 
    });
  }
});

// @route   GET /api/payments/subscription-status/:userId
// @desc    Get user's current subscription status
// @access  Private
router.get('/subscription-status/:userId', async (req, res) => {
  try {
    const professional = await Professional.findOne({ user: req.params.userId });

    if (!professional) {
      return res.json({
        success: true,
        tier: 'Apprentice',
        status: 'active',
        features: SUBSCRIPTION_PLANS.Apprentice.features
      });
    }

    res.json({
      success: true,
      tier: professional.subscriptionTier || 'Apprentice',
      status: professional.subscriptionStatus || 'active',
      features: SUBSCRIPTION_PLANS[professional.subscriptionTier || 'Apprentice'].features,
      hasActiveSubscription: professional.subscriptionStatus === 'active'
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting subscription status' 
    });
  }
});

// @route   POST /api/payments/cancel-subscription
// @desc    Cancel user's subscription
// @access  Private
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;

    const professional = await Professional.findOne({ user: userId });
    
    if (!professional || !professional.stripeSubscriptionId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active subscription found' 
      });
    }

    // Cancel at period end (user keeps access until billing cycle ends)
    await stripe.subscriptions.update(professional.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of billing period'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling subscription' 
    });
  }
});

// @route   GET /api/payments/plans
// @desc    Get all available subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  const plans = Object.keys(SUBSCRIPTION_PLANS).map(tier => ({
    tier,
    price: SUBSCRIPTION_PLANS[tier].price / 100, // Convert cents to dollars
    features: SUBSCRIPTION_PLANS[tier].features
  }));

  res.json({
    success: true,
    plans
  });
});

module.exports = router;
