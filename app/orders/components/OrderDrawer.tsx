'use client';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { OrderForm } from '@/widgets/order-form/OrderForm';
import { Order, UpdateOrderDto } from '@/entities/order/model/types';
import { User } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  translators: User[];
  mode: 'create' | 'edit';
  isLoading: boolean;
  onSubmit: (
    data: UpdateOrderDto,
    originalFiles: File[],
    translatedFiles: File[],
    statsEntry?: {
      wordCount: number;
      date: Date;
    }
  ) => Promise<void>;
  userRole: string;
}

export function OrderDrawer({
  isOpen,
  onClose,
  order,
  translators,
  mode,
  isLoading,
  onSubmit,
  userRole,
}: OrderDrawerProps) {
  const { t } = useT();

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      size='xl'
    >
      <DrawerOverlay />
      <DrawerContent
        w='100%'
        maxW={{ base: '350px', md: '450px', lg: '850px', xl: '1000px' }}
      >
        <DrawerCloseButton />
        <DrawerHeader
          fontFamily='Syne'
          fontWeight='700'
          borderBottom='1px solid'
          borderColor='gray.100'
          pb={4}
        >
          {mode === 'create' ? t('orders.newOrder') : t('orders.editOrder')} Order Number #
          {order?.orderNumber}
        </DrawerHeader>
        <DrawerBody
          py={6}
          overflowY='auto'
          width={{ base: '350px', md: '450px', lg: '850px', xl: '1000px' }}
        >
          <OrderForm
            order={order || undefined}
            translators={translators}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            mode={mode}
            userRole={userRole}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
