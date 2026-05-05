'use client';
import {
  Box, Table, Thead, Tbody, Tr, Td, Th, Flex, Icon,
  Center, Spinner, Text, useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { RiSortAsc, RiSortDesc } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { Order, OrderFilters } from '@/entities/order/model/types';
import { UserRole } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';
import { TableFilters } from './components/TableFilters';
import { TablePagination } from './components/TablePagination';
import { OrderRow } from './components/OrderRow';

interface Column {
  key: string;
  labelKey: string;
  sortable?: boolean;
  roles?: UserRole[];
}

const COLUMNS: Column[] = [
  { key: 'createdAt', labelKey: 'orders.received', sortable: true },
  { key: 'dueDate', labelKey: 'orders.deadline', sortable: true },
  { key: 'languages', labelKey: 'orders.languages' },
  { key: 'clientName', labelKey: 'orders.clientName', sortable: true, roles: ['MANAGER', 'ADMIN'] },
  { key: 'documentType', labelKey: 'orders.documentType', roles: ['MANAGER', 'ADMIN'] },
  { key: 'documentCount', labelKey: 'orders.documentCount', roles: ['MANAGER', 'ADMIN'] },
  { key: 'totalPrice', labelKey: 'orders.totalPrice', sortable: true, roles: ['MANAGER', 'ADMIN'] },
  { key: 'deposit', labelKey: 'orders.deposit', roles: ['MANAGER', 'ADMIN'] },
  { key: 'remainingAmount', labelKey: 'orders.remaining', roles: ['MANAGER', 'ADMIN'] },
  { key: 'paymentType', labelKey: 'orders.paymentType', roles: ['MANAGER', 'ADMIN'] },
  { key: 'translator', labelKey: 'orders.translator', roles: ['MANAGER', 'ADMIN'] },
  { key: 'originalFiles', labelKey: 'orders.files' },
  { key: 'status', labelKey: 'orders.status', sortable: true },
];

interface OrderTableProps {
  userRole: UserRole;
  onEdit?: (order: Order) => void;
  onView?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

export function OrderTable({ userRole, onEdit, onView, onDelete }: OrderTableProps) {
  const { t } = useT();

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const labelColor = useColorModeValue('gray.400', '#666666');
  const valueColor = useColorModeValue('gray.900', '#f0f0f0');
  const helpColor = useColorModeValue('gray.500', '#888888');

  const [filters, setFilters] = useState<OrderFilters>({
    page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getAll(filters),
  });

  const orders = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const visibleColumns = COLUMNS.filter(col => !col.roles || col.roles.includes(userRole));

  const handleSort = (key: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
      <Box>
        <TableFilters filters={filters} total={total} onChange={setFilters} />

        <Box bg={bg} borderRadius="8px" border="1px solid" borderColor={borderColor} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg={bg}>
                <Tr>
                  {visibleColumns.map(col => (
                      <Th
                          key={col.key}
                          onClick={() => col.sortable && handleSort(col.key)}
                          cursor={col.sortable ? 'pointer' : 'default'}
                          userSelect="none"
                          // t
                          _hover={col.sortable ? { color: 'brand.600' } : {}}
                      >
                        <Flex align="center" gap={1}>
                          {t(col.labelKey)}
                          {filters.sortBy === col.key && (
                              <Icon as={filters.sortOrder === 'asc' ? RiSortAsc : RiSortDesc} boxSize={3} />
                          )}
                        </Flex>
                      </Th>
                  ))}
                  <Th>{t('users.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                    <Tr><Td colSpan={visibleColumns.length + 1}>
                      <Center py={12}><Spinner size="md" color={helpColor} /></Center>
                    </Td></Tr>
                ) : orders.length === 0 ? (
                    <Tr><Td colSpan={visibleColumns.length + 1}>
                      <Center py={12}><Text color={labelColor} fontSize="14px">No orders found</Text></Center>
                    </Td></Tr>
                ) : (
                    orders.map(order => (
                        <OrderRow
                            key={order.id}
                            order={order}
                            visibleColumns={visibleColumns}
                            userRole={userRole}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                )}
              </Tbody>
            </Table>
          </Box>

          <TablePagination
              page={filters.page || 1}
              totalPages={totalPages}
              filters={filters}
              onChange={setFilters}
          />
        </Box>
      </Box>
  );
}