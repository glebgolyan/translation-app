'use client';
import { Box, Grid, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  RiFileList3Line,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiMoneyDollarCircleLine,
} from 'react-icons/ri';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { useAuth } from '@/features/auth/model/useAuth';
import { useT } from '@/shared/hooks/useT';
import { StatCard } from './components/StatCard';
import { RecentOrders } from './components/RecentOrders';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { useState } from 'react';
import { getDateRange } from '@/widgets/order-table/components/TableFilters';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useT();

  const [month] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { dateFrom } = getDateRange('month');

  const { data } = useQuery({
    queryKey: ['translator-stats', month],
    queryFn: () => translatorStatsApi.getByMonth(month),
  });

  const stats = data?.data || [];

  const [year, monthNum] = month.split('-');

  const monthDate = new Date(`${year}-${monthNum}-01`);
  const actualDaysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  ).getDate();

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

  const totalStats = stats
    .reduce((sum: number, row: any) => sum + (grandTotals[row.translatorId]?.total || 0), 0)
    .toLocaleString();

  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'dashboard', dateFrom],
    queryFn: () => ordersApi.getAll({ limit: 120, dateFrom }),
  });

  const { data: apostilization = [] } = useQuery({
    queryKey: ['apostilization'],
    queryFn: () => apostilizationApi.getAll({ month }),
  });

  const orders = ordersData?.data || [];
  const total = ordersData?.total || 0;
  const inProgress = orders.filter(
    (o) => o.status === 'IN_PROGRESS' || o.status === 'DONE' || o.status === 'NEW'
  ).length;
  const done = orders.filter(
    (o) => o.status === 'CERTIFIED' || o.status === 'TAKEN' || o.status === 'ARCHIVE'
  ).length;

  const totalApostilization = apostilization.reduce((sum, a) => sum + a.costPrice, 0);

  const totalOrders = orders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const revenue = totalOrders + totalApostilization;

  const totalCard = orders
    .filter((order) => order.status !== 'CANCELLED')
    .filter((order) => order.paymentType === 'card')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalNotarizationCount = orders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.notarizationCount, 0);

  const totalNotarizationValue = totalNotarizationCount * 200;
  return (
    <Box p={8}>
      <Box mb={8}>
        <Text
          fontFamily='Syne'
          fontWeight='800'
          fontSize='26px'
          letterSpacing='-0.02em'
          mb={1}
        >
          {t('dashboard.greeting')}, {user?.name?.split(' ')[0]} 👋
        </Text>
        <Text
          color='gray.500'
          fontSize='14px'
        >
          {t('dashboard.subtitle')}
        </Text>
      </Box>

      <Grid
        templateColumns={{ base: '1fr', lg: `repeat(${user?.role === 'ADMIN' ? 4 : 3}, 1fr)` }}
        gap={4}
        mb={8}
      >
        <StatCard
          label={t('dashboard.totalOrders')}
          value={total}
          icon={RiFileList3Line}
          color='#4d76ff'
          change={0}
        />
        <StatCard
          label={t('dashboard.inProgress')}
          value={inProgress}
          icon={RiTimeLine}
          color='#fdcb6e'
        />
        <StatCard
          label={t('dashboard.completed')}
          value={done}
          icon={RiCheckboxCircleLine}
          color='#00b894'
          change={0}
        />
        {user?.role === 'ADMIN' && (
          <StatCard
            label={t('dashboard.revenue')}
            value={`₴${revenue.toLocaleString()}`}
            totalCard={totalCard}
            icon={RiMoneyDollarCircleLine}
            color='#a29bfe'
            change={0}
          />
        )}

        {user?.role === 'ADMIN' && (
          <StatCard
            label={t('status.CERTIFIED')}
            value={`₴${totalNotarizationValue.toLocaleString()}`}
            totalCard={totalStats}
            icon={RiMoneyDollarCircleLine}
            color='#a29bfe'
            change={0}
          />
        )}
      </Grid>

      <RecentOrders orders={orders} />
    </Box>
  );
}
