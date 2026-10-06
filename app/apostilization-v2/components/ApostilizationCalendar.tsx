'use client';
// app/apostilization-v2/components/ApostilizationCalendar.tsx
import { Box, Grid, VStack, HStack, Text, Center, Spinner, useColorModeValue } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { Apostilization } from '@/entities/apostilization/model/types';
import { useT } from '@/shared/hooks/useT';

const STATUS_COLOR: Record<string, string> = {
  NEW: 'blue',
  IN_PROGRESS: 'orange',
  DONE: 'green',
  TAKEN: 'gray',
  CANCELLED: 'red',
};

function statusColor(status: string) {
  return STATUS_COLOR[status] ?? 'gray';
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface CalendarCell {
  date: Date;
  inMonth: boolean;
}

function buildCalendarCells(month: string): CalendarCell[] {
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const firstWeekday = new Date(year, monthNum - 1, 1).getDay(); // 0=Sun..6=Sat
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1; // Monday-first
  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
  const prevMonthDays = new Date(year, monthNum - 1, 0).getDate();

  return Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - leadingBlanks + 1;
    if (dayNum < 1) {
      return { date: new Date(year, monthNum - 2, prevMonthDays + dayNum), inMonth: false };
    }
    if (dayNum > daysInMonth) {
      return { date: new Date(year, monthNum, dayNum - daysInMonth), inMonth: false };
    }
    return { date: new Date(year, monthNum - 1, dayNum), inMonth: true };
  });
}

const MAX_VISIBLE = 2;

interface ApostilizationCalendarProps {
  month: string; // "YYYY-MM"
  search: string;
  onEditItem: (item: Apostilization) => void;
  onCreateForDate: (dateISO: string) => void;
}

export function ApostilizationCalendar({
  month,
  search,
  onEditItem,
  onCreateForDate,
}: ApostilizationCalendarProps) {
  const { t, locale } = useT();

  const bg = useColorModeValue('white', '#1a1a1a');
  const mutedBg = useColorModeValue('gray.50', '#161616');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const dayNumberColor = useColorModeValue('gray.500', '#888888');
  const mutedDayNumberColor = useColorModeValue('gray.300', '#444444');
  const weekdayColor = useColorModeValue('gray.400', '#666666');
  const textColor = useColorModeValue('gray.800', '#e0e0e0');
  const mutedTextColor = useColorModeValue('gray.400', '#777777');
  const todayBorder = useColorModeValue('brand.400', 'brand.300');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['apostilization', month, search],
    queryFn: () => apostilizationApi.getAll({ month, search }),
  });

  const cells = useMemo(() => buildCalendarCells(month), [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, Apostilization[]>();
    for (const item of items) {
      const key = dateKey(new Date(item.dateOfTaking));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [items]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, { weekday: 'short' });
    // 2024-01-01 is a Monday — generates Mon..Sun regardless of locale week start.
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const todayKey = dateKey(new Date());

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner color='brand.500' />
      </Center>
    );
  }

  return (
    <Box>
      <Grid
        templateColumns='repeat(7, 1fr)'
        gap={2}
        mb={2}
      >
        {weekdayLabels.map((label) => (
          <Text
            key={label}
            fontSize='11px'
            fontWeight='600'
            textTransform='uppercase'
            letterSpacing='0.04em'
            color={weekdayColor}
            textAlign='center'
          >
            {label}
          </Text>
        ))}
      </Grid>

      <Grid
        templateColumns='repeat(7, 1fr)'
        gap={2}
      >
        {cells.map((cell) => {
          const key = dateKey(cell.date);
          const dayItems = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const visible = dayItems.slice(0, MAX_VISIBLE);
          const overflow = dayItems.length - visible.length;

          return (
            <Box
              key={key}
              minH={{ base: '72px', md: '112px' }}
              p={1.5}
              borderRadius='8px'
              border='1px solid'
              borderColor={isToday ? todayBorder : borderColor}
              bg={cell.inMonth ? bg : mutedBg}
              cursor={cell.inMonth && dayItems.length === 0 ? 'pointer' : 'default'}
              onClick={
                cell.inMonth && dayItems.length === 0 ? () => onCreateForDate(key) : undefined
              }
              _hover={
                cell.inMonth && dayItems.length === 0 ? { borderColor: 'brand.300' } : undefined
              }
              transition='border-color 0.15s'
            >
              <Text
                fontSize='12px'
                fontWeight={isToday ? '700' : '500'}
                color={
                  !cell.inMonth ? mutedDayNumberColor : isToday ? todayBorder : dayNumberColor
                }
                mb={1}
              >
                {cell.date.getDate()}
              </Text>

              {cell.inMonth && (
                <VStack
                  spacing={1}
                  align='stretch'
                >
                  {visible.map((item) => (
                    <Box
                      key={item.id}
                      onClick={() => onEditItem(item)}
                      bg={`${statusColor(item.status)}.50`}
                      _dark={{ bg: `${statusColor(item.status)}.900` }}
                      borderLeft='3px solid'
                      borderColor={`${statusColor(item.status)}.400`}
                      borderRadius='4px'
                      px={1.5}
                      py={0.5}
                      cursor='pointer'
                      _hover={{ opacity: 0.85 }}
                    >
                      <HStack
                        spacing={1}
                        justify='space-between'
                        align='flex-start'
                      >
                        <Text
                          fontSize='11px'
                          fontWeight='600'
                          noOfLines={1}
                          color={textColor}
                        >
                          {item.clientName}
                        </Text>
                        {item.remainingAmount > 0 && (
                          <Box
                            w='5px'
                            h='5px'
                            mt='3px'
                            borderRadius='full'
                            bg='orange.400'
                            flexShrink={0}
                          />
                        )}
                      </HStack>
                      <Text
                        fontSize='9px'
                        color={mutedTextColor}
                      >
                        {t('apostilization.submittedOn')}{' '}
                        {new Date(item.createdAt).toLocaleDateString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </Text>
                    </Box>
                  ))}
                  {overflow > 0 && (
                    <Text
                      fontSize='10px'
                      color={mutedTextColor}
                      pl={1}
                    >
                      +{overflow} {t('apostilization.more')}
                    </Text>
                  )}
                </VStack>
              )}
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
}
