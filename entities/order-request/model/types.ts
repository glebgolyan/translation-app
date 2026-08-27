// entities/order-request/model/types.ts

export type PreferredContact = 'EMAIL' | 'VIBER' | 'WHATSAPP' | 'TELEGRAM';

export interface OrderRequest {
  id: string;
  createdAt: string;
  sourceLanguage: string;
  targetLanguage: string;
  clientName: string;
  phone: string;
  email?: string | null;
  preferredContact: PreferredContact;
  files: string[];
  ipAddress?: string | null;
  convertedOrderId?: string | null;
  convertedAt?: string | null;
}

export interface OrderRequestFilters {
  search?: string;
  converted?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedOrderRequests {
  data: OrderRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
