'use client';
import {Tr, Td, HStack, IconButton, Icon, Text, Box, useColorModeValue, Tooltip, useToast} from '@chakra-ui/react';
import { RiEyeLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import { Order } from '@/entities/order/model/types';
import { UserRole } from '@/entities/user/model/types';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { useT } from '@/shared/hooks/useT';
import {FileStatusBadge} from "@/widgets/order-table/components/FileStatusBadge";
import {useLanguageConfig} from "@/shared/hooks/useLanguageConfig";

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

    const toast = useToast();

    const handleCopyId = (fullId: string) => {
        navigator.clipboard.writeText(fullId);
        toast({
            title: 'Copied!',
            description: fullId,
            status: 'success',
            duration: 2000,
            isClosable: true,
        });
    };

    const { getLanguageName } = useLanguageConfig();

    const renderCell = (colKey: string) => {
        switch (colKey) {
            case 'id':
                return (
                    <Text
                        fontSize="12px"
                        fontFamily="mono"
                        fontWeight="600"
                        color={useColorModeValue('gray.700', 'gray.300')}
                        cursor="pointer"
                        onClick={() => handleCopyId(order.id)}
                        _hover={{
                            textDecoration: 'underline',
                            opacity: 0.7,
                        }}
                        title={`Click to copy full ID: ${order.id}`}
                    >
                        #{order.id.substring(0, 7)}...
                    </Text>
                );
            case 'fileStatus':
                return (
                    <FileStatusBadge
                        originalFiles={order.originalFiles}
                        translatedFiles={order.translatedFiles}
                        filesDeletedAt={order.filesDeletedAt}
                    />
                );
            case 'createdAt':
                return <Text fontSize="13px" fontFamily="mono" color="gray.600">{new Date(order.createdAt).toLocaleDateString('uk-UA')}</Text>;
            case 'dueDate': {
                const isLate = order.dueDate && new Date(order.dueDate) < new Date() && order.status !== 'DONE' && order.status !== 'PAID';
                return <Text fontSize="13px" fontFamily="mono" color={isLate ? 'red.500' : 'gray.600'} fontWeight={isLate ? '600' : '400'}>
                    {order.dueDate ? new Date(order.dueDate).toLocaleDateString('uk-UA') : '—'}
                </Text>;
            }
            case 'languages':
                return <Text fontSize="13px" fontFamily="mono">
                    {getLanguageName(order.sourceLanguage)}
                    →
                    {getLanguageName(order.targetLanguage)}</Text>;
            case 'clientName':
                return <Box>
                    <Text fontSize="13px" fontWeight="500">{order.clientName}</Text>
                    <Text fontSize="13px" color="gray.400">{order.phone}</Text>
                </Box>;
            case 'documentType':
                return <Text fontSize="13px">{order.documentType || '—'}</Text>;
            case 'documentCount':
                return <Text fontSize="13px" textAlign="center">{order.documentCount}</Text>;
            case 'totalPrice':
                return (
                    <Tooltip
                        label={
                            <Box fontSize="12px" p={1} >
                                <Text>💰 {t('orders.totalPrice')}: ₴{order.totalPrice.toLocaleString()}</Text>
                                <Text>⬇️ {t('orders.deposit')}: ₴{order.deposit.toLocaleString()}</Text>
                                <Text color={order.remainingAmount > 0 ? 'orange.300' : 'green.300'}>
                                    🔄 {t('orders.remaining')}: ₴{order.remainingAmount.toLocaleString()}
                                </Text>
                                <Text fontSize="11px" color="gray.400" mt={1} textTransform="capitalize">
                                    {order.paymentType}{order.cardAmount ? ` · ₴${order.cardAmount} card` : ''}
                                </Text>
                            </Box>
                        }
                        placement="top"
                        hasArrow
                        bg={useColorModeValue('gray.800', '#2a2a2a')}
                        color="white"
                        borderRadius="6px"
                        p={2}
                    >
                        <Box cursor="default" >
                            <Text fontSize="12px" fontFamily="mono" fontWeight="600">
                                ₴{order.totalPrice.toLocaleString()}
                            </Text>
                            {order.remainingAmount > 0 && (
                                <Text fontSize="10px"  fontFamily="mono">
                                    -{order.remainingAmount.toLocaleString()} {t('orders.remaining').toLowerCase()}
                                </Text>
                            )}
                        </Box>
                    </Tooltip>
                );
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
                return <Text fontSize="13px" color={useColorModeValue('gray.700', 'gray.300')}>
                    {order.translator?.name || t('orders.unassigned')}
                </Text>;
            case 'comment':
                return order.comment ? (
                    <Tooltip
                        label={order.comment}
                        placement="top"
                        hasArrow
                        maxW="280px"
                        bg={useColorModeValue('gray.800', '#2a2a2a')}
                        color="white"
                        borderRadius="6px"
                        p={3}
                        fontSize="12px"
                        whiteSpace="pre-wrap"
                    >
                        <Text
                            fontSize="12px"
                            noOfLines={2}
                            cursor="default"
                            maxW="140px"
                            overflow="hidden"
                            textOverflow="ellipsis"
                        >
                            {order.comment}
                        </Text>
                    </Tooltip>
                ) : (
                    <Text fontSize="12px">—</Text>
                );
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