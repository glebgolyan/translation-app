'use client';
import {
    Drawer, DrawerBody, DrawerHeader, DrawerOverlay,
    DrawerContent, DrawerCloseButton, Box, HStack, Text, useToast
} from '@chakra-ui/react';
import { OrderForm } from '@/widgets/order-form/OrderForm';
import { Order, UpdateOrderDto } from '@/entities/order/model/types';
import { User } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';
import {UnreadBadge} from "@/widgets/order-table/components/UnreadBadge";
import {Messenger} from "@/widgets/order-table/components/Messenger";
import {useAuth} from "@/features/auth/model/useAuth";

interface OrderDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    order?: Order | null;
    translators: User[];
    mode: 'create' | 'edit';
    isLoading: boolean;
    onSubmit: (data: UpdateOrderDto, originalFiles: File[], translatedFiles: File[]) => Promise<void>;
    userRole: string;
}

export function OrderDrawer({
                                isOpen, onClose, order, translators, mode, isLoading, onSubmit, userRole,
                            }: OrderDrawerProps) {
    const { user } = useAuth();

    const { t } = useT();

    const toast = useToast();

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader fontFamily="Syne" fontWeight="700" borderBottom="1px solid" borderColor="gray.100" pb={4}>
                    {mode === 'create' ? t('orders.newOrder') : t('orders.editOrder')}
                </DrawerHeader>
                <DrawerBody py={6} overflowY="auto">
                    <OrderForm
                        order={order || undefined}
                        translators={translators}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        isLoading={isLoading}
                        mode={mode}
                        userRole={userRole}
                    />

                    {order && (
                        <Box mt={6} borderTop="1px solid" borderColor='gray.100' pt={6}>
                            <HStack mb={4}>
                                <Text fontFamily="Syne" fontWeight="700" fontSize="13px">
                                    Live Chat
                                </Text>
                                <UnreadBadge orderId={order.id} />
                            </HStack>
                            <Messenger
                                orderId={order.id}
                                onNewMessage={(msg) => {
                                    if (msg.senderId !== user?.id) {
                                        toast({
                                            title: 'New message',
                                            description: msg.text || 'Sent a reaction',
                                            status: 'info',
                                            duration: 3000,
                                        });
                                    }
                                }}
                            />
                        </Box>
                    )}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
}