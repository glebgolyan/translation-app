import { redirect } from 'next/navigation';
import { Sidebar } from '@/widgets/sidebar/Sidebar';
import { getServerUser } from '@/shared/lib/serverAuth';
import { LayoutContent } from './components/LayoutContent';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect('/login');

  return (
    <LayoutContent sidebar={<Sidebar user={user} />}>{children}</LayoutContent>
  );
}
