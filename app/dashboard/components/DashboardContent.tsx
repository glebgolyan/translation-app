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
import { User } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';
import { StatCard } from './StatCard';
import { RecentOrders } from './RecentOrders';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { useState } from 'react';
import { getDateRange, getPreviousMonthRange, percentChange } from '@/shared/lib/dateRange';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';

export function DashboardContent({ user }: { user: User }) {
  const { t } = useT();

  const [month] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [prevMonth] = useState(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  });

  const { dateFrom } = getDateRange('month');
  const { dateFrom: prevDateFrom, dateTo: prevDateTo } = getPreviousMonthRange();

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

  // Last month's equivalents, purely for the "% from last month" badges —
  // same shape of query/aggregation as the current-month figures below,
  // just against the previous month's bounded date range.
  const { data: prevOrdersData } = useQuery({
    queryKey: ['orders', 'dashboard', 'prev', prevDateFrom, prevDateTo],
    queryFn: () => ordersApi.getAll({ limit: 200, dateFrom: prevDateFrom, dateTo: prevDateTo }),
  });

  const { data: prevApostilization = [] } = useQuery({
    queryKey: ['apostilization', 'prev', prevMonth],
    queryFn: () => apostilizationApi.getAll({ month: prevMonth }),
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

  // Same aggregation, previous month's data.
  const prevOrders = prevOrdersData?.data || [];
  const prevTotal = prevOrdersData?.total || 0;
  const prevInProgress = prevOrders.filter(
    (o) => o.status === 'IN_PROGRESS' || o.status === 'DONE' || o.status === 'NEW'
  ).length;
  const prevDone = prevOrders.filter(
    (o) => o.status === 'CERTIFIED' || o.status === 'TAKEN' || o.status === 'ARCHIVE'
  ).length;
  const prevTotalApostilization = prevApostilization.reduce((sum, a) => sum + a.costPrice, 0);
  const prevTotalOrders = prevOrders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const prevRevenue = prevTotalOrders + prevTotalApostilization;
  const prevNotarizationCount = prevOrders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.notarizationCount, 0);
  const prevNotarizationValue = prevNotarizationCount * 200;

  const totalChange = percentChange(total, prevTotal);
  const inProgressChange = percentChange(inProgress, prevInProgress);
  const doneChange = percentChange(done, prevDone);
  const revenueChange = percentChange(revenue, prevRevenue);
  const notarizationChange = percentChange(totalNotarizationValue, prevNotarizationValue);
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
          change={totalChange}
        />
        <StatCard
          label={t('dashboard.inProgress')}
          value={inProgress}
          icon={RiTimeLine}
          color='#fdcb6e'
          change={inProgressChange}
        />
        <StatCard
          label={t('dashboard.completed')}
          value={done}
          icon={RiCheckboxCircleLine}
          color='#00b894'
          change={doneChange}
        />
        {user?.role === 'ADMIN' && (
          <StatCard
            label={t('dashboard.revenue')}
            value={`₴${revenue.toLocaleString()}`}
            totalCard={totalCard}
            icon={RiMoneyDollarCircleLine}
            color='#a29bfe'
            change={revenueChange}
          />
        )}

        {user?.role === 'ADMIN' && (
          <StatCard
            label={t('status.CERTIFIED')}
            value={`₴${totalNotarizationValue.toLocaleString()}`}
            totalCard={totalStats}
            icon={RiMoneyDollarCircleLine}
            color='#a29bfe'
            change={notarizationChange}
          />
        )}
      </Grid>

      <RecentOrders orders={orders} />
    </Box>
  );
}
