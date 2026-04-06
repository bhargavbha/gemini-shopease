import apiClient from '@/lib/api-client';

export const cartApi = {
  add: (data: { user_id: string; product_id: string; quantity: number }) =>
    apiClient.post('/cart/add', data),
  get: (userId: string) => apiClient.get(`/cart/${userId}`),
  remove: (data: { user_id: string; product_id: string }) =>
    apiClient.delete('/cart/remove', { data }),
  moveToWishlist: (userId: string) =>
    apiClient.post(`/cart/move-to-wishlist/${userId}`),
};
