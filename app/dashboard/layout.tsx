'use client';
import { Box, Center, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar, useSidebarStore } from '@/widgets/sidebar/Sidebar';
import { useAuth } from '@/features/auth/model/useAuth';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const { collapsed } = useSidebarStore();

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
        <Box display="flex" minH="100vh" bg="bg.app">
            <Sidebar user={user} onLogout={logout} />
            <Box
                ml={collapsed ? '64px' : '240px'}
                flex={1}
                minH="100vh"
                bg="bg.app"
                transition="margin-left 0.2s ease"
            >
                {children}
            </Box>
        </Box>
    );
}