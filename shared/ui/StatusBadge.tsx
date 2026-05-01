'use client';
// shared/ui/StatusBadge.tsx
import { Badge } from '@chakra-ui/react';
import { OrderStatus } from '@/entities/order/model/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; colorScheme: string }> = {
  NEW: { label: 'NEW', colorScheme: 'blue' },
  IN_PROGRESS: { label: 'IN PROGRESS', colorScheme: 'orange' },
  DONE: { label: 'DONE', colorScheme: 'green' },
  PAID: { label: 'PAID', colorScheme: 'purple' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge colorScheme={config.colorScheme} variant="subtle" px={2} py={0.5}>
      {config.label}
    </Badge>
  );
}
