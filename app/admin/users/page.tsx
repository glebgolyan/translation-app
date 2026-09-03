import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { usersApi } from '@/features/admin/api/usersApi';
import { AdminUsersContent } from './components/AdminUsersContent';

export default async function AdminUsersPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/dashboard');

  const client = createServerApiClient();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(client),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsersContent />
    </HydrationBoundary>
  );
}
