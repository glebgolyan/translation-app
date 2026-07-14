// features/orders/api/ordersApi.ts
import { apiClient } from '@/shared/api/client';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  OrderFilters,
  PaginatedOrders,
} from '@/entities/order/model/types';

export const ordersApi = {
  getAll: async (filters?: OrderFilters): Promise<PaginatedOrders> => {
    const { data } = await apiClient.get('/orders', { params: filters });
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

  uploadFiles: async (orderId: string, files: File[], type: 'original' | 'translated'): Promise<Order> => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('type', type);
    console.log('--files--', files)
    console.log('--formData--', formData)
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
