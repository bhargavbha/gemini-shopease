import apiClient from '@/lib/api-client';

export const couponApi = {
  getApplicable: (cartId: string) =>
    apiClient.get(`/coupon/carts/${cartId}/applicable-coupons`),
};
