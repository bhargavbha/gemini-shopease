import apiClient from '@/lib/api-client';

export const wishlistApi = {
  add: (userId: string, data: { product_id: string }) =>
    apiClient.post(`/wishlist/add/${userId}`, data),
  get: (userId: string) => apiClient.get(`/wishlist/${userId}`),
  remove: (userId: string, data: { product_id: string }) =>
    apiClient.delete(`/wishlist/remove/${userId}`, { data }),
};
