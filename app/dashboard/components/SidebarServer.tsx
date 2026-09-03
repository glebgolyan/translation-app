import { redirect } from 'next/navigation';
import { Sidebar } from '@/widgets/sidebar/Sidebar';
import { getServerUser } from '@/shared/lib/serverAuth';

// Isolated into its own async Server Component (rather than living directly
// in layout.tsx) so it can be wrapped in a local <Suspense> that doesn't
// block the rest of the layout — and the page below it, with its own
// loading.tsx boundary — from starting to stream while this resolves.
// getServerUser() is cache()-deduped against the page's own call for the
// same request, so this isn't an extra network round trip.
export async function SidebarServer() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  return <Sidebar user={user} />;
}
