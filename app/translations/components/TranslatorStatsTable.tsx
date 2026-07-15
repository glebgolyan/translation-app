'use client';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Input,
  Button,
  Icon,
  useToast,
  Flex,
  Text,
  useColorModeValue,
  Center,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';

export function TranslatorStatsTable() {
  const toast = useToast();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState('');

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const theadBg = useColorModeValue('gray.50', '#222222');
  const thColor = useColorModeValue('gray.500', '#666666');
  const tdColor = useColorModeValue('gray.800', '#e0e0e0');
  const hoverBg = useColorModeValue('gray.50', '#222222');
  const cellInputBg = useColorModeValue('white', '#252525');
  const summaryBg = useColorModeValue('brand.50', '#1a2540');
  const summaryTextColor = useColorModeValue('brand.700', 'brand.300');
  const weekHeaderColor = useColorModeValue('gray.600', '#999999');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['translator-stats', month],
    queryFn: () => translatorStatsApi.getByMonth(month),
  });

  const stats = data?.data || [];

  // Get actual days in month
  const [year, monthNum] = month.split('-');
  const monthDate = new Date(`${year}-${monthNum}-01`);
  const actualDaysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  ).getDate();

  // Calculate weeks based on actual calendar (Monday-Sunday)
  const getWeeks = () => {
    const weeks: any[] = [];
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay(); // 0=Sunday, 1=Monday, ...

    // Adjust for Monday-based week (0=Monday)
    const dayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    let currentWeekStart = 1;
    let weekNumber = 1;

    // First partial week
    const daysInFirstWeek = 7 - dayOffset;
    weeks.push({
      number: weekNumber,
      start: 1,
      end: Math.min(daysInFirstWeek, actualDaysInMonth),
      label: `Week ${weekNumber}`,
    });

    weekNumber++;
    currentWeekStart = daysInFirstWeek + 1;

    // Full weeks
    while (currentWeekStart <= actualDaysInMonth) {
      const weekEnd = Math.min(currentWeekStart + 6, actualDaysInMonth);
      weeks.push({
        number: weekNumber,
        start: currentWeekStart,
        end: weekEnd,
        label: `Week ${weekNumber}`,
      });
      weekNumber++;
      currentWeekStart = weekEnd + 1;
    }

    return weeks;
  };

  const weeks = getWeeks();

  // Calculate totals per translator per week
  const weekTotals = weeks.map((week) => {
    const weekTotal: any = {
      number: week.number,
      startDay: week.start,
      endDay: week.end,
      translators: {},
    };

    stats.forEach((row: any) => {
      let total = 0;
      for (let day = week.start; day <= week.end; day++) {
        total += row[`day${day}`] || 0;
      }
      weekTotal.translators[row.translatorId] = {
        translatorName: row.translatorName,
        total,
      };
    });

    return weekTotal;
  });

  // Calculate grand totals
  const grandTotals: any = {};
  stats.forEach((row: any) => {
    let total = 0;
    for (let day = 1; day <= actualDaysInMonth; day++) {
      total += row[`day${day}`] || 0;
    }
    grandTotals[row.translatorId] = {
      translatorName: row.translatorName,
      total,
    };
  });

  const handlePrevMonth = () => {
    const [year, m] = month.split('-');
    let y = parseInt(year);
    let mo = parseInt(m) - 1;
    if (mo === 0) {
      mo = 12;
      y--;
    }
    setMonth(`${y}-${String(mo).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, m] = month.split('-');
    let y = parseInt(year);
    let mo = parseInt(m) + 1;
    if (mo === 13) {
      mo = 1;
      y++;
    }
    setMonth(`${y}-${String(mo).padStart(2, '0')}`);
  };

  const handleCellClick = (
    statId: string | null,
    currentValue: number,
    translatorId: string,
    day: number
  ) => {
    setEditingCell(`${translatorId}-${day}`);
    setCellValue(String(currentValue));
  };

  const handleSaveCell = async (translatorId: string, day: number, statId: string | null) => {
    const wordCount = parseInt(cellValue) || 0;
    try {
      if (statId) {
        await translatorStatsApi.update(statId, wordCount);
      } else {
        await translatorStatsApi.createOrUpdate(translatorId, month, day, wordCount);
      }
      toast({ title: 'Updated', status: 'success', duration: 1500 });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Failed to update',
        description: err?.response?.data?.message || 'Unknown error',
        status: 'error',
        duration: 2000,
      });
    }
    setEditingCell(null);
  };

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner
          size='lg'
          color='brand.500'
        />
      </Center>
    );
  }

  return (
    <VStack
      spacing={8}
      align='stretch'
    >
      {/* Month selector */}
      <Flex
        gap={4}
        align='center'
      >
        <Text
          fontFamily='Syne'
          fontWeight='600'
          fontSize='14px'
        >
          {monthDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
        </Text>
        <HStack spacing={2}>
          <Button
            size='sm'
            variant='ghost'
            onClick={handlePrevMonth}
          >
            <Icon as={RiArrowLeftLine} />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={handleNextMonth}
          >
            <Icon as={RiArrowRightLine} />
          </Button>
        </HStack>
        <Text
          fontSize='12px'
          color={thColor}
          ml='auto'
        >
          Click cells to edit
        </Text>
      </Flex>

      {/* Daily stats table */}
      <Box
        bg={bg}
        borderRadius='8px'
        border='1px solid'
        borderColor={borderColor}
        overflow='hidden'
      >
        <Box overflowX='auto'>
          <Table
            variant='simple'
            size='sm'
          >
            <Thead bg={theadBg}>
              <Tr>
                <Th
                  width='140px'
                  color={thColor}
                  fontSize='12px'
                  px={3}
                >
                  Translator
                </Th>
                {Array.from({ length: actualDaysInMonth }, (_, i) => i + 1).map((day) => (
                  <Th
                    key={day}
                    width='50px'
                    textAlign='center'
                    color={thColor}
                    fontSize='11px'
                    px={1}
                    py={2}
                  >
                    {day}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {stats.map((row: any) => (
                <Tr
                  key={row.translatorId}
                  _hover={{ bg: hoverBg }}
                  transition='background 0.1s'
                >
                  <Td
                    width='140px'
                    fontSize='13px'
                    fontWeight='500'
                    color={tdColor}
                    px={3}
                    py={3}
                    position='sticky'
                    left={0}
                    bg={bg}
                    zIndex={1}
                  >
                    {row.translatorName}
                  </Td>
                  {Array.from({ length: actualDaysInMonth }, (_, i) => i + 1).map((day) => {
                    const cellKey = `${row.translatorId}-${day}`;
                    const wordCount = row[`day${day}`] || 0;
                    const statId = row[`statId${day}`];
                    const isEditing = editingCell === cellKey;

                    return (
                      <Td
                        key={cellKey}
                        width='50px'
                        px={1}
                        py={1}
                        textAlign='center'
                        cursor='pointer'
                        _hover={{ bg: hoverBg }}
                        transition='background 0.1s'
                      >
                        {isEditing ? (
                          <Input
                            type='number'
                            size='sm'
                            value={cellValue}
                            onChange={(e) => setCellValue(e.target.value)}
                            onBlur={() => handleSaveCell(row.translatorId, day, statId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveCell(row.translatorId, day, statId);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            autoFocus
                            bg={cellInputBg}
                            borderColor='brand.400'
                            _focus={{
                              borderColor: 'brand.500',
                              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                            }}
                          />
                        ) : (
                          <Text
                            fontSize='13px'
                            fontWeight={wordCount > 0 ? '600' : '400'}
                            color={wordCount > 0 ? 'brand.500' : thColor}
                            onClick={() =>
                              handleCellClick(statId, wordCount, row.translatorId, day)
                            }
                          >
                            {wordCount}
                          </Text>
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Weekly summary tables */}
      {weekTotals.map((week) => (
        <Box key={week.number}>
          <Text
            fontFamily='Syne'
            fontWeight='700'
            fontSize='14px'
            color={weekHeaderColor}
            mb={4}
          >
            Week {week.number} (Days {week.startDay}-{week.endDay})
          </Text>
          <Box
            bg={bg}
            borderRadius='8px'
            border='1px solid'
            borderColor={borderColor}
            overflow='hidden'
          >
            <Table
              variant='simple'
              size='sm'
            >
              <Thead bg={theadBg}>
                <Tr>
                  <Th
                    color={thColor}
                    fontSize='12px'
                    px={4}
                    py={3}
                  >
                    Translator
                  </Th>
                  <Th
                    color={thColor}
                    fontSize='12px'
                    px={4}
                    py={3}
                    textAlign='right'
                  >
                    Week Total
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.map((row: any) => {
                  const weekTotal = week.translators[row.translatorId]?.total || 0;
                  return (
                    <Tr
                      key={`${week.number}-${row.translatorId}`}
                      _hover={{ bg: hoverBg }}
                      bg={weekTotal > 0 ? summaryBg : 'transparent'}
                      transition='background 0.1s'
                    >
                      <Td
                        fontSize='13px'
                        fontWeight='500'
                        color={tdColor}
                        px={4}
                        py={3}
                      >
                        {row.translatorName}
                      </Td>
                      <Td
                        fontSize='14px'
                        fontWeight='700'
                        color={weekTotal > 0 ? summaryTextColor : thColor}
                        px={4}
                        py={3}
                        textAlign='right'
                        fontFamily='mono'
                      >
                        {weekTotal.toLocaleString()}
                      </Td>
                    </Tr>
                  );
                })}
                {/* Week subtotal */}
                <Tr bg={summaryBg}>
                  <Td
                    fontSize='13px'
                    fontWeight='700'
                    color={summaryTextColor}
                    px={4}
                    py={3}
                  >
                    Week Total
                  </Td>
                  <Td
                    fontSize='15px'
                    fontWeight='800'
                    color={summaryTextColor}
                    px={4}
                    py={3}
                    textAlign='right'
                    fontFamily='mono'
                  >
                    {stats
                      .reduce(
                        (sum: number, row: any) =>
                          sum + (week.translators[row.translatorId]?.total || 0),
                        0
                      )
                      .toLocaleString()}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>
      ))}

      {/* Grand total table */}
      <Box>
        <Text
          fontFamily='Syne'
          fontWeight='700'
          fontSize='14px'
          color={weekHeaderColor}
          mb={4}
        >
          Total for Month
        </Text>
        <Box
          bg={bg}
          borderRadius='8px'
          border='1px solid'
          borderColor={borderColor}
          overflow='hidden'
        >
          <Table
            variant='simple'
            size='sm'
          >
            <Thead bg={theadBg}>
              <Tr>
                <Th
                  color={thColor}
                  fontSize='12px'
                  px={4}
                  py={3}
                >
                  Translator
                </Th>
                <Th
                  color={thColor}
                  fontSize='12px'
                  px={4}
                  py={3}
                  textAlign='right'
                >
                  Total Words
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.map((row: any) => {
                const total = grandTotals[row.translatorId]?.total || 0;
                return (
                  <Tr
                    key={`total-${row.translatorId}`}
                    _hover={{ bg: hoverBg }}
                    bg={total > 0 ? summaryBg : 'transparent'}
                    transition='background 0.1s'
                  >
                    <Td
                      fontSize='13px'
                      fontWeight='500'
                      color={tdColor}
                      px={4}
                      py={3}
                    >
                      {row.translatorName}
                    </Td>
                    <Td
                      fontSize='14px'
                      fontWeight='700'
                      color={total > 0 ? summaryTextColor : thColor}
                      px={4}
                      py={3}
                      textAlign='right'
                      fontFamily='mono'
                    >
                      {total.toLocaleString()}
                    </Td>
                  </Tr>
                );
              })}
              <Tr bg={summaryBg}>
                <Td
                  fontSize='13px'
                  fontWeight='700'
                  color={summaryTextColor}
                  px={4}
                  py={3}
                >
                  Grand Total
                </Td>
                <Td
                  fontSize='15px'
                  fontWeight='800'
                  color={summaryTextColor}
                  px={4}
                  py={3}
                  textAlign='right'
                  fontFamily='mono'
                >
                  {stats
                    .reduce(
                      (sum: number, row: any) => sum + (grandTotals[row.translatorId]?.total || 0),
                      0
                    )
                    .toLocaleString()}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>
    </VStack>
  );
}
