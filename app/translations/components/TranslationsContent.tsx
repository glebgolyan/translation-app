'use client';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { TranslatorStatsTable } from './TranslatorStatsTable';

export function TranslationsContent() {
  const textColor = useColorModeValue('gray.900', '#f0f0f0');

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Box mb={8}>
        <Text
          fontFamily='Syne'
          fontWeight='800'
          fontSize={{ base: '16px', md: '24px' }}
          letterSpacing='-0.02em'
          color={textColor}
        >
          Translator Statistics
        </Text>
        <Text
          color='grey.500'
          fontSize={{ base: '14px', md: '18px' }}
          mt={0.5}
        >
          Нужно заплатить в гривне
        </Text>
      </Box>

      <TranslatorStatsTable />
    </Box>
  );
}
