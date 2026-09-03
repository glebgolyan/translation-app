// features/orders/api/ordersApi.ts
import { AxiosInstance } from 'axios';
import { apiClient } from '@/shared/api/client';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  OrderFilters,
  PaginatedOrders,
} from '@/entities/order/model/types';

export const ordersApi = {
  // Optional `client` lets Server Components prefetch with
  // shared/api/serverClient.ts's server-side axios instance instead of the
  // browser-cookie-based default — same query, same function, no duplication.
  getAll: async (filters?: OrderFilters, client: AxiosInstance = apiClient): Promise<PaginatedOrders> => {
    const { data } = await client.get('/orders', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },

  create: async (dto: CreateOrderDto): Promise<Order> => {
    const { data } = await apiClient.post('/orders', dto);
    return data;
  },

  update: async (id: string, dto: UpdateOrderDto): Promise<Order> => {
    const { data } = await apiClient.patch(`/orders/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  assignTranslator: async (orderId: string, translatorId: string): Promise<Order> => {
    const { data } = await apiClient.patch(`/orders/${orderId}/assign`, { translatorId });
    return data;
  },

  uploadFiles: async (
    orderId: string,
    files: File[],
    type: 'original' | 'translated'
  ): Promise<Order> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('type', type);
    console.log('--files--', files);
    console.log('--formData--', formData);
    const { data } = await apiClient.post(`/orders/${orderId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  removeFile: async (orderId: string, filePath: string, fileType: 'original' | 'translated') => {
    const { data } = await apiClient.delete(`/orders/${orderId}/files`, {
      data: { filePath, fileType },
    });
    return data;
  },
};
