'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { paymentsApi } from '@/lib/api/payments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

interface PricingTier {
  name: string;
  price: number;
  priceId: string;
  featuresKey: string;
  popular?: boolean;
  icon: React.ReactNode;
}

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const tiers: PricingTier[] = [
    {
      name: t('subscription.plans.basic.name'),
      price: 0,
      priceId: 'free',
      icon: <Zap className="w-8 h-8" />,
      featuresKey: 'basic',
    },
    {
      name: t('subscription.plans.professional.name'),
      price: 29,
      priceId: 'price_professional',
      icon: <Crown className="w-8 h-8" />,
      popular: true,
      featuresKey: 'professional',
    },
    {
      name: t('subscription.plans.enterprise.name'),
      price: 99,
      priceId: 'price_enterprise',
      icon: <Crown className="w-8 h-8" />,
      featuresKey: 'enterprise',
    },
  ];

  const getFeatures = (key: string): string[] => {
    const features: Record<string, string[]> = {
      basic: [
        t('subscription.plans.basic.features.projects'),
        t('subscription.plans.basic.features.search'),
        t('subscription.plans.basic.features.messaging'),
        t('subscription.plans.basic.features.support'),
      ],
      professional: [
        t('subscription.plans.professional.features.projects'),
        t('subscription.plans.professional.features.search'),
        t('subscription.plans.professional.features.messaging'),
        t('subscription.plans.professional.features.ai'),
        t('subscription.plans.professional.features.verification'),
        t('subscription.plans.professional.features.support'),
        t('subscription.plans.professional.features.stats'),
        t('subscription.plans.professional.features.badge'),
      ],
      enterprise: [
        t('subscription.plans.enterprise.features.all'),
        t('subscription.plans.enterprise.features.multiUser'),
        t('subscription.plans.enterprise.features.api'),
        t('subscription.plans.enterprise.features.manager'),
        t('subscription.plans.enterprise.features.billing'),
        t('subscription.plans.enterprise.features.contracts'),
        t('subscription.plans.enterprise.features.training'),
      ],
    };
    return features[key] || [];
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (priceId === 'free') {
      return; // Already on free tier
    }

    try {
      setLoading(priceId);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await paymentsApi.createCheckoutSession(priceId, token) as any;

      if (response?.success && response?.url) {
        window.location.href = response.url;
      } else {
        setError(t('errors.paymentProcess'));
      }
    } catch (err: any) {
      setError(err.message || t('errors.subscription'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('subscription.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('subscription.subtitle')}
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.priceId}
              className={`relative ${
                tier.popular
                  ? 'border-2 border-blue-500 shadow-xl'
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge variant="success" className="text-sm px-4 py-1">
                    {t('subscription.mostPopular')}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-4 rounded-full mb-4 ${
                  tier.popular
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-gray-600">/{t('subscription.month')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {getFeatures(tier.featuresKey).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(tier.priceId)}
                disabled={loading === tier.priceId}
                className={`w-full ${
                  tier.popular
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : ''
                }`}
              >
                {loading === tier.priceId ? (
                  <Spinner size="sm" />
                ) : tier.price === 0 ? (
                  t('subscription.free')
                ) : (
                  t('subscription.subscribe')
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            {t('subscription.faq.title')}
          </h2>
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {t('subscription.faq.cancel.question')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.cancel.answer')}
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {t('subscription.faq.payment.question')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.payment.answer')}
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {t('subscription.faq.annual.question')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.annual.answer')}
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {t('subscription.faq.change.question')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.change.answer')}
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            {t('subscription.needHelp')}
          </p>
          <Button variant="ghost" onClick={() => router.push('/contact')}>
            {t('subscription.contactSales')}
          </Button>
        </div>
      </div>
    </div>
  );
}
