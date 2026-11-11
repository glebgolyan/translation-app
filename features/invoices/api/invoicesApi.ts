// features/invoices/api/invoicesApi.ts
import { apiClient } from '@/shared/api/client';
import { Invoice } from '@/entities/invoice/model/types';

export const invoicesApi = {
  list: async (orderId: string): Promise<Invoice[]> => {
    const { data } = await apiClient.get(`/orders/${orderId}/invoices`);
    return data;
  },

  // amount in UAH; the backend converts to kopecks.
  create: async (orderId: string, amount: number): Promise<Invoice> => {
    const { data } = await apiClient.post(`/orders/${orderId}/invoices`, { amount });
    return data;
  },

  refresh: async (orderId: string, invoiceId: string): Promise<Invoice> => {
    const { data } = await apiClient.post(`/orders/${orderId}/invoices/${invoiceId}/refresh`);
    return data;
  },
};
