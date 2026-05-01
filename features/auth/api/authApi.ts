// features/auth/api/authApi.ts
import { apiClient } from '@/shared/api/client';
import { LoginDto, RegisterDto, User, AuthTokens } from '@/entities/user/model/types';

export const authApi = {
  login: async (dto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await apiClient.post('/auth/login', dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await apiClient.post('/auth/register', dto);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  impersonate: async (userId: string): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await apiClient.post(`/auth/impersonate/${userId}`);
    return data;
  },
};
