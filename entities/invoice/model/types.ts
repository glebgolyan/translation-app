// entities/invoice/model/types.ts

// monobank acquiring invoice statuses, verbatim from the backend enum.
export type InvoiceStatus =
  'created' | 'processing' | 'hold' | 'success' | 'failure' | 'reversed' | 'expired';

export interface Invoice {
  id: string;
  orderId: string;
  orderNumber: number;
  monoInvoiceId: string;
  pageUrl: string;
  amount: number; // kopecks
  status: InvoiceStatus;
  monoModifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
