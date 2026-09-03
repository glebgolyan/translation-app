import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { usersApi } from '@/features/admin/api/usersApi';
import { AdminUsersContent } from './components/AdminUsersContent';

export default async function AdminUsersPage() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const [user] = await Promise.all([
    getServerUser(),
    queryClient.prefetchQuery({
      queryKey: ['users'],
      queryFn: () => usersApi.getAll(client),
    }),
  ]);
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsersContent />
    </HydrationBoundary>
  );
}
