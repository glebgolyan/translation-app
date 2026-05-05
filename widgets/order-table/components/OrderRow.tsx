'use client';
import {Tr, Td, HStack, IconButton, Icon, Text, Flex, Box, useColorModeValue} from '@chakra-ui/react';
import { RiEyeLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import { Order } from '@/entities/order/model/types';
import { UserRole } from '@/entities/user/model/types';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { useT } from '@/shared/hooks/useT';

interface OrderRowProps {
    order: Order;
    visibleColumns: any[];
    userRole: UserRole;
    onView?: (order: Order) => void;
    onEdit?: (order: Order) => void;
    onDelete?: (order: Order) => void;
}

export function OrderRow({ order, visibleColumns, userRole, onView, onEdit, onDelete }: OrderRowProps) {
    const { t } = useT();

    const renderCell = (colKey: string) => {
        switch (colKey) {
            case 'createdAt':
                return <Text fontSize="13px" fontFamily="mono" color="gray.600">{new Date(order.createdAt).toLocaleDateString('uk-UA')}</Text>;
            case 'dueDate': {
                const isLate = order.dueDate && new Date(order.dueDate) < new Date() && order.status !== 'DONE' && order.status !== 'PAID';
                return <Text fontSize="13px" fontFamily="mono" color={isLate ? 'red.500' : 'gray.600'} fontWeight={isLate ? '600' : '400'}>
                    {order.dueDate ? new Date(order.dueDate).toLocaleDateString('uk-UA') : '—'}
                </Text>;
            }
            case 'languages':
                return <Text fontSize="13px" fontFamily="mono">{order.sourceLanguage} → {order.targetLanguage}</Text>;
            case 'clientName':
                return <Box>
                    <Text fontSize="13px" fontWeight="500">{order.clientName}</Text>
                    <Text fontSize="11px" color="gray.400">{order.phone}</Text>
                </Box>;
            case 'documentType':
                return <Text fontSize="13px">{order.documentType || '—'}</Text>;
            case 'documentCount':
                return <Text fontSize="13px" textAlign="center">{order.documentCount}</Text>;
            case 'totalPrice':
                return <Text fontSize="13px" fontFamily="mono" fontWeight="600">₴{order.totalPrice.toLocaleString()}</Text>;
            case 'deposit':
                return <Text fontSize="13px" fontFamily="mono" color="green.600">₴{order.deposit.toLocaleString()}</Text>;
            case 'remainingAmount':
                return <Text fontSize="13px" fontFamily="mono" color={order.remainingAmount > 0 ? 'orange.500' : 'gray.400'}>
                    ₴{order.remainingAmount.toLocaleString()}
                </Text>;
            case 'paymentType':
                return <Text fontSize="12px" textTransform="capitalize" color="gray.600">
                    {order.paymentType}{order.cardAmount ? ` / ₴${order.cardAmount}` : ''}
                </Text>;
            case 'translator':
                return <Text fontSize="13px" color={order.translator ? 'gray.700' : 'gray.300'}>
                    {order.translator?.name || t('orders.unassigned')}
                </Text>;
            case 'originalFiles':
                return <Text fontSize="12px" color="gray.400">
                    {order.originalFiles.length} {t('common.original')} · {order.translatedFiles.length} {t('common.translated')}
                </Text>;
            case 'status':
                return <StatusBadge status={order.status} />;
            default:
                return <Text fontSize="13px">—</Text>;
        }
    };

    return (
        <Tr transition="background 0.1s">
            {visibleColumns.map(col => (
                <Td key={col.key} whiteSpace="nowrap">{renderCell(col.key)}</Td>
            ))}
            <Td>
                <HStack spacing={1}>
                    {onView && (
                        <IconButton aria-label={t('common.view')} icon={<Icon as={RiEyeLine} />}
                                    size="xs" variant="ghost" colorScheme="gray" onClick={() => onView(order)} />
                    )}
                    {onEdit && (userRole === 'MANAGER' || userRole === 'ADMIN') && (
                        <IconButton aria-label={t('common.edit')} icon={<Icon as={RiEditLine} />}
                                    size="xs" variant="ghost" colorScheme="brand" onClick={() => onEdit(order)} />
                    )}
                    {onDelete && userRole === 'ADMIN' && (
                        <IconButton aria-label={t('common.delete')} icon={<Icon as={RiDeleteBinLine} />}
                                    size="xs" variant="ghost" colorScheme="red" onClick={() => onDelete(order)} />
                    )}
                </HStack>
            </Td>
        </Tr>
    );
}