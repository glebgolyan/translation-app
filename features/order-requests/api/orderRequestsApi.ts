import { apiClient } from '@/shared/api/client';
import {
  OrderRequest,
  OrderRequestFilters,
  PaginatedOrderRequests,
} from '@/entities/order-request/model/types';
import { Order, UpdateOrderDto } from '@/entities/order/model/types';

export const orderRequestsApi = {
  getAll: async (filters?: OrderRequestFilters): Promise<PaginatedOrderRequests> => {
    const { data } = await apiClient.get('/order-requests', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<OrderRequest> => {
    const { data } = await apiClient.get(`/order-requests/${id}`);
    return data;
  },

  convert: async (id: string, dto: Partial<UpdateOrderDto>): Promise<Order> => {
    const { data } = await apiClient.post(`/order-requests/${id}/convert`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/order-requests/${id}`);
  },
};
