'use client';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '@/features/auth/model/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TranslatorStatsTable } from './components/TranslatorStatsTable';

export default function TranslationsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const textColor = useColorModeValue('gray.900', '#f0f0f0');

  useEffect(() => {
    if (user && user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) return null;

  return (
    <Box p={8}>
      <Box mb={8}>
        <Text
          fontFamily='Syne'
          fontWeight='800'
          fontSize='24px'
          letterSpacing='-0.02em'
          color={textColor}
        >
          Translator Statistics
        </Text>
        <Text
          color='grey.500'
          fontSize='14px'
          mt={0.5}
        >
          Нужно заплатить в гривне
        </Text>
      </Box>

      <TranslatorStatsTable />
    </Box>
  );
}
