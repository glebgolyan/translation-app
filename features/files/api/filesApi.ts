import { apiClient } from '@/shared/api/client';

export const filesApi = {
    downloadByDateRange: async (dateFrom: string, dateTo: string) => {
        const response = await apiClient.get('/files/download-by-date', {
            params: { dateFrom, dateTo },
            responseType: 'blob',
        });

        // Trigger download
        const url = URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-files-${dateFrom}-to-${dateTo}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    deleteByDateRange: async (dateFrom: string, dateTo: string) => {
        const { data } = await apiClient.delete('/files/by-date', {
            params: { dateFrom, dateTo },
        });
        return data;
    },
};