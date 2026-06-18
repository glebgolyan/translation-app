'use client';
import {
    Box, VStack, HStack, Text, Badge, Button, Icon,
    Divider, useColorModeValue, Grid, useDisclosure, Flex,
} from '@chakra-ui/react';
import { RiEdit2Line, RiPhoneLine, RiMailLine } from 'react-icons/ri';
import { OrderDrawer } from '@/app/orders/components/OrderDrawer';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { usersApi } from '@/features/admin/api/usersApi';
import { useAuth } from '@/features/auth/model/useAuth';

interface OrderDetailsPanelProps {
    conversation: any;
}

export function OrderDetailsPanel({ conversation }: OrderDetailsPanelProps) {
    const { user } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const textColor = useColorModeValue('gray.800', '#e0e0e0');
    const mutedColor = useColorModeValue('gray.500', '#999999');
    const bgSubtle = useColorModeValue('gray.50', '#222222');
    const borderColor = useColorModeValue('gray.100', '#2e2e2e');

    const { data: order } = useQuery({
        queryKey: ['order', conversation.id],
        queryFn: () => ordersApi.getById(conversation.id),
    });

    const { data: translators = [] } = useQuery({
        queryKey: ['translators'],
        queryFn: usersApi.getTranslators,
        enabled: user?.role === 'MANAGER' || user?.role === 'ADMIN',
    });

    if (!order) return null;

    const getStatusColor = (status: string) => {
        const colors: any = {
            PENDING: 'yellow',
            IN_PROGRESS: 'blue',
            COMPLETED: 'green',
            CANCELLED: 'red',
        };
        return colors[status] || 'gray';
    };

    return (
        <VStack spacing={4} align="stretch" minH='400px' maxH='600px'>
            {/* Order Header */}
            <Box bg={bgSubtle} p={4} borderRadius="8px">
                <Flex flexDirection='column' mb={3}>
                    <VStack spacing={1} align="start">
                        <HStack spacing={2}>
                            <Text fontFamily="Syne" fontWeight="700" fontSize="16px" color={textColor}>
                                Order #{conversation.orderNumber}
                            </Text>
                            <Badge colorScheme={getStatusColor(conversation.status)}>
                                {conversation.status}
                            </Badge>
                        </HStack>
                        <Text fontSize="12px" color={mutedColor}>
                            Created: {new Date(conversation.createdAt).toLocaleDateString('uk-UA')}
                        </Text>
                    </VStack>
                    {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                        <Button
                            leftIcon={<Icon as={RiEdit2Line} />}
                            size="sm"
                            colorScheme="brand"
                            onClick={onOpen}
                        >
                            Edit Order
                        </Button>
                    )}
                </Flex>
            </Box>

            {/* Client Information */}
            <Box>
                <Text fontFamily="Syne" fontWeight="700" fontSize="13px" mb={3} color={textColor}>
                    Client Information
                </Text>
                <VStack spacing={2} align="start" fontSize="13px">
                    <HStack spacing={2}>
                        <Text fontWeight="500" color={textColor} minW="80px">
                            Name:
                        </Text>
                        <Text color={mutedColor}>{conversation.clientName}</Text>
                    </HStack>
                    {conversation.clientEmail && (
                        <HStack spacing={2}>
                            <Icon as={RiMailLine} color="brand.500" boxSize={4} />
                            <Text color={mutedColor}>{conversation.clientEmail}</Text>
                        </HStack>
                    )}
                    {conversation.clientPhone && (
                        <HStack spacing={2}>
                            <Icon as={RiPhoneLine} color="brand.500" boxSize={4} />
                            <Text color={mutedColor}>{conversation.clientPhone}</Text>
                        </HStack>
                    )}
                </VStack>
            </Box>

            <Divider />

            {/* Translator Information */}
            {conversation.translatorName && (
                <Box>
                    <Text fontFamily="Syne" fontWeight="700" fontSize="13px" mb={3} color={textColor}>
                        Translator
                    </Text>
                    <Text fontSize="13px" color={mutedColor}>
                        {conversation.translatorName}
                    </Text>
                </Box>
            )}

            <Divider />

            {/* Languages */}
            <Box>
                <Text fontFamily="Syne" fontWeight="700" fontSize="13px" mb={3} color={textColor}>
                    Languages
                </Text>
                <HStack spacing={4} fontSize="13px">
                    <VStack spacing={1} align="start">
                        <Text color={mutedColor} fontSize="11px">From</Text>
                        <Text fontWeight="600" color={textColor}>
                            {conversation.sourceLanguage || 'N/A'}
                        </Text>
                    </VStack>
                    <Box w="1px" h="40px" bg={borderColor} />
                    <VStack spacing={1} align="start">
                        <Text color={mutedColor} fontSize="11px">To</Text>
                        <Text fontWeight="600" color={textColor}>
                            {conversation.targetLanguage || 'N/A'}
                        </Text>
                    </VStack>
                </HStack>
            </Box>

            <Divider />

            {/* Payment Information */}
            <Box>
                <Text fontFamily="Syne" fontWeight="700" fontSize="13px" mb={3} color={textColor}>
                    Payment Details
                </Text>
                <Grid templateColumns="1fr 1fr" gap={3} fontSize="13px">
                    <VStack spacing={1} align="start" bg={bgSubtle} p={2} borderRadius="6px">
                        <Text color={mutedColor} fontSize="11px">Total</Text>
                        <Text fontWeight="700" color={textColor} fontSize="14px" fontFamily="mono">
                            ₴{conversation.totalPrice?.toLocaleString()}
                        </Text>
                    </VStack>
                    <VStack spacing={1} align="start" bg={bgSubtle} p={2} borderRadius="6px">
                        <Text color={mutedColor} fontSize="11px">Deposit</Text>
                        <Text fontWeight="700" color={textColor} fontSize="14px" fontFamily="mono">
                            ₴{conversation.deposit?.toLocaleString()}
                        </Text>
                    </VStack>
                </Grid>
            </Box>

            {/* Edit Drawer */}
            {order && (
                <OrderDrawer
                    isOpen={isOpen}
                    onClose={onClose}
                    order={order}
                    translators={translators}
                    mode="edit"
                    isLoading={false}
                    onSubmit={async () => {
                        onClose();
                    }}
                    userRole={user?.role || 'CLIENT'}
                />
            )}
        </VStack>
    );
}