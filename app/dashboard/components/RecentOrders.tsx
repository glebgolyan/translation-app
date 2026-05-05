'use client';
import { Box, Flex, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { Order } from '@/entities/order/model/types';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { useT } from '@/shared/hooks/useT';

interface RecentOrdersProps {
    orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
    const { t } = useT();

    const bg = useColorModeValue('white', '#1a1a1a');
    const borderColor = useColorModeValue('gray.100', '#2e2e2e');
    const dividerColor = useColorModeValue('gray.50', '#252525');
    const headerText = useColorModeValue('gray.900', '#f0f0f0');
    const clientNameColor = useColorModeValue('gray.800', '#e0e0e0');
    const langColor = useColorModeValue('gray.400', '#666666');
    const dateColor = useColorModeValue('gray.400', '#666666');
    const priceColor = useColorModeValue('gray.700', '#d0d0d0');
    const emptyColor = useColorModeValue('gray.400', '#555555');
    const hoverBg = useColorModeValue('gray.50', '#222222');

    return (
        <Box bg={bg} borderRadius="8px" border="1px solid" borderColor={borderColor}>
            <Flex px={6} py={4} align="center" justify="space-between"
                  borderBottom="1px solid" borderColor={dividerColor}>
                <Text fontFamily="Syne" fontWeight="700" fontSize="15px" color={headerText}>
                    {t('dashboard.recentOrders')}
                </Text>
                <Text fontSize="12px" color="brand.400" cursor="pointer" fontFamily="DM Sans">
                    {t('dashboard.viewAll')}
                </Text>
            </Flex>

            <VStack spacing={0} align="stretch"
                    divider={<Box borderBottom="1px solid" borderColor={dividerColor} />}>
                {orders.length === 0 ? (
                    <Box py={12} textAlign="center">
                        <Text color={emptyColor} fontSize="14px">{t('dashboard.noOrders')}</Text>
                    </Box>
                ) : (
                    orders.map(order => (
                        <Flex
                            key={order.id} px={6} py={4} align="center" gap={4}
                            _hover={{ bg: hoverBg }} cursor="pointer" transition="background 0.15s"
                        >
                            <Box flex={1}>
                                <Text fontSize="14px" fontWeight="500" mb={0.5} color={clientNameColor}>
                                    {order.clientName}
                                </Text>
                                <Text fontSize="12px" color={langColor} fontFamily="mono">
                                    {order.sourceLanguage} → {order.targetLanguage}
                                </Text>
                            </Box>
                            <Text fontSize="12px" color={dateColor}>
                                {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                            </Text>
                            <StatusBadge status={order.status} />
                            <Text fontSize="14px" fontWeight="600" fontFamily="mono" color={priceColor}>
                                ₴{order.totalPrice.toLocaleString()}
                            </Text>
                        </Flex>
                    ))
                )}
            </VStack>
        </Box>
    );
}