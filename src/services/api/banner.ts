import apiClient from '@/lib/api-client';

export const bannerApi = {
  getActive: () => apiClient.get('/banner/active'),
  getByCategory: (category: string) => apiClient.get(`/banner/bannersByCategory/${category}`),
};
