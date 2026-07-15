import { apiClient } from '@/shared/api/client';
import { User } from '@/entities/user/model/types';

export const profileApi = {
  update: async (dto: {
    name?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> => {
    const { data } = await apiClient.patch('/users/profile', dto);
    return data;
  },
};
