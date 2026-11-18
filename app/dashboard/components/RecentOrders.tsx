'use client';
import { APP_LOCALE, formatDate } from '@/shared/lib/format';
import { Box, Flex, Link, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { Order } from '@/entities/order/model/types';
import { StatusBadge } from '@/entities/order/ui/StatusBadge';
import { useT } from '@/shared/hooks/useT';
import NextLink from 'next/link';
import { useDashboardCardStyle, DASHBOARD_FONT_STACK } from './dashboardStyles';

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const { t } = useT();
  const card = useDashboardCardStyle();

  const dividerColor = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.06)');
  const headerText = useColorModeValue('#1d1d1f', '#f5f5f7');
  const clientNameColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const langColor = useColorModeValue('gray.400', '#6e6e73');
  const dateColor = useColorModeValue('gray.400', '#6e6e73');
  const priceColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const emptyColor = useColorModeValue('gray.400', '#555555');
  const hoverBg = useColorModeValue('rgba(0,0,0,0.025)', 'rgba(255,255,255,0.04)');

  return (
    <Box {...card}>
      <Flex
        px={{ base: 4, md: 6 }}
        py={5}
        align='center'
        justify='space-between'
        borderBottom='1px solid'
        borderColor={dividerColor}
      >
        <Text
          fontFamily={DASHBOARD_FONT_STACK}
          fontWeight='600'
          fontSize='16px'
          letterSpacing='-0.01em'
          color={headerText}
        >
          {t('dashboard.recentOrders')}
        </Text>

        <Link
          as={NextLink}
          href='orders'
          color={useColorModeValue('brand.500', 'brand.300')}
          fontSize='14px'
          fontWeight='500'
          _hover={{ textDecoration: 'underline' }}
        >
          {t('dashboard.viewAll')}
        </Link>
      </Flex>

      <VStack
        spacing={0}
        align='stretch'
        divider={
          <Box
            borderBottom='1px solid'
            borderColor={dividerColor}
          />
        }
      >
        {orders.length === 0 ? (
          <Box
            py={12}
            textAlign='center'
          >
            <Text
              color={emptyColor}
              fontSize='14px'
            >
              {t('dashboard.noOrders')}
            </Text>
          </Box>
        ) : (
          orders.map((order) => (
            <Flex
              key={order.id}
              px={{ base: 4, md: 6 }}
              py={4}
              align='center'
              gap={4}
              _hover={{ bg: hoverBg }}
              cursor='pointer'
              transition='background 0.15s'
              flexWrap='wrap'
              justifyContent='space-between'
            >
              <Box flex={1}>
                <Text
                  fontSize='14px'
                  fontWeight='500'
                  mb={0.5}
                  color={clientNameColor}
                  fontFamily={DASHBOARD_FONT_STACK}
                >
                  {order.clientName}
                </Text>
                <Text
                  fontSize='12px'
                  color={langColor}
                  fontFamily='mono'
                >
                  {order.sourceLanguage} → {order.targetLanguage}
                </Text>
              </Box>
              <Text
                fontSize='12px'
                color={dateColor}
              >
                {formatDate(order.createdAt)}
              </Text>
              <StatusBadge status={order.status} />
              <Text
                fontSize='14px'
                fontWeight='600'
                fontFamily={DASHBOARD_FONT_STACK}
                color={priceColor}
                sx={{ fontFeatureSettings: '"tnum"' }}
              >
                ₴{order.totalPrice.toLocaleString(APP_LOCALE)}
              </Text>
            </Flex>
          ))
        )}
      </VStack>
    </Box>
  );
}
