import { AxiosInstance } from 'axios';
import { apiClient } from '@/shared/api/client';
import { TranslatorStatsEntry } from '@/entities/translator-stats/model/types';

export const translatorStatsApi = {
  getByMonth: async (month: string, client: AxiosInstance = apiClient) => {
    const { data } = await client.get(`/translator-stats?month=${month}`);
    return data;
  },

  getEntriesByOrder: async (orderId: string, client: AxiosInstance = apiClient) => {
    const { data } = await client.get<TranslatorStatsEntry[]>(
      `/translator-stats/entries?orderId=${orderId}`
    );
    return data;
  },

  createEntry: async (dto: {
    translatorId: string;
    month: string;
    day: number;
    orderId?: string;
    wordsCount: number;
    price: number;
  }) => {
    const { data } = await apiClient.post<TranslatorStatsEntry>('/translator-stats/entries', dto);
    return data;
  },

  updateEntry: async (id: string, dto: { wordsCount: number; price: number }) => {
    const { data } = await apiClient.patch<TranslatorStatsEntry>(
      `/translator-stats/entries/${id}`,
      dto
    );
    return data;
  },

  deleteEntry: async (id: string) => {
    await apiClient.delete(`/translator-stats/entries/${id}`);
  },
};
