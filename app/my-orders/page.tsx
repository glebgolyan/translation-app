'use client';
// app/my-orders/page.tsx
import {
  Box, Text, Flex, Button, Icon, VStack, HStack, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, FormControl, FormLabel, Select, useDisclosure,
  useToast, Spinner, Center,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiAddLine, RiFileList3Line } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { FileUpload } from '@/features/files/ui/FileUpload';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Order } from '@/entities/order/model/types';

const LANGUAGES = [
  'Ukrainian', 'English', 'German', 'French', 'Polish',
  'Spanish', 'Italian', 'Romanian', 'Hungarian', 'Czech',
];

export default function MyOrdersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => ordersApi.getAll({ limit: 50 }),
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { sourceLanguage: '', targetLanguage: '' },
  });

  const createMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCreatedOrder(order);
      toast({ title: 'Order submitted!', status: 'success', duration: 3000 });
      reset();
    },
  });

  const onSubmit = (values: { sourceLanguage: string; targetLanguage: string }) => {
    createMutation.mutate(values);
  };

  const orders = data?.data || [];

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontFamily="Syne" fontWeight="800" fontSize="24px" letterSpacing="-0.02em">My Orders</Text>
          <Text color="gray.400" fontSize="14px">{orders.length} translation requests</Text>
        </Box>
        <Button leftIcon={<Icon as={RiAddLine} />} size="sm" onClick={onOpen}>
          New Request
        </Button>
      </Flex>

      {isLoading ? (
        <Center py={16}><Spinner color="brand.500" /></Center>
      ) : (
        <VStack spacing={3} align="stretch">
          {orders.map(order => (
            <Box
              key={order.id}
              bg="white"
              borderRadius="8px"
              border="1px solid"
              borderColor="gray.100"
              p={5}
              _hover={{ shadow: 'sm' }}
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon as={RiFileList3Line} color="gray.400" />
                  <Box>
                    <Text fontWeight="500" fontSize="14px" mb={0.5}>
                      {order.sourceLanguage} → {order.targetLanguage}
                    </Text>
                    <Text fontSize="12px" color="gray.400" fontFamily="mono">
                      {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                    </Text>
                  </Box>
                </HStack>
                <StatusBadge status={order.status} />
              </Flex>
            </Box>
          ))}
        </VStack>
      )}

      {/* New Order Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontFamily="Syne" fontWeight="700" fontSize="18px">New Translation Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box as="form" onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="13px">Source Language</FormLabel>
                  <Select {...register('sourceLanguage', { required: true })} placeholder="Select language">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px">Target Language</FormLabel>
                  <Select {...register('targetLanguage', { required: true })} placeholder="Select language">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </FormControl>

                {createdOrder && (
                  <Box w="full" pt={2}>
                    <FileUpload
                      orderId={createdOrder.id}
                      type="original"
                      existingFiles={[]}
                    />
                  </Box>
                )}

                {!createdOrder ? (
                  <Button
                    type="submit"
                    w="full"
                    isLoading={createMutation.isPending}
                    mt={2}
                  >
                    Submit Request
                  </Button>
                ) : (
                  <Button w="full" onClick={() => { onClose(); setCreatedOrder(null); }} mt={2}>
                    Done
                  </Button>
                )}
              </VStack>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
