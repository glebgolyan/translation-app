'use client';
import {
  Box,
  Text,
  Flex,
  Icon,
  Button,
  useToast,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { RiAddLine } from 'react-icons/ri';
import { useAuth } from '@/features/auth/model/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RequestsFilter } from './components/RequestsFilter';
import { RequestsTable } from './components/RequestsTable';
import { ConvertRequestForm } from './components/ConvertRequestForm';
import { CreateRequestForm } from './components/CreateRequestForm';
import { orderRequestsApi } from '@/features/order-requests/api/orderRequestsApi';
import { usersApi } from '@/features/admin/api/usersApi';
import { CreateOrderRequestInput, OrderRequest } from '@/entities/order-request/model/types';
import { useT } from '@/shared/hooks/useT';

export default function RequestsPage() {
  const { user } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [search, setSearch] = useState('');
  const [converted, setConverted] = useState<boolean | undefined>(undefined);
  const [selectedRequest, setSelectedRequest] = useState<OrderRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<OrderRequest | null>(null);

  const textColor = useColorModeValue('gray.900', '#f0f0f0');
  const subtitleColor = useColorModeValue('gray.400', '#666666');

  useEffect(() => {
    if (user && user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const { data: translators = [] } = useQuery({
    queryKey: ['translators'],
    queryFn: usersApi.getTranslators,
    enabled: user?.role === 'MANAGER' || user?.role === 'ADMIN',
  });

  const convertMutation = useMutation({
    mutationFn: (data: any) => orderRequestsApi.convert(selectedRequest!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-requests'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: t('requests.convertSuccess'), status: 'success', duration: 2500 });
      onDrawerClose();
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      toast({
        title: t('common.error'),
        description: err?.response?.data?.message || err?.message,
        status: 'error',
        duration: 4000,
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: ({ data, files }: { data: CreateOrderRequestInput; files: File[] }) =>
      orderRequestsApi.createManual(data, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-requests'] });
      toast({ title: t('requests.createSuccess'), status: 'success', duration: 2500 });
      onCreateClose();
    },
    onError: (err: any) => {
      toast({
        title: t('common.error'),
        description: err?.response?.data?.message || err?.message,
        status: 'error',
        duration: 4000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderRequestsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-requests'] });
      toast({ title: t('requests.deleteSuccess'), status: 'success', duration: 2000 });
      onDeleteClose();
      setRequestToDelete(null);
    },
    onError: (err: any) => {
      toast({
        title: t('common.error'),
        description: err?.response?.data?.message || err?.message,
        status: 'error',
        duration: 4000,
      });
    },
  });

  if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) return null;

  const handleConvert = (request: OrderRequest) => {
    setSelectedRequest(request);
    onDrawerOpen();
  };

  const handleDelete = (request: OrderRequest) => {
    setRequestToDelete(request);
    onDeleteOpen();
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Flex
        justify='space-between'
        align={{ base: 'flex-start', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={3}
        mb={8}
      >
        <Box>
          <Text
            fontFamily='Syne'
            fontWeight='800'
            fontSize={{ base: '20px', md: '24px' }}
            letterSpacing='-0.02em'
            color={textColor}
          >
            {t('requests.title')}
          </Text>
          <Text
            color={subtitleColor}
            fontSize='14px'
            mt={0.5}
          >
            {t('requests.subtitle')}
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={RiAddLine} />}
          size='sm'
          w={{ base: 'full', sm: 'auto' }}
          onClick={onCreateOpen}
        >
          {t('requests.createRequest')}
        </Button>
      </Flex>

      <RequestsFilter
        search={search}
        converted={converted}
        onSearchChange={setSearch}
        onConvertedChange={setConverted}
      />

      <RequestsTable
        filters={{ search, converted }}
        onConvert={handleConvert}
        onDelete={handleDelete}
      />

      <Drawer
        isOpen={isDrawerOpen}
        placement='right'
        onClose={onDrawerClose}
        size='xl'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            fontFamily='Syne'
            fontWeight='700'
            borderBottom='1px solid'
            borderColor='gray.100'
            pb={4}
          >
            {t('requests.convertToOrder')}
          </DrawerHeader>
          <DrawerBody
            py={6}
            overflowY='auto'
          >
            {selectedRequest && (
              <ConvertRequestForm
                request={selectedRequest}
                translators={translators}
                onSubmit={async (data) => {
                  await convertMutation.mutateAsync(data);
                }}
                onCancel={onDrawerClose}
                isLoading={convertMutation.isPending}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        size={{ base: 'full', md: 'xl' }}
        scrollBehavior='inside'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader
            fontFamily='Syne'
            fontWeight='700'
            borderBottom='1px solid'
            borderColor='gray.100'
          >
            {t('requests.createRequest')}
          </ModalHeader>
          <ModalBody py={6}>
            <CreateRequestForm
              onSubmit={async (data, files) => {
                await createMutation.mutateAsync({ data, files });
              }}
              onCancel={onCreateClose}
              isLoading={createMutation.isPending}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={4}>
            <AlertDialogHeader
              fontFamily='Syne'
              fontWeight='700'
              fontSize='16px'
            >
              {t('requests.deleteConfirmTitle')}
            </AlertDialogHeader>
            <AlertDialogBody fontSize='14px'>{t('requests.deleteConfirmBody')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onDeleteClose}
                size='sm'
                variant='ghost'
              >
                {t('orders.cancel')}
              </Button>
              <Button
                colorScheme='red'
                onClick={() => requestToDelete && deleteMutation.mutate(requestToDelete.id)}
                isLoading={deleteMutation.isPending}
                size='sm'
                ml={3}
              >
                {t('requests.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
