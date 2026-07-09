import { apiClient } from '@/shared/api/client';
import { Apostilization } from "@/entities/apostilization/model/types";

export const apostilizationApi = {
    create: async (dto: any) => {
        const { data } = await apiClient.post('/apostilization', dto);
        return data;
    },

    getAll: async (filters?: { month?: string; search?: string }):Promise<Apostilization[]> => {
        const params = new URLSearchParams();
        if (filters?.month) params.append('month', filters.month);
        if (filters?.search) params.append('search', filters.search);
        const { data } = await apiClient.get(`/apostilization?${params.toString()}`);
        return data;
    },

    getById: async (id: string) => {
        const { data } = await apiClient.get(`/apostilization/${id}`);
        return data;
    },

    update: async (id: string, dto: any) => {
        const { data } = await apiClient.patch(`/apostilization/${id}`, dto);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await apiClient.delete(`/apostilization/${id}`);
        return data;
    },
};