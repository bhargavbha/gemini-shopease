import apiClient from '@/lib/api-client';

export const invoiceApi = {
  getInvoice: (orderId: string) => apiClient.get(`/invoice/${orderId}/invoice`),
};
