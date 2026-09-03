import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { orderRequestsApi } from '@/features/order-requests/api/orderRequestsApi';
import { usersApi } from '@/features/admin/api/usersApi';
import { RequestsContent } from './components/RequestsContent';

export default async function RequestsPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') redirect('/dashboard');

  const client = createServerApiClient();
  const queryClient = new QueryClient();
  const defaultFilters = { search: '', converted: undefined };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['translators'],
      queryFn: () => usersApi.getTranslators(client),
    }),
    queryClient.prefetchQuery({
      queryKey: ['order-requests', defaultFilters],
      queryFn: () => orderRequestsApi.getAll(defaultFilters, client),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequestsContent />
    </HydrationBoundary>
  );
}
