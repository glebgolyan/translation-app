import { apiClient } from '@/shared/api/client';

export const translatorStatsApi = {
    getByMonth: async (month: string) => {
        const { data } = await apiClient.get(`/translator-stats?month=${month}`);
        return data;
    },

    update: async (id: string, wordCount: number) => {
        const { data } = await apiClient.patch(`/translator-stats/${id}`, { wordCount });
        return data;
    },

    createOrUpdate: async (translatorId: string, month: string, day: number, wordCount: number) => {
        const { data } = await apiClient.patch('/translator-stats', {
            translatorId,
            month,
            day,
            wordCount,
        });
        return data;
    },
};