import apiClient from '@/lib/api-client';

export const productApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/products/', { params }),
  byVendor: (vendorId: string) => apiClient.get(`/products/vendor/${vendorId}`),
  details: (productId: string) => apiClient.get(`/products/details/${productId}`),
  byCategory: (categoryId: string) => apiClient.get(`/products/by-category/${categoryId}`),
  sameCategory: (productId: string) => apiClient.get(`/products/same-category/${productId}`),
  sameVendor: (productId: string) => apiClient.get(`/products/same-vendor/${productId}`),
  search: (query: string) => apiClient.get('/products/search', { params: { query } }),
  filter: (params: Record<string, unknown>) => apiClient.get('/products/filter', { params }),
  bestsellers: () => apiClient.get('/products/bestsellers'),
  trending: () => apiClient.get('/products/trending'),
  recent: () => apiClient.get('/products/recent'),
  updateGoldPrices: (data?: Record<string, unknown>) => apiClient.put('/products/update-gold-prices', data),
};
