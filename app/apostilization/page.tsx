import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { ApostilizationContent } from './components/ApostilizationContent';

export default async function ApostilizationPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') redirect('/dashboard');

  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await queryClient.prefetchQuery({
    queryKey: ['apostilization', month, ''],
    queryFn: () => apostilizationApi.getAll({ month, search: '' }, client),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApostilizationContent />
    </HydrationBoundary>
  );
}
