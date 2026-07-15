import { apiClient } from '@/shared/api/client';

export const messagesApi = {
  getAllConversations: async () => {
    const { data } = await apiClient.get('/messages/conversations/all');
    return data;
  },

  getTranslatorConversations: async () => {
    const { data } = await apiClient.get('/messages/conversations/translator');
    return data;
  },

  getOrderMessages: async (orderId: string) => {
    const { data } = await apiClient.get(`/messages/order/${orderId}`);
    return data;
  },

  getTranslatorMessages: async (translatorId: string) => {
    const { data } = await apiClient.get(`/messages/translator/${translatorId}`);
    return data;
  },

  sendMessage: async (dto: any) => {
    const { data } = await apiClient.post('/messages', dto);
    return data;
  },

  markAsRead: async (messageIds: string[]) => {
    const { data } = await apiClient.post('/messages/mark-read', { messageIds });
    return data;
  },

  getUnreadCount: async (userId: string, orderId?: string) => {
    const url = orderId
      ? `/messages/unread/order/${orderId}/${userId}`
      : `/messages/unread/${userId}`;
    const { data } = await apiClient.get(url);
    return data;
  },
};
