'use client';
import { Box, Flex, Text, Button, Icon, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RiAddLine } from 'react-icons/ri';
import { useDisclosure } from '@chakra-ui/react';
import { OrderTable } from '@/widgets/order-table/OrderTable';
import { OrderDrawer } from './components/OrderDrawer';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { usersApi } from '@/features/admin/api/usersApi';
import { useAuth } from '@/features/auth/model/useAuth';
import { Order, UpdateOrderDto } from '@/entities/order/model/types';
import { useT } from '@/shared/hooks/useT';

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formLoading, setFormLoading] = useState(false);

  const { data: translators = [] } = useQuery({
    queryKey: ['translators'],
    queryFn: usersApi.getTranslators,
    enabled: user?.role === 'MANAGER' || user?.role === 'ADMIN',
  });

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormMode('edit');
    onOpen();
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setFormMode('create');
    onOpen();
  };

  const handleFormSubmit = async (data: UpdateOrderDto, originalFiles: File[], translatedFiles: File[]) => {
    setFormLoading(true);
    try {
      let order: Order;
      if (formMode === 'edit' && selectedOrder) {
        order = await ordersApi.update(selectedOrder.id, data);
        toast({ title: t('orders.saveChanges'), status: 'success', duration: 2000 });
      } else {
        order = await ordersApi.create(data as any);
        toast({ title: t('orders.createOrder'), status: 'success', duration: 2000 });
      }
      if (originalFiles.length > 0) await ordersApi.uploadFiles(order.id, originalFiles, 'original');
      if (translatedFiles.length > 0) await ordersApi.uploadFiles(order.id, translatedFiles, 'translated');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err?.response?.data?.message || err?.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) return null;

  return (
      <Box p={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontFamily="Syne" fontWeight="800" fontSize="24px" letterSpacing="-0.02em">
              {t('orders.title')}
            </Text>
            <Text color="gray.400" fontSize="14px" mt={0.5}>{t('orders.subtitle')}</Text>
          </Box>
          {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
              <Button leftIcon={<Icon as={RiAddLine} />} size="sm" onClick={handleCreate}>
                {t('orders.newOrder')}
              </Button>
          )}
        </Flex>

        <OrderTable userRole={user.role} onEdit={handleEdit} onView={handleEdit} />

        <OrderDrawer
            isOpen={isOpen}
            onClose={onClose}
            order={selectedOrder}
            translators={translators}
            mode={formMode}
            isLoading={formLoading}
            onSubmit={handleFormSubmit}
            userRole={user.role}
        />
      </Box>
  );
}