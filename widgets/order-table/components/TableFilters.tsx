'use client';
import {
    Flex, InputGroup, InputLeftElement, Input, Select,
    Icon, Text, Button, useColorModeValue,
} from '@chakra-ui/react';
import { RiSearchLine, RiCalendarLine } from 'react-icons/ri';
import { OrderFilters, OrderStatus } from '@/entities/order/model/types';
import { useT } from '@/shared/hooks/useT';

interface TableFiltersProps {
    filters: OrderFilters;
    total: number;
    onChange: (filters: OrderFilters) => void;
}

type DateRange = 'all' | 'week' | 'month' | 'year';

const DATE_RANGES: { value: DateRange; label: string }[] = [
    { value: 'all', label: 'All time' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
    { value: 'year', label: 'Last year' },
];

function getDateRange(range: DateRange): { dateFrom?: string; dateTo?: string } {
    if (range === 'all') return {};
    const now = new Date();
    const to = now.toISOString();
    let from: Date;

    if (range === 'week') {
        from = new Date();
        from.setDate(now.getDate() - 7);
    } else if (range === 'month') {
        from = new Date();
        from.setMonth(now.getMonth() - 1);
    } else {
        from = new Date();
        from.setFullYear(now.getFullYear() - 1);
    }

    return { dateFrom: from.toISOString(), dateTo: to };
}

export function TableFilters({ filters, total, onChange }: TableFiltersProps) {
    const { t } = useT();

    const activeBg = useColorModeValue('brand.500', 'brand.500');
    const inactiveBg = useColorModeValue('white', '#1a1a1a');
    const inactiveBorder = useColorModeValue('gray.200', '#2e2e2e');
    const inactiveColor = useColorModeValue('gray.600', '#888888');
    const totalColor = useColorModeValue('gray.400', '#666666');

    const activeRange: DateRange = (() => {
        if (!filters.dateFrom) return 'all';
        const diff = Date.now() - new Date(filters.dateFrom).getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        if (days <= 8) return 'week';
        if (days <= 32) return 'month';
        return 'year';
    })();

    const handleRangeChange = (range: DateRange) => {
        const { dateFrom, dateTo } = getDateRange(range);
        onChange({ ...filters, dateFrom, dateTo, page: 1 });
    };

    return (
        <Flex gap={3} mb={4} align="center" flexWrap="wrap">
            {/* Search */}
            <InputGroup maxW="240px" size="sm">
                <InputLeftElement pointerEvents="none">
                    <Icon as={RiSearchLine} color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder={t('orders.searchPlaceholder')}
                    value={filters.search || ''}
                    onChange={e => onChange({ ...filters, search: e.target.value, page: 1 })}
                    bg={inactiveBg}
                    borderColor={inactiveBorder}
                />
            </InputGroup>

            {/* Status filter */}
            <Select
                size="sm" maxW="150px"
                bg={inactiveBg}
                borderColor={inactiveBorder}
                value={filters.status || ''}
                onChange={e => onChange({ ...filters, status: (e.target.value as OrderStatus) || undefined, page: 1 })}
            >
                <option value="">{t('orders.allStatuses')}</option>
                <option value="NEW">{t('status.NEW')}</option>
                <option value="IN_PROGRESS">{t('status.IN_PROGRESS')}</option>
                <option value="CANCELLED">{t('status.CANCELLED')}</option>
                <option value="CERTIFIED">{t('status.CERTIFIED')}</option>
                <option value="DONE">{t('status.DONE')}</option>
                <option value="TAKEN">{t('status.TAKEN')}</option>
                <option value="PAID">{t('status.PAID')}</option>
            </Select>

            {/* Date range pills */}
            <Flex gap={2} flexWrap='wrap' alignItems='center'>
                <Icon as={RiCalendarLine} color={totalColor} boxSize={4} />
                {DATE_RANGES.map(range => {
                    const isActive = activeRange === range.value;
                    return (
                        <Button
                            key={range.value}
                            size="xs"
                            fontFamily="Syne"
                            fontWeight="600"
                            fontSize="11px"
                            px={3}
                            borderRadius="20px"
                            bg={isActive ? activeBg : inactiveBg}
                            color={isActive ? 'white' : inactiveColor}
                            border="1px solid"
                            borderColor={isActive ? 'brand.500' : inactiveBorder}
                            _hover={{
                                bg: isActive ? 'brand.600' : inactiveBorder,
                            }}
                            onClick={() => handleRangeChange(range.value)}
                        >
                            {range.label}
                        </Button>
                    );
                })}
            </Flex>

            <Text fontSize="13px" color={totalColor} ml="auto">
                {total} orders
            </Text>
        </Flex>
    );
}