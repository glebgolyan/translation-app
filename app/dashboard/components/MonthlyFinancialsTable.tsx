'use client';
import { APP_LOCALE } from '@/shared/lib/format';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { useT } from '@/shared/hooks/useT';

const MONTH_OPTIONS = [3, 6, 12, 24] as const;

function formatMoney(value: number) {
  return `₴${Math.round(value).toLocaleString(APP_LOCALE)}`;
}

export function MonthlyFinancialsTable() {
  const { t } = useT();
  const [months, setMonths] = useState<number>(12);

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const theadBg = useColorModeValue('gray.50', '#222222');
  const thColor = useColorModeValue('gray.500', '#666666');
  const tdColor = useColorModeValue('gray.800', '#e0e0e0');
  const positiveColor = useColorModeValue('green.600', 'green.300');
  const negativeColor = useColorModeValue('red.500', 'red.300');

  // One request for however many months are selected — the backend
  // aggregates with GROUP BY in SQL, so this stays fast whether `months`
  // is 3 or 24 instead of fetching every order/apostilization row here.
  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard', 'monthly-financials', months],
    queryFn: () => dashboardApi.getMonthlyFinancials(months),
  });

  const rows = [...data].reverse(); // most recent month first

  const monthLabelOptions: Record<(typeof MONTH_OPTIONS)[number], string> = {
    3: t('dashboard.last3Months'),
    6: t('dashboard.last6Months'),
    12: t('dashboard.last12Months'),
    24: t('dashboard.last24Months'),
  };

  return (
    <Box
      bg={bg}
      borderRadius='8px'
      border='1px solid'
      borderColor={borderColor}
      mb={8}
    >
      <Flex
        justify='space-between'
        align='center'
        p={{ base: 3, md: 6 }}
        pb={{ base: 2, md: 4 }}
        flexWrap='wrap'
        gap={3}
      >
        <Text
          fontFamily='Syne'
          fontWeight='700'
          fontSize='16px'
        >
          {t('dashboard.monthlyHistory')}
        </Text>
        <HStack spacing={2}>
          {MONTH_OPTIONS.map((option) => (
            <Button
              key={option}
              size='sm'
              variant={months === option ? 'solid' : 'outline'}
              colorScheme='brand'
              onClick={() => setMonths(option)}
            >
              {monthLabelOptions[option]}
            </Button>
          ))}
        </HStack>
      </Flex>

      {isLoading ? (
        <Center py={10}>
          <Spinner size='md' />
        </Center>
      ) : (
        <Box overflowX='auto'>
          <Table size='sm'>
            <Thead bg={theadBg}>
              <Tr>
                <Th color={thColor}>{t('dashboard.month')}</Th>
                <Th
                  color={thColor}
                  isNumeric
                >
                  {t('dashboard.revenue')}
                </Th>
                <Th
                  color={thColor}
                  isNumeric
                >
                  {t('dashboard.notarization')}
                </Th>
                <Th
                  color={thColor}
                  isNumeric
                >
                  {t('dashboard.translatorPayouts')}
                </Th>
                <Th
                  color={thColor}
                  isNumeric
                >
                  {t('dashboard.profit')}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row) => (
                <Tr key={row.month}>
                  <Td color={tdColor}>{row.month}</Td>
                  <Td
                    color={tdColor}
                    isNumeric
                  >
                    {formatMoney(row.revenue)}
                  </Td>
                  <Td
                    color={tdColor}
                    isNumeric
                  >
                    {formatMoney(row.notarizationValue)}
                  </Td>
                  <Td
                    color={tdColor}
                    isNumeric
                  >
                    {formatMoney(row.translatorPayouts)}
                  </Td>
                  <Td
                    color={row.profit >= 0 ? positiveColor : negativeColor}
                    isNumeric
                    fontWeight='600'
                  >
                    {formatMoney(row.profit)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
