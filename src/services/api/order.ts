import apiClient from '@/lib/api-client';

export const orderApi = {
  getAll: (userId: string) => apiClient.get(`/order/${userId}`),
  getDetails: (userId: string, orderId: string) =>
    apiClient.get(`/order/detailed/${userId}/${orderId}`),
};
