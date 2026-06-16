'use client';
import {
    Flex, InputGroup, InputLeftElement, Input, Button,
    Icon, Box, useColorModeValue,
} from '@chakra-ui/react';
import { RiSearchLine, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import { useT } from '@/shared/hooks/useT';

interface ApostilizationFilterProps {
    month: string;
    search: string;
    onMonthChange: (month: string) => void;
    onSearchChange: (search: string) => void;
}

export function ApostilizationFilter({
                                         month,
                                         search,
                                         onMonthChange,
                                         onSearchChange,
                                     }: ApostilizationFilterProps) {
    const { t } = useT();
    const inputBg = useColorModeValue('white', '#252525');
    const borderColor = useColorModeValue('gray.200', '#2e2e2e');

    const handlePrevMonth = () => {
        const [year, m] = month.split('-');
        let y = parseInt(year);
        let mo = parseInt(m) - 1;
        if (mo === 0) {
            mo = 12;
            y--;
        }
        onMonthChange(`${y}-${String(mo).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const [year, m] = month.split('-');
        let y = parseInt(year);
        let mo = parseInt(m) + 1;
        if (mo === 13) {
            mo = 1;
            y++;
        }
        onMonthChange(`${y}-${String(mo).padStart(2, '0')}`);
    };

    const monthDate = new Date(`${month}-01`);
    const monthLabel = monthDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });

    return (
        <Flex gap={3} mb={6} align="center" flexWrap="wrap">
            {/* Search input */}
            <InputGroup maxW="240px" size="sm">
                <InputLeftElement pointerEvents="none">
                    <Icon as={RiSearchLine} color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder={t('apostilization.searchPlaceholder') || 'Search client name, phone...'}
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    bg={inputBg}
                    borderColor={borderColor}
                />
            </InputGroup>

            {/* Month selector */}
            <Flex gap={2} align="center">
                <Button size="xs" variant="ghost" onClick={handlePrevMonth}>
                    <Icon as={RiArrowLeftLine} />
                </Button>
                <Box minW="150px" textAlign="center">
                    <Box fontSize="13px" fontWeight="600" fontFamily="Syne">
                        {monthLabel}
                    </Box>
                </Box>
                <Button size="xs" variant="ghost" onClick={handleNextMonth}>
                    <Icon as={RiArrowRightLine} />
                </Button>
            </Flex>
        </Flex>
    );
}