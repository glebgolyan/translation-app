'use client';
import { Flex, Text, HStack, IconButton, Icon } from '@chakra-ui/react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import { OrderFilters } from '@/entities/order/model/types';

interface TablePaginationProps {
    page: number;
    totalPages: number;
    onChange: (filters: OrderFilters) => void;
    filters: OrderFilters;
}

export function TablePagination({ page, totalPages, onChange, filters }: TablePaginationProps) {
    return (
        <Flex px={4} py={3} borderTop="1px solid" borderColor="gray.100" align="center" justify="space-between">
            <Text fontSize="13px" color="gray.400">
                Page {page} of {totalPages}
            </Text>
            <HStack spacing={2}>
                <IconButton
                    aria-label="Previous" icon={<Icon as={RiArrowLeftLine} />}
                    size="sm" variant="ghost" colorScheme="gray"
                    isDisabled={page === 1}
                    onClick={() => onChange({ ...filters, page: page - 1 })}
                />
                <IconButton
                    aria-label="Next" icon={<Icon as={RiArrowRightLine} />}
                    size="sm" variant="ghost" colorScheme="gray"
                    isDisabled={page === totalPages}
                    onClick={() => onChange({ ...filters, page: page + 1 })}
                />
            </HStack>
        </Flex>
    );
}