import apiClient from '@/lib/api-client';

export const addressApi = {
  addShipping: (data: Record<string, unknown>) =>
    apiClient.post('/address/add-shipping-address', data),
  addBilling: (data: Record<string, unknown>) =>
    apiClient.post('/address/add-billing-address', data),
  getAll: (userId: string) => apiClient.get(`/address/users/${userId}/`),
  setDefault: (addressId: string) =>
    apiClient.put(`/address/set-default/${addressId}`),
};
