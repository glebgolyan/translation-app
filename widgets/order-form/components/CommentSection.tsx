'use client';
import { Box, FormControl, FormLabel, Textarea, Text } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';
import { useT } from '@/shared/hooks/useT';
import { useColorModeValue } from '@chakra-ui/react';

interface CommentSectionProps {
  register: UseFormRegister<any>;
}

export function CommentSection({ register }: CommentSectionProps) {
  const { t } = useT();
  const borderColor = useColorModeValue('gray.200', '#2e2e2e');
  const bg = useColorModeValue('white', '#1a1a1a');
  const labelColor = useColorModeValue('gray.400', '#666666');

  return (
    <Box>
      <Text
        fontFamily='Syne'
        fontWeight='700'
        fontSize='13px'
        letterSpacing='0.06em'
        textTransform='uppercase'
        color={labelColor}
        mb={4}
      >
        {t('orders.comment')}
      </Text>
      <FormControl>
        <Textarea
          {...register('comment')}
          placeholder={t('orders.commentPlaceholder')}
          size='sm'
          rows={3}
          bg={bg}
          borderColor={borderColor}
          borderRadius='6px'
          resize='vertical'
          _focus={{
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          }}
        />
      </FormControl>
    </Box>
  );
}
