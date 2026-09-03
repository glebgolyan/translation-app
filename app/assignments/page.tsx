import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { AssignmentsContent } from './components/AssignmentsContent';

export default async function AssignmentsPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  const client = createServerApiClient();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['orders', 'assigned'],
    queryFn: () => ordersApi.getAll({ limit: 50 }, client),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssignmentsContent user={user} />
    </HydrationBoundary>
  );
}
