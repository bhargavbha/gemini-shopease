import apiClient from '@/lib/api-client';

export const categoryApi = {
  getAll: () => apiClient.get('/categories/get-categories'),
};
