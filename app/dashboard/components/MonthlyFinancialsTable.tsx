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
import { useDashboardCardStyle, DASHBOARD_FONT_STACK } from './dashboardStyles';

const MONTH_OPTIONS = [3, 6, 12, 24] as const;

function formatMoney(value: number) {
  return `₴${Math.round(value).toLocaleString(APP_LOCALE)}`;
}

export function MonthlyFinancialsTable() {
  const { t } = useT();
  const [months, setMonths] = useState<number>(12);

  const card = useDashboardCardStyle();
  const dividerColor = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.06)');
  const headerText = useColorModeValue('#1d1d1f', '#f5f5f7');
  const thColor = useColorModeValue('gray.400', '#6e6e73');
  const tdColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const positiveColor = useColorModeValue('green.600', 'green.300');
  const negativeColor = useColorModeValue('red.500', 'red.300');
  const rowHoverBg = useColorModeValue('rgba(0,0,0,0.02)', 'rgba(255,255,255,0.03)');

  // Segmented-control look: one gray track, a white/dark "thumb" under
  // whichever option is active — Apple's switcher pattern (Health,
  // Stocks date-range pickers) instead of four separate outline buttons.
  const trackBg = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.08)');
  const thumbBg = useColorModeValue('white', '#2c2c2e');
  const thumbShadow = useColorModeValue('0 1px 3px rgba(0,0,0,0.12)', '0 1px 3px rgba(0,0,0,0.4)');
  const optionColorActive = useColorModeValue('#1d1d1f', '#f5f5f7');
  const optionColorInactive = useColorModeValue('gray.500', '#9a9a9e');

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
      {...card}
      mb={8}
    >
      <Flex
        justify='space-between'
        align='center'
        px={{ base: 4, md: 6 }}
        py={5}
        flexWrap='wrap'
        gap={3}
      >
        <Text
          fontFamily={DASHBOARD_FONT_STACK}
          fontWeight='600'
          fontSize='16px'
          letterSpacing='-0.01em'
          color={headerText}
        >
          {t('dashboard.monthlyHistory')}
        </Text>

        <Flex
          bg={trackBg}
          borderRadius='full'
          p='3px'
          gap='2px'
        >
          {MONTH_OPTIONS.map((option) => {
            const active = months === option;
            return (
              <Flex
                key={option}
                as='button'
                onClick={() => setMonths(option)}
                align='center'
                justify='center'
                px={3}
                py={1.5}
                borderRadius='full'
                bg={active ? thumbBg : 'transparent'}
                boxShadow={active ? thumbShadow : 'none'}
                color={active ? optionColorActive : optionColorInactive}
                fontSize='13px'
                fontWeight={active ? '600' : '500'}
                fontFamily={DASHBOARD_FONT_STACK}
                transition='all 0.15s ease'
                cursor='pointer'
              >
                {monthLabelOptions[option]}
              </Flex>
            );
          })}
        </Flex>
      </Flex>

      {isLoading ? (
        <Center py={10}>
          <Spinner size='md' />
        </Center>
      ) : (
        <Box overflowX='auto'>
          <Table
            size='sm'
            variant='unstyled'
          >
            <Thead>
              <Tr>
                <Th
                  color={thColor}
                  fontFamily={DASHBOARD_FONT_STACK}
                  textTransform='none'
                  fontWeight='500'
                  fontSize='13px'
                  letterSpacing='0'
                  borderColor={dividerColor}
                  borderBottom='1px solid'
                  pb={3}
                >
                  {t('dashboard.month')}
                </Th>
                <Th
                  color={thColor}
                  fontFamily={DASHBOARD_FONT_STACK}
                  textTransform='none'
                  fontWeight='500'
                  fontSize='13px'
                  letterSpacing='0'
                  borderColor={dividerColor}
                  borderBottom='1px solid'
                  pb={3}
                  isNumeric
                >
                  {t('dashboard.revenue')}
                </Th>
                <Th
                  color={thColor}
                  fontFamily={DASHBOARD_FONT_STACK}
                  textTransform='none'
                  fontWeight='500'
                  fontSize='13px'
                  letterSpacing='0'
                  borderColor={dividerColor}
                  borderBottom='1px solid'
                  pb={3}
                  isNumeric
                >
                  {t('dashboard.notarization')}
                </Th>
                <Th
                  color={thColor}
                  fontFamily={DASHBOARD_FONT_STACK}
                  textTransform='none'
                  fontWeight='500'
                  fontSize='13px'
                  letterSpacing='0'
                  borderColor={dividerColor}
                  borderBottom='1px solid'
                  pb={3}
                  isNumeric
                >
                  {t('dashboard.translatorPayouts')}
                </Th>
                <Th
                  color={thColor}
                  fontFamily={DASHBOARD_FONT_STACK}
                  textTransform='none'
                  fontWeight='500'
                  fontSize='13px'
                  letterSpacing='0'
                  borderColor={dividerColor}
                  borderBottom='1px solid'
                  pb={3}
                  isNumeric
                >
                  {t('dashboard.profit')}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row, i) => (
                <Tr
                  key={row.month}
                  _hover={{ bg: rowHoverBg }}
                  transition='background 0.15s'
                >
                  <Td
                    color={tdColor}
                    fontFamily={DASHBOARD_FONT_STACK}
                    fontSize='14px'
                    borderColor={dividerColor}
                    borderBottom={i === rows.length - 1 ? 'none' : '1px solid'}
                    py={3.5}
                    px={{ base: 4, md: 6 }}
                  >
                    {row.month}
                  </Td>
                  <Td
                    color={tdColor}
                    isNumeric
                    fontSize='14px'
                    borderColor={dividerColor}
                    borderBottom={i === rows.length - 1 ? 'none' : '1px solid'}
                    py={3.5}
                    sx={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {formatMoney(row.revenue)}
                  </Td>
                  <Td
                    color={tdColor}
                    isNumeric
                    fontSize='14px'
                    borderColor={dividerColor}
                    borderBottom={i === rows.length - 1 ? 'none' : '1px solid'}
                    py={3.5}
                    sx={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {formatMoney(row.notarizationValue)}
                  </Td>
                  <Td
                    color={tdColor}
                    isNumeric
                    fontSize='14px'
                    borderColor={dividerColor}
                    borderBottom={i === rows.length - 1 ? 'none' : '1px solid'}
                    py={3.5}
                    sx={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {formatMoney(row.translatorPayouts)}
                  </Td>
                  <Td
                    color={row.profit >= 0 ? positiveColor : negativeColor}
                    isNumeric
                    fontWeight='600'
                    fontSize='14px'
                    borderColor={dividerColor}
                    borderBottom={i === rows.length - 1 ? 'none' : '1px solid'}
                    py={3.5}
                    px={{ base: 4, md: 6 }}
                    sx={{ fontFeatureSettings: '"tnum"' }}
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
