import apiClient from '@/lib/api-client';

export const websiteReviewApi = {
  getApproved: () => apiClient.get('/website-reviews/approved'),
  add: (data: Record<string, unknown>) => apiClient.post('/website-reviews/add', data),
};
