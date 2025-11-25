import { api } from './client';

export const paymentsApi = {
  createCheckoutSession: (tier: string, userId: string) =>
    api.post('/payments/create-checkout-session', { tier, userId }),

  getSubscriptionStatus: (userId: string) =>
    api.get(`/payments/subscription-status/${userId}`),
};
