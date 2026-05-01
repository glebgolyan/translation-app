'use client';
// widgets/order-table/OrderTable.tsx
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Text, Icon,
  IconButton, Input, InputGroup, InputLeftElement, Select,
  Button, HStack, useDisclosure, Spinner, Center, Tooltip,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import {
  RiSearchLine, RiSortAsc, RiSortDesc, RiEditLine,
  RiDeleteBinLine, RiEyeLine, RiArrowLeftLine, RiArrowRightLine,
  RiDownloadLine,
} from 'react-icons/ri';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Order, OrderFilters, OrderStatus, PaymentType } from '@/entities/order/model/types';
import { UserRole } from '@/entities/user/model/types';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  roles?: UserRole[];
  render?: (order: Order) => React.ReactNode;
}

const COLUMNS: Column[] = [
  {
    key: 'createdAt',
    label: 'Received',
    sortable: true,
    render: (o) => (
      <Text fontSize="13px" fontFamily="mono" color="gray.600">
        {new Date(o.createdAt).toLocaleDateString('uk-UA')}
      </Text>
    ),
  },
  {
    key: 'dueDate',
    label: 'Deadline',
    sortable: true,
    render: (o) => {
      const isLate = o.dueDate && new Date(o.dueDate) < new Date() && o.status !== 'DONE' && o.status !== 'PAID';
      return (
        <Text fontSize="13px" fontFamily="mono" color={isLate ? 'red.500' : 'gray.600'} fontWeight={isLate ? '600' : '400'}>
          {o.dueDate ? new Date(o.dueDate).toLocaleDateString('uk-UA') : '—'}
        </Text>
      );
    },
  },
  {
    key: 'languages',
    label: 'Languages',
    render: (o) => (
      <Text fontSize="13px" fontFamily="mono">
        {o.sourceLanguage} → {o.targetLanguage}
      </Text>
    ),
  },
  {
    key: 'clientName',
    label: 'Client',
    sortable: true,
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => (
      <Box>
        <Text fontSize="13px" fontWeight="500">{o.clientName}</Text>
        <Text fontSize="11px" color="gray.400">{o.phone}</Text>
      </Box>
    ),
  },
  {
    key: 'documentType',
    label: 'Doc Type',
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => <Text fontSize="13px">{o.documentType || '—'}</Text>,
  },
  {
    key: 'documentCount',
    label: 'Docs',
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => <Text fontSize="13px" textAlign="center">{o.documentCount}</Text>,
  },
  {
    key: 'totalPrice',
    label: 'Total',
    sortable: true,
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => (
      <Text fontSize="13px" fontFamily="mono" fontWeight="600">
        ₴{o.totalPrice.toLocaleString()}
      </Text>
    ),
  },
  {
    key: 'deposit',
    label: 'Deposit',
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => (
      <Text fontSize="13px" fontFamily="mono" color="green.600">
        ₴{o.deposit.toLocaleString()}
      </Text>
    ),
  },
  {
    key: 'remainingAmount',
    label: 'Remaining',
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => (
      <Text fontSize="13px" fontFamily="mono" color={o.remainingAmount > 0 ? 'orange.500' : 'gray.400'}>
        ₴{o.remainingAmount.toLocaleString()}
      </Text>
    ),
  },
  {
    key: 'paymentType',
    label: 'Payment',
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => (
      <Text fontSize="12px" textTransform="capitalize" color="gray.600">
        {o.paymentType}{o.cardAmount ? ` / ₴${o.cardAmount}` : ''}
      </Text>
    ),
  },
  {
    key: 'translator',
    label: 'Translator',
    roles: ['MANAGER', 'ADMIN'],
    render: (o) => (
      <Text fontSize="13px" color={o.translator ? 'gray.700' : 'gray.300'}>
        {o.translator?.name || 'Unassigned'}
      </Text>
    ),
  },
  {
    key: 'originalFiles',
    label: 'Files',
    render: (o) => (
      <HStack spacing={1}>
        {o.originalFiles.length > 0 && (
          <Tooltip label={`${o.originalFiles.length} original file(s)`}>
            <Flex align="center" gap={1}>
              <Icon as={RiDownloadLine} boxSize={3.5} color="blue.400" />
              <Text fontSize="11px" color="blue.400">{o.originalFiles.length}</Text>
            </Flex>
          </Tooltip>
        )}
        {o.translatedFiles.length > 0 && (
          <Tooltip label={`${o.translatedFiles.length} translated file(s)`}>
            <Flex align="center" gap={1} ml={1}>
              <Icon as={RiDownloadLine} boxSize={3.5} color="green.400" />
              <Text fontSize="11px" color="green.400">{o.translatedFiles.length}</Text>
            </Flex>
          </Tooltip>
        )}
        {o.originalFiles.length === 0 && o.translatedFiles.length === 0 && (
          <Text fontSize="11px" color="gray.300">—</Text>
        )}
      </HStack>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (o) => <StatusBadge status={o.status} />,
  },
];

interface OrderTableProps {
  userRole: UserRole;
  onEdit?: (order: Order) => void;
  onView?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

export function OrderTable({ userRole, onEdit, onView, onDelete }: OrderTableProps) {
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getAll(filters),
  });

  const orders = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const visibleColumns = COLUMNS.filter(
    col => !col.roles || col.roles.includes(userRole)
  );

  const handleSort = useCallback((key: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (filters.sortBy !== colKey) return null;
    return <Icon as={filters.sortOrder === 'asc' ? RiSortAsc : RiSortDesc} boxSize={3} ml={1} />;
  };

  return (
    <Box>
      {/* Filters toolbar */}
      <Flex gap={3} mb={4} align="center" flexWrap="wrap">
        <InputGroup maxW="280px" size="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={RiSearchLine} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search client, language…"
            value={filters.search || ''}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            bg="white"
            borderColor="gray.200"
          />
        </InputGroup>

        <Select
          size="sm"
          maxW="160px"
          bg="white"
          borderColor="gray.200"
          value={filters.status || ''}
          onChange={e => setFilters(prev => ({ ...prev, status: (e.target.value as OrderStatus) || undefined, page: 1 }))}
        >
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
          <option value="PAID">Paid</option>
        </Select>

        <Box ml="auto">
          <Text fontSize="13px" color="gray.400">{total} orders</Text>
        </Box>
      </Flex>

      {/* Table */}
      <Box bg="white" borderRadius="8px" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                {visibleColumns.map(col => (
                  <Th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    cursor={col.sortable ? 'pointer' : 'default'}
                    userSelect="none"
                    whiteSpace="nowrap"
                    _hover={col.sortable ? { color: 'brand.600' } : {}}
                  >
                    <Flex align="center">
                      {col.label}
                      <SortIcon colKey={col.key} />
                    </Flex>
                  </Th>
                ))}
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={visibleColumns.length + 1}>
                    <Center py={12}>
                      <Spinner size="md" color="brand.500" />
                    </Center>
                  </Td>
                </Tr>
              ) : orders.length === 0 ? (
                <Tr>
                  <Td colSpan={visibleColumns.length + 1}>
                    <Center py={12}>
                      <Text color="gray.400" fontSize="14px">No orders found</Text>
                    </Center>
                  </Td>
                </Tr>
              ) : (
                orders.map(order => (
                  <Tr
                    key={order.id}
                    _hover={{ bg: 'gray.50' }}
                    transition="background 0.1s"
                  >
                    {visibleColumns.map(col => (
                      <Td key={col.key} whiteSpace="nowrap">
                        {col.render ? col.render(order) : String((order as Record<string, unknown>)[col.key] ?? '—')}
                      </Td>
                    ))}
                    <Td>
                      <HStack spacing={1}>
                        {onView && (
                          <IconButton
                            aria-label="View"
                            icon={<Icon as={RiEyeLine} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="gray"
                            onClick={() => onView(order)}
                          />
                        )}
                        {onEdit && (userRole === 'MANAGER' || userRole === 'ADMIN') && (
                          <IconButton
                            aria-label="Edit"
                            icon={<Icon as={RiEditLine} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="brand"
                            onClick={() => onEdit(order)}
                          />
                        )}
                        {onDelete && userRole === 'ADMIN' && (
                          <IconButton
                            aria-label="Delete"
                            icon={<Icon as={RiDeleteBinLine} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => onDelete(order)}
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex
          px={4} py={3}
          borderTop="1px solid" borderColor="gray.100"
          align="center" justify="space-between"
        >
          <Text fontSize="13px" color="gray.400">
            Page {filters.page} of {totalPages}
          </Text>
          <HStack spacing={2}>
            <IconButton
              aria-label="Previous"
              icon={<Icon as={RiArrowLeftLine} />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              isDisabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
            />
            <IconButton
              aria-label="Next"
              icon={<Icon as={RiArrowRightLine} />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              isDisabled={filters.page === totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
            />
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
