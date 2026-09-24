'use client';
// entities/order/ui/StatusBadge.tsx
import { Badge } from '@chakra-ui/react';
import { OrderStatus } from '../model/types';
import { useStatusConfig } from '../lib/useStatusConfig';

export function StatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig = useStatusConfig();
  return (
    <Badge
      colorScheme={statusConfig[status].colorScheme}
      variant='subtle'
      px={2}
      py={0.5}
    >
      {statusConfig[status].label}
    </Badge>
  );
}
