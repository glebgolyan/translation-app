'use client';
// app/dashboard/layout.tsx
import { Box, Center, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/widgets/sidebar/Sidebar';
import { useAuth } from '@/features/auth/model/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="3px" />
      </Center>
    );
  }

  if (!user) return null;

  return (
    <Box display="flex" minH="100vh" bg="gray.50">
      <Sidebar user={user} onLogout={logout} />
      <Box ml="240px" flex={1} minH="100vh">
        {children}
      </Box>
    </Box>
  );
}
