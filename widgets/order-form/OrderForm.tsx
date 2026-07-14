'use client';
import {
  Box, VStack, HStack, Button, Text, Divider, Icon, Flex, Grid,
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
import {CommentSection} from "@/widgets/order-form/components/CommentSection";
import {UnreadBadge} from "@/widgets/order-table/components/UnreadBadge";
import {Messenger} from "@/widgets/order-table/components/Messenger";
import {useAuth} from "@/features/auth/model/useAuth";
import {ordersApi} from "@/features/orders/api/ordersApi";

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
  comment: z.string().optional(),
  cardAmount: z.number().optional(),
  translatorId: z.string().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'DONE', 'PAID', 'CANCELLED', 'CERTIFIED', 'TAKEN']),
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

  const { user } = useAuth();

  const [originalLocal, setOriginalLocal] = useState<File[]>([]);
  const [translatedLocal, setTranslatedLocal] = useState<File[]>([]);
  const [existingOriginal, setExistingOriginal] = useState<string[]>(order?.originalFiles || []);
  const [existingTranslated, setExistingTranslated] = useState<string[]>(order?.translatedFiles || []);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<OrderFormValues>({
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
      comment: order?.comment || '',
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

  const handleDeleteExisting = async (filePath: string, index: number, type: 'original' | 'translated') => {
    if(!isManagerOrAdmin || !order) return

    if(type === 'original'){
      //original
      setExistingOriginal(prev => prev.filter((_, idx) => idx !== index))
    }

    // translated
    if(type === 'translated'){
      setExistingTranslated(prev => prev.filter((_, idx) => idx !== index))
    }

    await ordersApi.removeFile(order.id, filePath, type);
    toast({ title: t('orders.deleteFiles'), status: 'success', duration: 2000 });

  }

  return (
      <Box as="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={6} align="stretch">
          <Grid gridTemplateColumns={{base: '1fr', md: '1fr', lg: '1.2fr 1fr', xl: '1.2fr 1fr'}} gap={4}>
            <Flex flexDir='column' minW='250px'>
              {isManagerOrAdmin && (
                  <ClientInfoSection register={register} errors={errors} />
              )}

              <TranslationDetailsSection register={register} errors={errors} control={control} />

              {isManagerOrAdmin && (
                  <PaymentSection register={register} control={control} paymentType={paymentType} setValue={setValue} />
              )}

              {isManagerOrAdmin && (
                  <AssignmentSection register={register} translators={translators} />
              )}

              {
                  isManagerOrAdmin && <CommentSection register={register} />
              }
            </Flex>

            <Flex flexDir='column'>
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
                    onRemoveExisting={
                      (filePath, index) => handleDeleteExisting(filePath, index,'original')
                  }
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
                          onRemoveExisting={
                            (filePath, index) => handleDeleteExisting(filePath, index,'translated')
                        }
                          canUpload={true}
                      />
                    </>
                )}
              </VStack>

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
            </Flex>
          </Grid>

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