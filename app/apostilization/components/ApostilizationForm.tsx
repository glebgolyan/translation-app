'use client';
import {
  Box,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RiSaveLine } from 'react-icons/ri';
import { useT } from '@/shared/hooks/useT';
import { useWatch } from 'react-hook-form';

const schema = z.object({
  dateOfTaking: z.string().min(1, 'Required'),
  clientName: z.string().min(1, 'Required'),
  documentType: z.string().min(1, 'Required'),
  contact: z.string().min(1, 'Required'),
  whatToDo: z.string().min(1, 'Required'),
  sum: z.number().min(0),
  deposit: z.number().min(0),
  costPrice: z.number().min(0),
  paymentType: z.enum(['cash', 'card']),
  status: z.enum(['IN_PROGRESS', 'DONE']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ApostilizationFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ApostilizationForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ApostilizationFormProps) {
  const { t } = useT();
  const labelColor = useColorModeValue('gray.400', '#666666');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dateOfTaking: initialData?.dateOfTaking
        ? new Date(initialData.dateOfTaking).toISOString().split('T')[0]
        : '',
      clientName: initialData?.clientName || '',
      documentType: initialData?.documentType || '',
      contact: initialData?.contact || '',
      whatToDo: initialData?.whatToDo || '',
      sum: initialData?.sum || 0,
      deposit: initialData?.deposit || 0,
      costPrice: initialData?.costPrice || 0,
      paymentType: initialData?.paymentType || 'cash',
      status: initialData?.status || 'IN_PROGRESS',
      notes: initialData?.notes || '',
    },
  });

  const sum = useWatch({ control, name: 'sum' });
  const deposit = useWatch({ control, name: 'deposit' });
  const remaining = Math.max(0, Number(sum) - Number(deposit));

  return (
    <Box
      as='form'
      onSubmit={handleSubmit(onSubmit)}
    >
      <VStack
        spacing={6}
        align='stretch'
      >
        <Grid
          templateColumns='repeat(2, 1fr)'
          gap={4}
        >
          <FormControl isInvalid={!!errors.dateOfTaking}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.dateOfTaking')}
            </FormLabel>
            <Input
              {...register('dateOfTaking')}
              type='date'
              size='sm'
            />
          </FormControl>

          <FormControl isInvalid={!!errors.clientName}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.clientName')}
            </FormLabel>
            <Input
              {...register('clientName')}
              size='sm'
            />
          </FormControl>

          <FormControl isInvalid={!!errors.documentType}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.documentType')}
            </FormLabel>
            <Input
              {...register('documentType')}
              placeholder='Passport, Certificate, etc.'
              size='sm'
            />
          </FormControl>

          <FormControl isInvalid={!!errors.contact}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.contact')}
            </FormLabel>
            <Input
              {...register('contact')}
              placeholder='+380 XX XXX XXXX or email@example.com'
              size='sm'
            />
          </FormControl>

          <FormControl isInvalid={!!errors.whatToDo}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.whatToDo')}
            </FormLabel>
            <Input
              {...register('whatToDo')}
              size='sm'
            />
          </FormControl>

          <FormControl isInvalid={!!errors.costPrice}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.costPrice')}
            </FormLabel>
            <Controller
              name='costPrice'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type='number'
                  size='sm'
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Box>
          <Text
            fontFamily='Syne'
            fontWeight='700'
            fontSize='13px'
            color={labelColor}
            mb={4}
          >
            {t('apostilization.payment')}
          </Text>
          <Grid
            templateColumns='repeat(3, 1fr)'
            gap={4}
          >
            <FormControl isInvalid={!!errors.sum}>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                {t('apostilization.sum')} (₴)
              </FormLabel>
              <Controller
                name='sum'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type='number'
                    size='sm'
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormControl>

            <FormControl isInvalid={!!errors.deposit}>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                {t('apostilization.deposit')} (₴)
              </FormLabel>
              <Controller
                name='deposit'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type='number'
                    size='sm'
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize='13px'
                color={labelColor}
              >
                {t('apostilization.remaining')} (₴)
              </FormLabel>
              <Input
                type='number'
                size='sm'
                value={remaining}
                isReadOnly
                bg='gray.50'
                _dark={{ bg: '#222222' }}
                color={remaining > 0 ? 'orange.500' : 'green.500'}
                fontWeight='600'
              />
            </FormControl>
          </Grid>
        </Box>

        <Grid
          templateColumns='repeat(2, 1fr)'
          gap={4}
        >
          <FormControl isInvalid={!!errors.paymentType}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.paymentType')}
            </FormLabel>
            <Select
              {...register('paymentType')}
              size='sm'
            >
              <option value='cash'>{t('apostilization.cash')}</option>
              <option value='card'>{t('apostilization.card')}</option>
            </Select>
          </FormControl>

          <FormControl isInvalid={!!errors.status}>
            <FormLabel
              fontSize='13px'
              color={labelColor}
            >
              {t('apostilization.status')}
            </FormLabel>
            <Select
              {...register('status')}
              size='sm'
            >
              <option value='IN_PROGRESS'>{t('apostilization.inWork')}</option>
              <option value='DONE'>{t('apostilization.done')}</option>
            </Select>
          </FormControl>
        </Grid>

        <FormControl>
          <FormLabel
            fontSize='13px'
            color={labelColor}
          >
            {t('apostilization.notes')}
          </FormLabel>
          <Textarea
            {...register('notes')}
            placeholder='Optional notes...'
            size='sm'
            rows={3}
          />
        </FormControl>

        <HStack
          justify='flex-end'
          pt={4}
        >
          <Button
            variant='ghost'
            size='sm'
            onClick={onCancel}
          >
            {t('apostilization.cancel')}
          </Button>
          <Button
            type='submit'
            size='sm'
            isLoading={isLoading}
            leftIcon={<Icon as={RiSaveLine} />}
          >
            {t('apostilization.save')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
