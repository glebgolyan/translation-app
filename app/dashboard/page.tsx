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

  // Auth check and the orders prefetch (needed by every role — total/in
  // progress/completed are shown to everyone) run concurrently, same as
  // before. Revenue/notarization are ADMIN-only cards, so their underlying
  // data (apostilization, translator-stats) is fetched in a second,
  // role-gated step below instead of unconditionally here — no point
  // hitting those endpoints for a MANAGER/TRANSLATOR who'll never see the
  // result.
  const [user] = await Promise.all([
    getServerUser(),
    queryClient.prefetchQuery({
      queryKey: ['orders', 'dashboard', dateFrom],
      queryFn: () => ordersApi.getAll({ limit: 120, dateFrom }, client),
    }),
    queryClient.prefetchQuery({
      queryKey: ['orders', 'dashboard', 'prev', prevDateFrom, prevDateTo],
      queryFn: () => ordersApi.getAll({ limit: 200, dateFrom: prevDateFrom, dateTo: prevDateTo }, client),
    }),
  ]);
  if (!user) redirect('/login');

  if (user.role === 'ADMIN') {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['translator-stats', month],
        queryFn: () => translatorStatsApi.getByMonth(month, client),
      }),
      queryClient.prefetchQuery({
        queryKey: ['apostilization'],
        queryFn: () => apostilizationApi.getAll({ month }, client),
      }),
      queryClient.prefetchQuery({
        queryKey: ['apostilization', 'prev', prevMonth],
        queryFn: () => apostilizationApi.getAll({ month: prevMonth }, client),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent user={user} />
    </HydrationBoundary>
  );
}
