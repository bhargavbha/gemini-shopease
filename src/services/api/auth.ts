import apiClient from '@/lib/api-client';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/user-login', { email, password }),
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register/user', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: Record<string, unknown>) => apiClient.put('/auth/update', data),
};
