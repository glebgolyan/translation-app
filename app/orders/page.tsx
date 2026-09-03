import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { usersApi } from '@/features/admin/api/usersApi';
import { OrderFilters } from '@/entities/order/model/types';
import { OrdersContent } from './components/OrdersContent';

export default async function OrdersPage() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();
  // Mirrors widgets/order-table/OrderTable.tsx's default `filters` state.
  const defaultFilters: OrderFilters = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' };

  // Auth check and data prefetch don't depend on each other — run them
  // concurrently instead of waiting for the session lookup first.
  const [user] = await Promise.all([
    getServerUser(),
    queryClient.prefetchQuery({
      queryKey: ['translators'],
      queryFn: () => usersApi.getTranslators(client),
    }),
    queryClient.prefetchQuery({
      queryKey: ['orders', defaultFilters],
      queryFn: () => ordersApi.getAll(defaultFilters, client),
    }),
  ]);
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersContent user={user} />
    </HydrationBoundary>
  );
}
