'use client';
import { Box, Grid, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { RiFileList3Line, RiTimeLine, RiCheckboxCircleLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { useAuth } from '@/features/auth/model/useAuth';
import { useT } from '@/shared/hooks/useT';
import { StatCard } from './components/StatCard';
import { RecentOrders } from './components/RecentOrders';

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useT();

    const { data: ordersData } = useQuery({
        queryKey: ['orders', 'dashboard'],
        queryFn: () => ordersApi.getAll({ limit: 5 }),
    });

    const orders = ordersData?.data || [];
    const total = ordersData?.total || 0;
    const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
    const done = orders.filter(o => o.status === 'DONE').length;
    const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    return (
        <Box p={8}>
            <Box mb={8}>
                <Text fontFamily="Syne" fontWeight="800" fontSize="26px" letterSpacing="-0.02em" mb={1}>
                    {t('dashboard.greeting')}, {user?.name?.split(' ')[0]} 👋
                </Text>
                <Text color="gray.500" fontSize="14px">{t('dashboard.subtitle')}</Text>
            </Box>

            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={8}>
                <StatCard label={t('dashboard.totalOrders')} value={total} icon={RiFileList3Line} color="#4d76ff" change={12} />
                <StatCard label={t('dashboard.inProgress')} value={inProgress} icon={RiTimeLine} color="#fdcb6e" />
                <StatCard label={t('dashboard.completed')} value={done} icon={RiCheckboxCircleLine} color="#00b894" change={8} />
                <StatCard label={t('dashboard.revenue')} value={`₴${revenue.toLocaleString()}`} icon={RiMoneyDollarCircleLine} color="#a29bfe" change={5} />
            </Grid>

            <RecentOrders orders={orders} />
        </Box>
    );
}