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
  Badge,
  Text,
  useColorModeValue,
  Center,
  Spinner,
  useBreakpointValue,
  Grid,
  Divider,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { RiArrowRightLine, RiDeleteBinLine, RiAttachment2 } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { orderRequestsApi } from '@/features/order-requests/api/orderRequestsApi';
import { OrderRequest, OrderRequestFilters } from '@/entities/order-request/model/types';
import { useLanguageConfig } from '@/shared/hooks/useLanguageConfig';
import { useT } from '@/shared/hooks/useT';

interface RequestsTableProps {
  filters: OrderRequestFilters;
  onConvert: (request: OrderRequest) => void;
  onDelete: (request: OrderRequest) => void;
}

export function RequestsTable({ filters, onConvert, onDelete }: RequestsTableProps) {
  const { t } = useT();
  const { getLanguageName } = useLanguageConfig();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const theadBg = useColorModeValue('gray.50', '#222222');
  const thColor = useColorModeValue('gray.500', '#666666');
  const tdColor = useColorModeValue('gray.800', '#e0e0e0');
  const hoverBg = useColorModeValue('gray.50', '#222222');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  const { data, isLoading } = useQuery({
    queryKey: ['order-requests', filters],
    queryFn: () => orderRequestsApi.getAll(filters),
  });

  const requests = data?.data || [];

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner color='brand.500' />
      </Center>
    );
  }

  if (requests.length === 0) {
    return (
      <Center py={12}>
        <Text
          color={labelColor}
          fontSize='14px'
        >
          {t('requests.empty')}
        </Text>
      </Center>
    );
  }

  const StatusBadge = ({ request }: { request: OrderRequest }) =>
    request.convertedOrderId ? (
      <Badge
        colorScheme='green'
        fontSize='10px'
        borderRadius='4px'
      >
        {t('requests.converted')}
      </Badge>
    ) : (
      <Badge
        colorScheme='orange'
        fontSize='10px'
        borderRadius='4px'
      >
        {t('requests.pending')}
      </Badge>
    );

  const ContactLine = ({ request }: { request: OrderRequest }) => (
    <Text
      fontSize='12px'
      color={labelColor}
    >
      {t(`requests.contact.${request.preferredContact}`)}
      {request.email ? ` · ${request.email}` : ''}
    </Text>
  );

  const RowActions = ({ request }: { request: OrderRequest }) => (
    <HStack spacing={1}>
      {!request.convertedOrderId && (
        <Tooltip label={t('requests.convertToOrder')}>
          <IconButton
            aria-label='Convert'
            icon={<Icon as={RiArrowRightLine} />}
            size='xs'
            variant='ghost'
            colorScheme='brand'
            onClick={() => onConvert(request)}
          />
        </Tooltip>
      )}
      <Tooltip label={t('requests.delete')}>
        <IconButton
          aria-label='Delete'
          icon={<Icon as={RiDeleteBinLine} />}
          size='xs'
          variant='ghost'
          colorScheme='red'
          onClick={() => onDelete(request)}
        />
      </Tooltip>
    </HStack>
  );

  if (isMobile) {
    return (
      <Grid
        templateColumns='1fr'
        gap={3}
      >
        {requests.map((request) => (
          <Box
            key={request.id}
            bg={bg}
            border='1px solid'
            borderColor={borderColor}
            borderRadius='12px'
            p={4}
          >
            <Flex
              justify='space-between'
              align='center'
              mb={2}
            >
              <Text
                fontSize='13px'
                fontWeight='700'
              >
                {request.clientName}
              </Text>
              <StatusBadge request={request} />
            </Flex>

            <Text
              fontSize='12px'
              color={labelColor}
            >
              {new Date(request.createdAt).toLocaleString('uk-UA')}
            </Text>
            <Text
              fontSize='13px'
              color={tdColor}
              mt={1}
            >
              {request.phone}
            </Text>
            <ContactLine request={request} />
            <Text
              fontSize='12px'
              color={tdColor}
              mt={1}
            >
              {getLanguageName(request.sourceLanguage)} → {getLanguageName(request.targetLanguage)}
            </Text>
            {request.files.length > 0 && (
              <HStack
                spacing={1}
                mt={1}
                color={labelColor}
              >
                <Icon
                  as={RiAttachment2}
                  boxSize={3}
                />
                <Text fontSize='11px'>
                  {request.files.length} {t('requests.file')}
                </Text>
              </HStack>
            )}

            <Divider
              borderColor={borderColor}
              my={3}
            />

            <Flex justify='flex-end'>
              <RowActions request={request} />
            </Flex>
          </Box>
        ))}
      </Grid>
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
                {t('requests.date')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('orders.clientName')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('orders.phone')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('requests.preferredContact')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('orders.languages')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('requests.files')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('requests.status')}
              </Th>
              <Th
                color={thColor}
                fontSize='12px'
                px={4}
              >
                {t('users.actions')}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((request) => (
              <Tr
                key={request.id}
                _hover={{ bg: hoverBg }}
              >
                <Td
                  fontSize='12px'
                  color={tdColor}
                  px={4}
                  py={3}
                  fontFamily='mono'
                >
                  {new Date(request.createdAt).toLocaleString('uk-UA')}
                </Td>
                <Td
                  fontSize='13px'
                  color={tdColor}
                  px={4}
                  py={3}
                >
                  {request.clientName}
                </Td>
                <Td
                  fontSize='13px'
                  color={tdColor}
                  px={4}
                  py={3}
                >
                  {request.phone}
                </Td>
                <Td
                  px={4}
                  py={3}
                >
                  <ContactLine request={request} />
                </Td>
                <Td
                  fontSize='12px'
                  color={tdColor}
                  px={4}
                  py={3}
                >
                  {getLanguageName(request.sourceLanguage)} → {getLanguageName(request.targetLanguage)}
                </Td>
                <Td
                  fontSize='12px'
                  color={labelColor}
                  px={4}
                  py={3}
                >
                  {request.files.length || '—'}
                </Td>
                <Td
                  px={4}
                  py={3}
                >
                  <StatusBadge request={request} />
                </Td>
                <Td
                  px={4}
                  py={3}
                >
                  <RowActions request={request} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
