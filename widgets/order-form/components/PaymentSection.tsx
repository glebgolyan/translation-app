'use client';
import {
  Box,
  Grid,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  Text,
} from '@chakra-ui/react';
import { UseFormRegister, Controller, UseFormSetValue, useWatch } from 'react-hook-form';
import { useT } from '@/shared/hooks/useT';
import { useEffect } from 'react';

interface PaymentSectionProps {
  register: UseFormRegister<any>;
  control: any;
  paymentType: string;
  setValue: UseFormSetValue<any>;
}

export function PaymentSection({ register, control, paymentType, setValue }: PaymentSectionProps) {
  const { t } = useT();

  const totalPrice = useWatch({ control, name: 'totalPrice' });
  const deposit = useWatch({ control, name: 'deposit' });

  useEffect(() => {
    const total = Number(totalPrice) || 0;
    const dep = Number(deposit) || 0;
    const remaining = Math.max(0, total - dep);
    setValue('remainingAmount', remaining, { shouldValidate: false });
  }, [totalPrice, deposit, setValue]);

  return (
    <Box>
      <Text
        fontFamily='Syne'
        fontWeight='700'
        fontSize='13px'
        letterSpacing='0.06em'
        textTransform='uppercase'
        color='gray.400'
        mb={4}
      >
        {t('orders.payment')}
      </Text>
      <Grid
        templateColumns='repeat(3, 1fr)'
        gap={4}
      >
        <FormControl>
          <FormLabel fontSize='13px'>{t('orders.totalPrice')} (₴)</FormLabel>
          <Controller
            name='totalPrice'
            control={control}
            render={({ field }) => (
              <NumberInput
                size='sm'
                min={0}
                value={field.value}
                onChange={(_, v) => field.onChange(isNaN(v) ? 0 : v)}
              >
                <NumberInputField />
              </NumberInput>
            )}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize='13px'>{t('orders.deposit')} (₴)</FormLabel>
          <Controller
            name='deposit'
            control={control}
            render={({ field }) => (
              <NumberInput
                size='sm'
                min={0}
                value={field.value}
                onChange={(_, v) => field.onChange(isNaN(v) ? 0 : v)}
              >
                <NumberInputField />
              </NumberInput>
            )}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize='13px'>{t('orders.remaining')} (₴)</FormLabel>
          <Controller
            name='remainingAmount'
            control={control}
            render={({ field }) => (
              <NumberInput
                size='sm'
                min={0}
                value={field.value}
                isReadOnly
              >
                <NumberInputField
                  bg='gray.50'
                  _dark={{ bg: '#222222' }}
                  cursor='default'
                  fontWeight='600'
                  color={Number(field.value) > 0 ? 'orange.500' : 'green.500'}
                />
              </NumberInput>
            )}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize='13px'>{t('orders.paymentType')}</FormLabel>
          <Select
            {...register('paymentType')}
            size='sm'
          >
            <option value='cash'>{t('orders.cash')}</option>
            <option value='card'>{t('orders.card')}</option>
            <option value='mixed'>{t('orders.mixed')}</option>
          </Select>
        </FormControl>

        {(paymentType === 'card' || paymentType === 'mixed') && (
          <FormControl>
            <FormLabel fontSize='13px'>{t('orders.cardAmount')} (₴)</FormLabel>
            <Controller
              name='cardAmount'
              control={control}
              render={({ field }) => (
                <NumberInput
                  size='sm'
                  min={0}
                  value={field.value || 0}
                  onChange={(_, v) => field.onChange(isNaN(v) ? 0 : v)}
                >
                  <NumberInputField />
                </NumberInput>
              )}
            />
          </FormControl>
        )}
      </Grid>
    </Box>
  );
}
