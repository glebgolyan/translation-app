import { redirect } from 'next/navigation';
import { getServerUser } from '@/shared/lib/serverAuth';
import { SettingsContent } from './components/SettingsContent';

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  return <SettingsContent user={user} />;
}
