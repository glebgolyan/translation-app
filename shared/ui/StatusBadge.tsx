'use client';
// shared/ui/StatusBadge.tsx
import { Badge } from '@chakra-ui/react';
import { OrderStatus } from '@/entities/order/model/types';
import { useStatusConfig } from "@/widgets/order-table/hook/useStatusConfig";


export function StatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig = useStatusConfig();
  return (
    <Badge colorScheme={statusConfig[status].colorScheme} variant="subtle" px={2} py={0.5}>
      {statusConfig[status].label}
    </Badge>
  );
}
