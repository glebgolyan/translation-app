'use client';
import { Box, Grid, FormControl, FormLabel, FormErrorMessage, Input, Text } from '@chakra-ui/react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { useT } from '@/shared/hooks/useT';

interface ClientInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function ClientInfoSection({ register, errors }: ClientInfoSectionProps) {
  const { t } = useT();

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
        {t('orders.clientInfo')}
      </Text>
      <Grid
        templateColumns='repeat(2, 1fr)'
        gap={4}
      >
        <FormControl isInvalid={!!errors.clientName}>
          <FormLabel fontSize='13px'>{t('orders.clientName')}</FormLabel>
          <Input
            {...register('clientName')}
            placeholder='John Doe'
            size='sm'
          />
          <FormErrorMessage>{errors.clientName?.message as string}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.phone}>
          <FormLabel fontSize='13px'>{t('orders.phone')}</FormLabel>
          <Input
            {...register('phone')}
            placeholder='+380 XX XXX XXXX'
            size='sm'
          />
          <FormErrorMessage>{errors.phone?.message as string}</FormErrorMessage>
        </FormControl>
      </Grid>
    </Box>
  );
}
