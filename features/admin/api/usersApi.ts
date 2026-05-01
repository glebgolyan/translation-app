// features/admin/api/usersApi.ts
import { apiClient } from '@/shared/api/client';
import { User, UserRole } from '@/entities/user/model/types';

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get('/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  updateRole: async (id: string, role: UserRole): Promise<User> => {
    const { data } = await apiClient.patch(`/users/${id}/role`, { role });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getTranslators: async (): Promise<User[]> => {
    const { data } = await apiClient.get('/users?role=TRANSLATOR');
    return data;
  },
};
