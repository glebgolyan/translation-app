import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getServerUser } from '@/shared/lib/serverAuth';
import { createServerApiClient } from '@/shared/api/serverClient';
import { messagesApi } from '@/features/messages/api/messagesApi';
import { MessagesContent } from './components/MessagesContent';

export default async function MessagesPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN' && user.role !== 'TRANSLATOR') {
    redirect('/dashboard');
  }

  const client = createServerApiClient();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['conversations', user.role],
    queryFn: () =>
      user.role === 'TRANSLATOR'
        ? messagesApi.getTranslatorConversations(client)
        : messagesApi.getAllConversations(client),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MessagesContent user={user} />
    </HydrationBoundary>
  );
}
