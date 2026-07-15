// entities/apostilization/model/types.ts

export type PaymentType = 'cash' | 'card' | 'mixed';

export type OrderStatus = 'IN_PROGRESS' | 'DONE';

export interface Apostilization {
  id: string;
  clientName: string;
  contact: string;

  documentType: string;
  whatToDo: string;
  notes: string | null;

  sum: number;
  deposit: number;
  remainingAmount: number;
  costPrice: number;

  paymentType: PaymentType;
  status: OrderStatus;

  dateOfTaking: string; // ISO date
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime

  userId: string;
}
