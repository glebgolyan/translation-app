import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { MyOrdersContent } from './components/MyOrdersContent';

export default async function MyOrdersPage() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const [user] = await Promise.all([
    getServerUser(),
    queryClient.prefetchQuery({
      queryKey: ['orders', 'my'],
      queryFn: () => ordersApi.getAll({ limit: 50 }, client),
    }),
  ]);
  if (!user) redirect('/login');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyOrdersContent />
    </HydrationBoundary>
  );
}
