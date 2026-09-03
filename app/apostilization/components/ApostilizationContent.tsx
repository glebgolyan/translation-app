'use client';
import {
  Box,
  Text,
  Button,
  Icon,
  useDisclosure,
  useToast,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { RiAddLine } from 'react-icons/ri';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApostilizationFilter } from './ApostilizationFilter';
import { ApostilizationForm } from './ApostilizationForm';
import { ApostilizationTable } from './ApostilizationTable';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { useT } from '@/shared/hooks/useT';

export function ApostilizationContent() {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [search, setSearch] = useState('');

  const textColor = useColorModeValue('gray.900', '#f0f0f0');
  const subtitleColor = useColorModeValue('gray.400', '#666666');

  const createMutation = useMutation({
    mutationFn: (data: any) => apostilizationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apostilization'] });
      toast({ title: 'Created', status: 'success', duration: 2000 });
      onClose();
    },
    onError: (err: any) => {
      toast({
        title: 'Failed',
        description: err?.response?.data?.message || 'Error',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apostilizationApi.update(selectedItem.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apostilization'] });
      toast({ title: 'Updated', status: 'success', duration: 2000 });
      onClose();
      setSelectedItem(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Failed',
        description: err?.response?.data?.message || 'Error',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleFormSubmit = async (data: any) => {
    if (selectedItem) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    onOpen();
  };

  const handleClose = () => {
    setSelectedItem(null);
    onClose();
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      {/* Header */}
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
            {t('apostilization.title')}
          </Text>
          <Text
            color={subtitleColor}
            fontSize='14px'
            mt={0.5}
          >
            {t('apostilization.subtitle')}
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={RiAddLine} />}
          size='sm'
          w={{ base: 'full', sm: 'auto' }}
          onClick={() => {
            setSelectedItem(null);
            onOpen();
          }}
        >
          {t('apostilization.createNew')}
        </Button>
      </Flex>

      {/* Filters */}
      <ApostilizationFilter
        month={month}
        search={search}
        onMonthChange={setMonth}
        onSearchChange={setSearch}
      />

      {/* Table */}
      <ApostilizationTable
        month={month}
        search={search}
        onEdit={handleEdit}
      />

      {/* Create/Edit Drawer */}
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={handleClose}
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
            {selectedItem ? t('apostilization.edit') : t('apostilization.createNew')}
          </DrawerHeader>
          <DrawerBody
            py={6}
            overflowY='auto'
          >
            <ApostilizationForm
              initialData={selectedItem}
              onSubmit={handleFormSubmit}
              onCancel={handleClose}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
