'use client';
import {
  Box, Flex, Text, Button, Icon, useDisclosure,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay,
  DrawerContent, DrawerCloseButton, useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiAddLine } from 'react-icons/ri';
import { OrderTable } from '@/widgets/order-table/OrderTable';
import { OrderForm } from '@/widgets/order-form/OrderForm';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { usersApi } from '@/features/admin/api/usersApi';
import { useAuth } from '@/features/auth/model/useAuth';
import { Order, UpdateOrderDto } from '@/entities/order/model/types';

export default function OrdersPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen: isFormOpen, onOpen: openForm, onClose: closeForm } = useDisclosure();
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
    openForm();
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setFormMode('edit');
    openForm();
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setFormMode('create');
    openForm();
  };

  const handleFormSubmit = async (
      data: UpdateOrderDto,
      originalFiles: File[],
      translatedFiles: File[],
  ) => {
    setFormLoading(true);
    try {
      let order: Order;

      if (formMode === 'edit' && selectedOrder) {
        order = await ordersApi.update(selectedOrder.id, data);
        toast({ title: 'Order updated', status: 'success', duration: 2000 });
      } else {
        order = await ordersApi.create(data as any);
        toast({ title: 'Order created', status: 'success', duration: 2000 });
      }

      // Upload files after order is saved
      if (originalFiles.length > 0) {
        await ordersApi.uploadFiles(order.id, originalFiles, 'original');
        toast({ title: `${originalFiles.length} original file(s) uploaded`, status: 'success', duration: 2000 });
      }

      if (translatedFiles.length > 0) {
        await ordersApi.uploadFiles(order.id, translatedFiles, 'translated');
        toast({ title: `${translatedFiles.length} translated file(s) uploaded`, status: 'success', duration: 2000 });
      }

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      closeForm();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Something went wrong',
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
              Orders
            </Text>
            <Text color="gray.400" fontSize="14px" mt={0.5}>
              Manage all translation orders
            </Text>
          </Box>
          {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
              <Button leftIcon={<Icon as={RiAddLine} />} size="sm" onClick={handleCreate}>
                New Order
              </Button>
          )}
        </Flex>

        <OrderTable
            userRole={user.role}
            onEdit={handleEdit}
            onView={handleView}
        />

        {/* Create / Edit Drawer */}
        <Drawer isOpen={isFormOpen} placement="right" onClose={closeForm} size="xl">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader
                fontFamily="Syne"
                fontWeight="700"
                borderBottom="1px solid"
                borderColor="gray.100"
                pb={4}
            >
              {formMode === 'create' ? 'New Order' : 'Edit Order'}
            </DrawerHeader>
            <DrawerBody py={6} overflowY="auto">
              <OrderForm
                  order={selectedOrder || undefined}
                  translators={translators}
                  onSubmit={handleFormSubmit}
                  onCancel={closeForm}
                  isLoading={formLoading}
                  mode={formMode}
                  userRole={user.role}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
  );
}