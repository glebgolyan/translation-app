'use client';
import {
  Box, VStack, HStack, Button, Text, Divider, Icon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback } from 'react';
import { RiSaveLine } from 'react-icons/ri';
import { useToast } from '@chakra-ui/react';
import { Order, UpdateOrderDto } from '@/entities/order/model/types';
import { User } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';
import { ClientInfoSection } from './components/ClientInfoSection';
import { TranslationDetailsSection } from './components/TranslationDetailsSection';
import { PaymentSection } from './components/PaymentSection';
import { AssignmentSection } from './components/AssignmentSection';
import { FileSection } from './components/FileSection';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const orderSchema = z.object({
  sourceLanguage: z.string().min(1, 'Required'),
  targetLanguage: z.string().min(1, 'Required'),
  clientName: z.string().min(1, 'Required'),
  phone: z.string().min(5, 'Required'),
  documentType: z.string().optional(),
  documentCount: z.number().min(1),
  notarizationCount: z.number().min(0),
  totalPrice: z.number().min(0),
  deposit: z.number().min(0),
  remainingAmount: z.number().min(0),
  paymentType: z.enum(['cash', 'card', 'mixed']),
  cardAmount: z.number().optional(),
  translatorId: z.string().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'DONE', 'PAID']),
  dueDate: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order?: Order;
  translators?: User[];
  onSubmit: (data: UpdateOrderDto, originalFiles: File[], translatedFiles: File[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  userRole: string;
}

export function OrderForm({
                            order, translators = [], onSubmit, onCancel, isLoading, mode = 'edit', userRole,
                          }: OrderFormProps) {
  const { t } = useT();
  const toast = useToast();
  const [originalLocal, setOriginalLocal] = useState<File[]>([]);
  const [translatedLocal, setTranslatedLocal] = useState<File[]>([]);
  const [existingOriginal, setExistingOriginal] = useState<string[]>(order?.originalFiles || []);
  const [existingTranslated, setExistingTranslated] = useState<string[]>(order?.translatedFiles || []);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      sourceLanguage: order?.sourceLanguage || '',
      targetLanguage: order?.targetLanguage || '',
      clientName: order?.clientName || '',
      phone: order?.phone || '',
      documentType: order?.documentType || '',
      documentCount: order?.documentCount || 1,
      notarizationCount: order?.notarizationCount || 0,
      totalPrice: order?.totalPrice || 0,
      deposit: order?.deposit || 0,
      remainingAmount: order?.remainingAmount || 0,
      paymentType: order?.paymentType || 'cash',
      cardAmount: order?.cardAmount || 0,
      translatorId: order?.translatorId || '',
      status: order?.status || 'NEW',
      dueDate: order?.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
    },
  });

  const paymentType = watch('paymentType');
  const isManagerOrAdmin = userRole === 'MANAGER' || userRole === 'ADMIN';

  const addOriginalFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast({ title: `${f.name}: unsupported format`, status: 'error', duration: 2000 });
        return false;
      }
      if (f.size > 50 * 1024 * 1024) {
        toast({ title: `${f.name}: exceeds 50MB`, status: 'error', duration: 2000 });
        return false;
      }
      return true;
    });
    setOriginalLocal(prev => [...prev, ...valid]);
  }, [toast]);

  const addTranslatedFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => ACCEPTED_TYPES.includes(f.type));
    setTranslatedLocal(prev => [...prev, ...valid]);
  }, []);

  const handleFormSubmit = async (values: OrderFormValues) => {
    await onSubmit(values as UpdateOrderDto, originalLocal, translatedLocal);
  };

  return (
      <Box as="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={6} align="stretch">

          {isManagerOrAdmin && (
              <ClientInfoSection register={register} errors={errors} />
          )}

          <TranslationDetailsSection register={register} errors={errors} control={control} />

          {isManagerOrAdmin && (
              <PaymentSection register={register} control={control} paymentType={paymentType} />
          )}

          {isManagerOrAdmin && (
              <AssignmentSection register={register} translators={translators} />
          )}

          <Box>
            <Text fontFamily="Syne" fontWeight="700" fontSize="13px" letterSpacing="0.06em"
                  textTransform="uppercase" color="gray.400" mb={4}>
              {t('orders.files')}
            </Text>
            <VStack spacing={5} align="stretch">
              <FileSection
                  label={t('orders.originalDocs')}
                  existingFiles={existingOriginal}
                  localFiles={originalLocal}
                  onAddFiles={addOriginalFiles}
                  onRemoveLocal={i => setOriginalLocal(prev => prev.filter((_, idx) => idx !== i))}
                  onRemoveExisting={isManagerOrAdmin ? i => setExistingOriginal(prev => prev.filter((_, idx) => idx !== i)) : undefined}
                  canUpload={userRole !== 'TRANSLATOR'}
              />
              {(isManagerOrAdmin || userRole === 'TRANSLATOR') && (
                  <>
                    <Divider />
                    <FileSection
                        label={t('orders.translatedDocs')}
                        existingFiles={existingTranslated}
                        localFiles={translatedLocal}
                        onAddFiles={addTranslatedFiles}
                        onRemoveLocal={i => setTranslatedLocal(prev => prev.filter((_, idx) => idx !== i))}
                        onRemoveExisting={isManagerOrAdmin ? i => setExistingTranslated(prev => prev.filter((_, idx) => idx !== i)) : undefined}
                        canUpload={true}
                    />
                  </>
              )}
            </VStack>
          </Box>

          <HStack justify="flex-end" pt={2}>
            <Button variant="ghost" size="sm" onClick={onCancel} colorScheme="gray">
              {t('orders.cancel')}
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Icon as={RiSaveLine} />}>
              {mode === 'create' ? t('orders.createOrder') : t('orders.saveChanges')}
            </Button>
          </HStack>

        </VStack>
      </Box>
  );
}