import apiClient from '@/lib/api-client';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/user-login', { email, password }),
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register/user', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: Record<string, unknown>) => apiClient.put('/auth/update', data),
};

// Categories
export const categoryApi = {
  getAll: () => apiClient.get('/categories/get-categories'),
};

// Products
export const productApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/products/', { params }),
  search: (query: string) => apiClient.get('/products/search', { params: { query } }),
  filter: (params: Record<string, unknown>) => apiClient.get('/products/filter', { params }),
  bestsellers: () => apiClient.get('/products/bestsellers'),
  trending: () => apiClient.get('/products/trending'),
  recent: () => apiClient.get('/products/recent'),
  byCategory: (categoryId: string) => apiClient.get(`/products/by-category/${categoryId}`),
  details: (productId: string) => apiClient.get(`/products/details/${productId}`),
  sameCategory: (productId: string) => apiClient.get(`/products/same-category/${productId}`),
  sameVendor: (productId: string) => apiClient.get(`/products/same-vendor/${productId}`),
};

// Cart
export const cartApi = {
  get: (userId: string) => apiClient.get(`/cart/${userId}`),
  add: (data: { user_id: string; product_id: string; quantity: number }) =>
    apiClient.post('/cart/add', data),
  remove: (data: { user_id: string; product_id: string }) =>
    apiClient.delete('/cart/remove', { data }),
  moveToWishlist: (userId: string) =>
    apiClient.post(`/cart/move-to-wishlist/${userId}`),
};

// Wishlist
export const wishlistApi = {
  get: (userId: string) => apiClient.get(`/wishlist/${userId}`),
  add: (userId: string, data: { product_id: string }) =>
    apiClient.post(`/wishlist/add/${userId}`, data),
  remove: (userId: string, data: { product_id: string }) =>
    apiClient.delete(`/wishlist/remove/${userId}`, { data }),
};

// Address
export const addressApi = {
  getAll: (userId: string) => apiClient.get(`/address/users/${userId}/`),
  addShipping: (data: Record<string, unknown>) =>
    apiClient.post('/address/add-shipping-address', data),
  addBilling: (data: Record<string, unknown>) =>
    apiClient.post('/address/add-billing-address', data),
  setDefault: (addressId: string) =>
    apiClient.put(`/address/set-default/${addressId}`),
};

// Coupons
export const couponApi = {
  getApplicable: (cartId: string) =>
    apiClient.get(`/coupon/carts/${cartId}/applicable-coupons`),
};

// Payment
export const paymentApi = {
  createCheckoutSession: (data: Record<string, unknown>) =>
    apiClient.post('/payment/create-checkout-session', data),
};

// Orders
export const orderApi = {
  getAll: (userId: string) => apiClient.get(`/order/${userId}`),
  getDetails: (userId: string, orderId: string) =>
    apiClient.get(`/order/detailed/${userId}/${orderId}`),
};

// Banners
export const bannerApi = {
  getActive: () => apiClient.get('/banner/active'),
};

// Reviews
export const reviewApi = {
  getWebsiteReviews: () => apiClient.get('/website-reviews/approved'),
  getProductReviews: (productId: string) =>
    apiClient.get(`/reviews/product/${productId}`),
  addReview: (data: Record<string, unknown>) =>
    apiClient.post('/reviews/add', data),
};
