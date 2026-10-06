import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { apostilizationApi } from '@/features/apostilization/api/apostilizationApi';
import { ApostilizationCalendarContent } from './components/ApostilizationCalendarContent';

// Design-test route for a calendar-grid take on /apostilization — same data,
// same create/edit form, different layout. Not linked from the sidebar yet;
// compare side by side at /apostilization vs /apostilization-v2.
export default async function ApostilizationV2Page() {
  const client = createServerApiClient();
  const queryClient = new QueryClient();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
      <ApostilizationCalendarContent />
    </HydrationBoundary>
  );
}
