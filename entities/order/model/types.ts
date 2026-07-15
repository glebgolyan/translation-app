// entities/order/model/types.ts

export type OrderStatus =
  'NEW' | 'IN_PROGRESS' | 'DONE' | 'PAID' | 'CANCELLED' | 'CERTIFIED' | 'TAKEN';
export type PaymentType = 'cash' | 'card' | 'mixed';

export interface Order {
  id: string;
  createdAt: string;
  dueDate: string;
  orderNumber: number;
  sourceLanguage: string;
  targetLanguage: string;
  clientName: string;
  phone: string;
  documentType: string;
  documentCount: number;
  notarizationCount: number;
  totalPrice: number;
  deposit: number;
  remainingAmount: number;
  paymentType: PaymentType;
  cardAmount?: number;
  translatorId?: string;
  comment?: string;
  translator?: {
    id: string;
    name: string;
    email: string;
  };
  status: OrderStatus;
  originalFiles: string[];
  translatedFiles: string[];
  filesDeletedAt?: Date | null;
  clientId: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface CreateOrderDto {
  sourceLanguage: string;
  targetLanguage: string;
  documentType?: string;
  originalFiles?: string[];
}

export interface UpdateOrderDto {
  dueDate?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  clientName?: string;
  phone?: string;
  documentType?: string;
  documentCount?: number;
  notarizationCount?: number;
  totalPrice?: number;
  deposit?: number;
  remainingAmount?: number;
  paymentType?: PaymentType;
  cardAmount?: number;
  comment?: string;
  translatorId?: string;
  status?: OrderStatus;
  originalFiles?: string[];
  translatedFiles?: string[];
}

export interface OrderFilters {
  status?: OrderStatus;
  sourceLanguage?: string;
  targetLanguage?: string;
  translatorId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
