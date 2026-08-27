import { apiClient } from '@/shared/api/client';
import {
  CreateOrderRequestInput,
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

  // Admin-authenticated equivalent of the public order-request form —
  // for manually logging a request (e.g. a phone-in lead) or testing the
  // pipeline without the marketing site's form.
  createManual: async (
    dto: CreateOrderRequestInput,
    files: File[]
  ): Promise<{ id: string; createdAt: string }> => {
    const formData = new FormData();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== '') formData.append(key, value);
    });
    files.forEach((f) => formData.append('files', f));
    const { data } = await apiClient.post('/order-requests/manual', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
