const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  tier: {
    type: String,
    enum: ['Apprentice', 'Journeyman', 'Master', 'Enterprise'],
    default: 'Apprentice'
  },
  
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'trialing', 'unpaid'],
    default: 'active'
  },
  
  stripeCustomerId: {
    type: String,
    required: false
  },
  
  stripeSubscriptionId: {
    type: String,
    required: false
  },
  
  stripePriceId: {
    type: String,
    required: false
  },
  
  currentPeriodStart: {
    type: Date
  },
  
  currentPeriodEnd: {
    type: Date
  },
  
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  
  trialStart: {
    type: Date
  },
  
  trialEnd: {
    type: Date
  },
  
  features: {
    maxProjects: {
      type: Number,
      default: 5
    },
    maxImages: {
      type: Number,
      default: 25
    },
    aiAnalysisLimit: {
      type: Number,
      default: 0
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    }
  },
  
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: String,
    invoiceId: String,
    paidAt: Date,
    description: String
  }]
}, {
  timestamps: true
});

// Method to check if user has access to a feature
subscriptionSchema.methods.hasFeature = function(feature) {
  const tierFeatures = {
    'Apprentice': {
      maxProjects: 5,
      maxImages: 25,
      aiAnalysisLimit: 0,
      prioritySupport: false,
      customBranding: false,
      advancedAnalytics: false
    },
    'Journeyman': {
      maxProjects: -1, // unlimited
      maxImages: 100,
      aiAnalysisLimit: 100,
      prioritySupport: false,
      customBranding: false,
      advancedAnalytics: false
    },
    'Master': {
      maxProjects: -1,
      maxImages: -1,
      aiAnalysisLimit: -1,
      prioritySupport: true,
      customBranding: true,
      advancedAnalytics: true
    },
    'Enterprise': {
      maxProjects: -1,
      maxImages: -1,
      aiAnalysisLimit: -1,
      prioritySupport: true,
      customBranding: true,
      advancedAnalytics: true
    }
  };
  
  return tierFeatures[this.tier][feature];
};

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  if (this.tier === 'Apprentice') return true; // Free tier always active
  
  return this.status === 'active' || this.status === 'trialing';
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
