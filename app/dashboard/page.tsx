import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';
import { getDateRange } from '@/shared/lib/dateRange';
import { DashboardContent } from './components/DashboardContent';

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { dateFrom } = getDateRange('month');

  await Promise.all([
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
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent user={user} />
    </HydrationBoundary>
  );
}
