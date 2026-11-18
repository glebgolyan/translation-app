import { AxiosInstance } from 'axios';
import { apiClient } from '@/shared/api/client';
import { MonthlyFinancials } from '@/entities/dashboard/model/types';

export const dashboardApi = {
  getMonthlyFinancials: async (
    months: number,
    client: AxiosInstance = apiClient
  ): Promise<MonthlyFinancials[]> => {
    const { data } = await client.get(`/dashboard/monthly-financials?months=${months}`);
    return data;
  },
};
