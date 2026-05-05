'use client';
import {Flex, InputGroup, InputLeftElement, Input, Select, Icon, Text, useColorModeValue} from '@chakra-ui/react';
import { RiSearchLine } from 'react-icons/ri';
import { OrderFilters, OrderStatus } from '@/entities/order/model/types';
import { useT } from '@/shared/hooks/useT';

interface TableFiltersProps {
    filters: OrderFilters;
    total: number;
    onChange: (filters: OrderFilters) => void;
}

export function TableFilters({ filters, total, onChange }: TableFiltersProps) {
    const { t } = useT();

    const bg = useColorModeValue('white', '#1a1a1a');
    const borderColor = useColorModeValue('gray.100', '#2e2e2e');
    const labelColor = useColorModeValue('gray.400', '#666666');
    const valueColor = useColorModeValue('gray.900', '#f0f0f0');

    return (
        <Flex gap={3} mb={4} align="center" flexWrap="wrap">
            <InputGroup maxW="280px" size="sm">
                <InputLeftElement pointerEvents="none">
                    <Icon as={RiSearchLine} color={valueColor} />
                </InputLeftElement>
                <Input
                    placeholder={t('orders.searchPlaceholder')}
                    value={filters.search || ''}
                    onChange={e => onChange({ ...filters, search: e.target.value, page: 1 })}
                    bg={bg} borderColor={borderColor}
                />
            </InputGroup>

            <Select
                size="sm" maxW="160px" bg={bg} borderColor={borderColor}
                value={filters.status || ''}
                onChange={e => onChange({ ...filters, status: (e.target.value as OrderStatus) || undefined, page: 1 })}
            >
                <option value="">{t('orders.allStatuses')}</option>
                <option value="NEW">{t('status.NEW')}</option>
                <option value="IN_PROGRESS">{t('status.IN_PROGRESS')}</option>
                <option value="DONE">{t('status.DONE')}</option>
                <option value="PAID">{t('status.PAID')}</option>
            </Select>

            <Text fontSize="13px" color={labelColor} ml="auto">{total} orders</Text>
        </Flex>
    );
}