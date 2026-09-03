import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { translatorStatsApi } from '@/features/translator-stats/api/translatorStatsApi';
import { TranslationsContent } from './components/TranslationsContent';

export default async function TranslationsPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') redirect('/dashboard');

  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await queryClient.prefetchQuery({
    queryKey: ['translator-stats', month],
    queryFn: () => translatorStatsApi.getByMonth(month, client),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TranslationsContent />
    </HydrationBoundary>
  );
}
