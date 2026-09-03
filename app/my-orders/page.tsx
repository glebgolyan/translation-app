import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { createServerApiClient } from '@/shared/api/serverClient';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { MyOrdersContent } from './components/MyOrdersContent';

export default async function MyOrdersPage() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => ordersApi.getAll({ limit: 50 }, client),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyOrdersContent />
    </HydrationBoundary>
  );
}
