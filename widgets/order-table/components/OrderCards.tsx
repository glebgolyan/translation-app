'use client';
import {
  Box,
  Grid,
  GridItem,
  Text,
  HStack,
  Flex,
  Icon,
  useColorModeValue,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { RiEyeLine, RiEditLine } from 'react-icons/ri';
import { useLanguageConfig } from '@/shared/hooks/useLanguageConfig';
import { useT } from '@/shared/hooks/useT';
import { Order } from '@/entities/order/model/types';
import { UserRole } from '@/entities/user/model/types';
import { FileStatusBadge } from '@/widgets/order-table/components/FileStatusBadge';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface OrderRowProps {
  order: Order;
  visibleColumns: any[];
  userRole: UserRole;
  onView?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

export function OrderCard({ order, userRole, onView, onEdit }: OrderRowProps) {
  const { t } = useT();

  const { getLanguageName } = useLanguageConfig();

  const cardBg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.200', '#2e2e2e');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'gray.100');

  const isLate =
    order.dueDate &&
    new Date(order.dueDate) < new Date() &&
    order.status !== 'DONE' &&
    order.status !== 'PAID';
  return (
    <Grid>
      <GridItem key={order.id}>
        <Box
          bg={cardBg}
          border='1px solid'
          borderColor={borderColor}
          borderRadius='12px'
          p={4}
          position='relative'
          transition='box-shadow 0.2s'
          _hover={{ boxShadow: 'md' }}
        >
          {/* Header row: order number + file status */}
          <Flex
            justify='space-between'
            align='center'
            mb={3}
          >
            <Text
              fontSize='13px'
              fontFamily='mono'
              fontWeight='700'
              color='teal.400'
            >
              #{order.orderNumber}
            </Text>
            <FileStatusBadge
              originalFiles={order.originalFiles}
              translatedFiles={order.translatedFiles}
              filesDeletedAt={order.filesDeletedAt}
            />
          </Flex>

          {/* Status badge */}
          <Box mb={3}>
            <StatusBadge status={order.status} />
          </Box>

          <Divider
            borderColor={borderColor}
            mb={3}
          />

          <Grid
            gridTemplateColumns='repeat(2, 1fr)'
            gap={4}
          >
            {/* Date received */}
            <Box>
              <Text
                fontSize='10px'
                color={labelColor}
                fontWeight='600'
                textTransform='uppercase'
                letterSpacing='0.06em'
                mb={0.5}
              >
                {t('orders.received')}
              </Text>
              <Text
                fontSize='13px'
                fontFamily='mono'
                color='gray.200'
              >
                {new Date(order.createdAt).toLocaleDateString('uk-UA')}
              </Text>
            </Box>

            {/* Deadline */}
            <Box>
              <Text
                fontSize='10px'
                color={labelColor}
                fontWeight='600'
                textTransform='uppercase'
                letterSpacing='0.06em'
                mb={0.5}
              >
                {t('orders.deadline')}
              </Text>
              <Text
                fontSize='13px'
                fontFamily='mono'
                color={isLate ? 'red.500' : 'gray.200'}
                fontWeight={isLate ? '600' : '400'}
              >
                {order.dueDate ? new Date(order.dueDate).toLocaleDateString('uk-UA') : '—'}
              </Text>
            </Box>

            <Box>
              <Text
                fontSize='10px'
                color={labelColor}
                fontWeight='600'
                textTransform='uppercase'
                letterSpacing='0.06em'
                mb={0.5}
              >
                {t('orders.totalPrice')}
              </Text>
              <Text>
                💰 {t('orders.totalPrice')}: ₴{order.totalPrice.toLocaleString()}
              </Text>
              <Text>
                ⬇️ {t('orders.deposit')}: ₴{order.deposit.toLocaleString()}
              </Text>
              <Text color={order.remainingAmount > 0 ? 'orange.300' : 'green.300'}>
                🔄 {t('orders.remaining')}: ₴{order.remainingAmount.toLocaleString()}
              </Text>
              <Text
                fontSize='11px'
                color='gray.400'
                mt={1}
                textTransform='capitalize'
              >
                {order.paymentType}
                {order.cardAmount ? ` · ₴${order.cardAmount} card` : ''}
              </Text>
            </Box>

            {/* Client */}
            <Box>
              <Text
                fontSize='10px'
                color={labelColor}
                fontWeight='600'
                textTransform='uppercase'
                letterSpacing='0.06em'
                mb={0.5}
              >
                {t('orders.clientName')}
              </Text>
              <Text
                fontSize='13px'
                fontWeight='500'
              >
                {order.clientName}
              </Text>
              <Text
                fontSize='13px'
                color='gray.400'
              >
                {order.phone}
              </Text>
            </Box>

            {/* Languages */}
            <Box>
              <Text
                fontSize='10px'
                color={labelColor}
                fontWeight='600'
                textTransform='uppercase'
                letterSpacing='0.06em'
                mb={0.5}
              >
                {t('orders.languages')}
              </Text>
              <Text
                fontSize='12px'
                fontWeight='500'
                color={valueColor}
              >
                {getLanguageName(order.sourceLanguage)} → {getLanguageName(order.targetLanguage)}
              </Text>
            </Box>

            {/* Document type */}
            {order.documentType && (
              <Box>
                <Text
                  fontSize='10px'
                  color={labelColor}
                  fontWeight='600'
                  textTransform='uppercase'
                  letterSpacing='0.06em'
                  mb={0.5}
                >
                  {t('orders.documentType')}
                </Text>
                <Text
                  fontSize='12px'
                  color={valueColor}
                  noOfLines={1}
                >
                  {order.documentType}
                </Text>
              </Box>
            )}

            {/* Translator */}
            {order.translator && (
              <Box>
                <Text
                  fontSize='10px'
                  color={labelColor}
                  fontWeight='600'
                  textTransform='uppercase'
                  letterSpacing='0.06em'
                  mb={0.5}
                >
                  {t('orders.translator')}
                </Text>
                <Text
                  fontSize='12px'
                  color={valueColor}
                  noOfLines={1}
                >
                  {order.translator?.name || t('orders.unassigned')}
                </Text>
              </Box>
            )}

            <Box>
              <Text
                fontSize='10px'
                color={labelColor}
                fontWeight='600'
                textTransform='uppercase'
                letterSpacing='0.06em'
                mb={0.5}
              >
                {t('orders.comment')}
              </Text>
              {order.comment ? (
                <Tooltip
                  label={order.comment}
                  placement='top'
                  hasArrow
                  maxW='280px'
                  bg={useColorModeValue('gray.800', '#2a2a2a')}
                  color='white'
                  borderRadius='6px'
                  p={3}
                  fontSize='12px'
                  whiteSpace='pre-wrap'
                >
                  <Text
                    fontSize='12px'
                    noOfLines={2}
                    cursor='default'
                    maxW='140px'
                    overflow='hidden'
                    textOverflow='ellipsis'
                  >
                    {order.comment}
                  </Text>
                </Tooltip>
              ) : (
                <Text fontSize='12px'>—</Text>
              )}
            </Box>
          </Grid>

          <Divider
            borderColor={borderColor}
            mt={3}
            mb={3}
          />

          {/* Actions */}
          {onView && onEdit && (
            <HStack
              spacing={2}
              justify='flex-end'
            >
              <IconButton
                aria-label='View'
                icon={<Icon as={RiEyeLine} />}
                size='sm'
                variant='ghost'
                onClick={() => onView(order)}
              />
              {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                <IconButton
                  aria-label='Edit'
                  icon={<Icon as={RiEditLine} />}
                  size='sm'
                  variant='ghost'
                  onClick={() => onEdit(order)}
                />
              )}
            </HStack>
          )}
        </Box>
      </GridItem>

      {/*{orders.length === 0 && (*/}
      {/*    <GridItem colSpan={2}>*/}
      {/*        <Box*/}
      {/*            bg={cardBg}*/}
      {/*            border="1px solid"*/}
      {/*            borderColor={borderColor}*/}
      {/*            borderRadius="12px"*/}
      {/*            p={8}*/}
      {/*            textAlign="center"*/}
      {/*        >*/}
      {/*            <Text color={labelColor} fontSize="14px">*/}
      {/*                {t('orders.noOrders') || 'No orders found'}*/}
      {/*            </Text>*/}
      {/*        </Box>*/}
      {/*    </GridItem>*/}
      {/*)}*/}
    </Grid>
  );
}
