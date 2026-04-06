import apiClient from '@/lib/api-client';

export const reviewApi = {
  getProductReviews: (productId: string) => apiClient.get(`/reviews/product/${productId}`),
  addReview: (data: Record<string, unknown>) => apiClient.post('/reviews/add', data),
  getWebsiteReviews: () => apiClient.get('/website-reviews/approved'), // kept for legacy compat if used
};
