import { monthKey } from '@/shared/lib/dateRange';
import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { ApostilizationContent } from './components/ApostilizationContent';

export default async function ApostilizationPage() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const month = monthKey();

  const [user] = await Promise.all([
    getServerUser(),
    queryClient.prefetchQuery({
      queryKey: ['apostilization', month, ''],
      queryFn: () => apostilizationApi.getAll({ month, search: '' }, client),
    }),
  ]);
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApostilizationContent />
    </HydrationBoundary>
  );
}
