'use client';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Divider,
  Icon,
  Link,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RiSaveLine, RiFileLine } from 'react-icons/ri';
import { OrderRequest } from '@/entities/order-request/model/types';
import { UpdateOrderDto } from '@/entities/order/model/types';
import { User } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';
import { ClientInfoSection } from '@/widgets/order-form/components/ClientInfoSection';
import { TranslationDetailsSection } from '@/widgets/order-form/components/TranslationDetailsSection';
import { PaymentSection } from '@/widgets/order-form/components/PaymentSection';
import { AssignmentSection } from '@/widgets/order-form/components/AssignmentSection';
import { CommentSection } from '@/widgets/order-form/components/CommentSection';

const schema = z.object({
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
  status: z.enum([
    'NEW',
    'IN_PROGRESS',
    'DONE',
    'PAID',
    'CANCELLED',
    'CERTIFIED',
    'TAKEN',
    'ARCHIVE',
  ]),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ConvertRequestFormProps {
  request: OrderRequest;
  translators?: User[];
  onSubmit: (data: UpdateOrderDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConvertRequestForm({
  request,
  translators = [],
  onSubmit,
  onCancel,
  isLoading,
}: ConvertRequestFormProps) {
  const { t } = useT();
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const labelColor = useColorModeValue('gray.400', '#666666');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      clientName: request.clientName,
      phone: request.phone,
      documentType: '',
      documentCount: 1,
      notarizationCount: 0,
      totalPrice: 0,
      deposit: 0,
      remainingAmount: 0,
      paymentType: 'cash',
      cardAmount: 0,
      translatorId: '',
      comment: '',
      status: 'NEW',
      dueDate: '',
    },
  });

  const paymentType = watch('paymentType');

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({ ...values, originalFiles: request.files } as UpdateOrderDto);
  };

  return (
    <Box
      as='form'
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <VStack
        spacing={6}
        align='stretch'
      >
        {request.files.length > 0 && (
          <Box>
            <Text
              fontFamily='Syne'
              fontWeight='700'
              fontSize='13px'
              letterSpacing='0.06em'
              textTransform='uppercase'
              color={labelColor}
              mb={3}
            >
              {t('requests.attachedFiles')}
            </Text>
            <Wrap spacing={2}>
              {request.files.map((f, i) => (
                <WrapItem key={f}>
                  <Link
                    href={f}
                    isExternal
                    fontSize='12px'
                    display='flex'
                    alignItems='center'
                    gap={1}
                    px={2}
                    py={1}
                    borderRadius='6px'
                    border='1px solid'
                    borderColor={borderColor}
                  >
                    <Icon as={RiFileLine} />
                    {t('requests.file')} {i + 1}
                  </Link>
                </WrapItem>
              ))}
            </Wrap>
            <Text
              fontSize='11px'
              color={labelColor}
              mt={2}
            >
              {t('requests.filesCarryOverNote')}
            </Text>
            <Divider
              mt={4}
              borderColor={borderColor}
            />
          </Box>
        )}

        <ClientInfoSection
          register={register}
          errors={errors}
        />

        <TranslationDetailsSection
          register={register}
          errors={errors}
          control={control}
        />

        <PaymentSection
          register={register}
          control={control}
          paymentType={paymentType}
          setValue={setValue}
        />

        <AssignmentSection
          register={register}
          translators={translators}
        />

        <CommentSection register={register} />

        <HStack
          justify='flex-end'
          pt={2}
        >
          <Button
            variant='ghost'
            size='sm'
            onClick={onCancel}
            colorScheme='gray'
          >
            {t('orders.cancel')}
          </Button>
          <Button
            type='submit'
            size='sm'
            isLoading={isLoading}
            leftIcon={<Icon as={RiSaveLine} />}
          >
            {t('requests.convertToOrder')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
