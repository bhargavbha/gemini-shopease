import apiClient from '@/lib/api-client';

export const paymentApi = {
  createCheckoutSession: (data: Record<string, unknown>) =>
    apiClient.post('/payment/create-checkout-session', data),
  webhook: (data: any) => apiClient.post('/payment/webhook', data),
};
