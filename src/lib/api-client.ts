import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Extract vendorId from the URL path as we wrapped routes in /:vendor_id
  const pathParts = window.location.pathname.split('/');
  if (pathParts.length > 1 && pathParts[1] !== "") {
    const vendorId = pathParts[1];
    config.headers['x-vendor-id'] = vendorId;
    config.params = { ...config.params, vendor_id: vendorId };
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
