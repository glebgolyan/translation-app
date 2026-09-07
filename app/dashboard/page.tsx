import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';
import { getDateRange, getPreviousMonthRange } from '@/shared/lib/dateRange';
import { DashboardContent } from './components/DashboardContent';

export default async function DashboardPage() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { dateFrom } = getDateRange('month');
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const { dateFrom: prevDateFrom, dateTo: prevDateTo } = getPreviousMonthRange();

  // Auth check and data prefetch don't depend on each other — run them
  // concurrently instead of waiting for the session lookup before even
  // starting the page's own queries. Halves the round-trip latency on
  // every navigation to this page.
  const [user] = await Promise.all([
    getServerUser(),
    queryClient.prefetchQuery({
      queryKey: ['translator-stats', month],
      queryFn: () => translatorStatsApi.getByMonth(month, client),
    }),
    queryClient.prefetchQuery({
      queryKey: ['orders', 'dashboard', dateFrom],
      queryFn: () => ordersApi.getAll({ limit: 120, dateFrom }, client),
    }),
    queryClient.prefetchQuery({
      queryKey: ['apostilization'],
      queryFn: () => apostilizationApi.getAll({ month }, client),
    }),
    // "% from last month" comparisons — same shape as above, previous month.
    queryClient.prefetchQuery({
      queryKey: ['orders', 'dashboard', 'prev', prevDateFrom, prevDateTo],
      queryFn: () => ordersApi.getAll({ limit: 200, dateFrom: prevDateFrom, dateTo: prevDateTo }, client),
    }),
    queryClient.prefetchQuery({
      queryKey: ['apostilization', 'prev', prevMonth],
      queryFn: () => apostilizationApi.getAll({ month: prevMonth }, client),
    }),
  ]);
  if (!user) redirect('/login');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent user={user} />
    </HydrationBoundary>
  );
}
