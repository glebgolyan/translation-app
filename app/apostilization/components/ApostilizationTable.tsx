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
  Icon,
  IconButton,
  useColorModeValue,
  Center,
  Spinner,
  useToast,
  Select,
} from '@chakra-ui/react';
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { useT } from '@/shared/hooks/useT';

interface ApostilizationTableProps {
  month: string;
  search: string;
  onEdit: (item: any) => void;
}

export function ApostilizationTable({ month, search, onEdit }: ApostilizationTableProps) {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const theadBg = useColorModeValue('gray.50', '#222222');
  const thColor = useColorModeValue('gray.500', '#666666');
  const tdColor = useColorModeValue('gray.800', '#e0e0e0');
  const hoverBg = useColorModeValue('gray.50', '#222222');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['apostilization', month, search],
    queryFn: () => apostilizationApi.getAll({ month, search }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apostilizationApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apostilization'] });
      toast({ title: 'Updated', status: 'success', duration: 2000 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apostilizationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apostilization'] });
      toast({ title: 'Deleted', status: 'success', duration: 2000 });
    },
  });

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner color='brand.500' />
      </Center>
    );
  }

  return (
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
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('apostilization.dateOfTaking')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('apostilization.clientName')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('apostilization.documentType')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('apostilization.contact')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
                textAlign='right'
              >
                {t('apostilization.sum')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
                textAlign='right'
              >
                {t('apostilization.remaining')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('apostilization.status')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('apostilization.actions')}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item: any) => (
              <Tr
                key={item.id}
                _hover={{ bg: hoverBg }}
              >
                <Td
                  fontSize='13px'
                  color={tdColor}
                  px={4}
                  py={3}
                >
                  {new Date(item.dateOfTaking).toLocaleDateString('uk-UA')}
                </Td>
                <Td
                  fontSize='13px'
                  color={tdColor}
                  px={4}
                  py={3}
                >
                  {item.clientName}
                </Td>
                <Td
                  fontSize='13px'
                  color={tdColor}
                  px={4}
                  py={3}
                >
                  {item.documentType}
                </Td>
                <Td
                  fontSize='13px'
                  color={tdColor}
                  px={4}
                  py={3}
                >
                  {item.contact}
                </Td>
                <Td
                  fontSize='13px'
                  color={tdColor}
                  px={4}
                  py={3}
                  textAlign='right'
                  fontFamily='mono'
                  fontWeight='600'
                >
                  ₴{item.sum.toLocaleString()}
                </Td>
                <Td
                  fontSize='13px'
                  color={item.remainingAmount > 0 ? 'orange.500' : 'green.500'}
                  px={4}
                  py={3}
                  textAlign='right'
                  fontFamily='mono'
                  fontWeight='600'
                >
                  ₴{item.remainingAmount.toLocaleString()}
                </Td>
                <Td
                  fontSize='13px'
                  px={4}
                  py={3}
                >
                  <Select
                    size='xs'
                    value={item.status}
                    onChange={(e) => updateMutation.mutate({ id: item.id, status: e.target.value })}
                    maxW='120px'
                    fontFamily='Syne'
                    fontWeight='600'
                    fontSize='11px'
                  >
                    <option value='IN_PROGRESS'>{t('apostilization.inWork')}</option>
                    <option value='DONE'>{t('apostilization.done')}</option>
                    <option value='TAKEN'>{t('apostilization.TAKEN')}</option>
                  </Select>
                </Td>
                <Td
                  px={4}
                  py={3}
                >
                  <HStack spacing={1}>
                    <IconButton
                      aria-label='Edit'
                      icon={<Icon as={RiEditLine} />}
                      size='xs'
                      variant='ghost'
                      colorScheme='brand'
                      onClick={() => onEdit(item)}
                    />
                    <IconButton
                      aria-label='Delete'
                      icon={<Icon as={RiDeleteBinLine} />}
                      size='xs'
                      variant='ghost'
                      colorScheme='red'
                      onClick={() => deleteMutation.mutate(item.id)}
                      isLoading={deleteMutation.isPending}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
