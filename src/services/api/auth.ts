import apiClient from '@/lib/api-client';

export const authApi = {
  login: (idToken: string) =>
    apiClient.post('/auth/user-login', { idToken }),
  register: (data: { first_name: string; last_name: string; email: string; phone_no: string }) =>
    apiClient.post('/auth/register/user', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: Record<string, unknown>) => apiClient.put('/auth/update', data),
};
