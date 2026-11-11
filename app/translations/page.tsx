import { monthKey } from '@/shared/lib/dateRange';
import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';
import { TranslationsContent } from './components/TranslationsContent';

export default async function TranslationsPage() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const month = monthKey();

  const [user] = await Promise.all([
    getServerUser(),
    queryClient.prefetchQuery({
      queryKey: ['translator-stats', month],
      queryFn: () => translatorStatsApi.getByMonth(month, client),
    }),
  ]);
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TranslationsContent />
    </HydrationBoundary>
  );
}
