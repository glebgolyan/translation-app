'use client';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { filesApi } from '@/features/files/api/filesApi';
import { useT } from '@/shared/hooks/useT';

interface FileManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'download' | 'delete';
}

export function FileManagementDialog({ isOpen, onClose, mode }: FileManagementDialogProps) {
  const { t } = useT();
  const toast = useToast();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const labelColor = useColorModeValue('gray.400', '#666666');

  const handleAction = async () => {
    if (!dateFrom || !dateTo) {
      toast({ title: 'Please select both dates', status: 'warning', duration: 2000 });
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      toast({ title: '"From" date must be before "To" date', status: 'warning', duration: 2000 });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'download') {
        await filesApi.downloadByDateRange(dateFrom, dateTo);
        toast({ title: 'Download started', status: 'success', duration: 2000 });
      } else {
        await filesApi.deleteByDateRange(dateFrom, dateTo);
        toast({ title: 'Files deleted successfully', status: 'success', duration: 2000 });
      }
      onClose();
      setDateFrom('');
      setDateTo('');
    } catch (err: any) {
      toast({
        title: 'Operation failed',
        description: err?.response?.data?.message || 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontFamily='Syne'
          fontWeight='700'
        >
          {mode === 'download'
            ? t('orders.downloadFilesByDate') || 'Download Files by Date Range'
            : t('orders.deleteFilesByDate') || 'Delete Files by Date Range'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text
              fontSize='13px'
              color={labelColor}
            >
              {mode === 'download'
                ? t('orders.selectDateRangeDownload') ||
                  'Select a date range to download all files from orders'
                : t('orders.selectDateRangeDelete') ||
                  'Select a date range to delete all files from orders'}
            </Text>

            <FormControl>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                From
              </FormLabel>
              <Input
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                size='sm'
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                To
              </FormLabel>
              <Input
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                size='sm'
              />
            </FormControl>

            {mode === 'delete' && (
              <Box
                bg='red.50'
                _dark={{ bg: '#3c1414' }}
                p={3}
                borderRadius='6px'
                borderLeft='4px solid'
                borderColor='red.500'
              >
                <Text
                  fontSize='12px'
                  color='red.600'
                  _dark={{ color: 'red.200' }}
                >
                  ⚠️{' '}
                  {t('orders.deleteWarning') ||
                    'This action cannot be undone. All files in this date range will be permanently deleted.'}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
          >
            {t('orders.cancel')}
          </Button>
          <Button
            size='sm'
            colorScheme={mode === 'delete' ? 'red' : 'brand'}
            isLoading={loading}
            onClick={handleAction}
          >
            {mode === 'download' ? t('orders.downloadFiles') : t('orders.deleteFiles')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
