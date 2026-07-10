'use client';
import { Box, Grid, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { RiFileList3Line, RiTimeLine, RiCheckboxCircleLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { useAuth } from '@/features/auth/model/useAuth';
import { useT } from '@/shared/hooks/useT';
import { StatCard } from './components/StatCard';
import { RecentOrders } from './components/RecentOrders';
import {apostilizationApi} from "@/features/apostilization/api/apostilizationApi";
import {useState} from "react";

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useT();

    const [month] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const { data: ordersData } = useQuery({
        queryKey: ['orders', 'dashboard'],
        queryFn: () => ordersApi.getAll({ limit: 50 }),
    });


    const { data: apostilization = [] } = useQuery({
        queryKey: ['apostilization'],
        queryFn: () => apostilizationApi.getAll({month}),
    });

    const orders = ordersData?.data || [];
    const total = ordersData?.total || 0;
    const inProgress = orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'DONE' || o.status === 'NEW').length;
    const done = orders.filter(o =>  o.status === 'CERTIFIED' || o.status === 'TAKEN').length;

    const totalApostilization = apostilization.reduce((sum, a) => sum + a.costPrice, 0);

    const totalOrders = orders.filter((order)=>order.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalPrice, 0);

    const revenue = totalOrders + totalApostilization

    return (
        <Box p={8}>
            <Box mb={8}>
                <Text fontFamily="Syne" fontWeight="800" fontSize="26px" letterSpacing="-0.02em" mb={1}>
                    {t('dashboard.greeting')}, {user?.name?.split(' ')[0]} 👋
                </Text>
                <Text color="gray.500" fontSize="14px">{t('dashboard.subtitle')}</Text>
            </Box>

            <Grid templateColumns={{base: '1fr', lg: `repeat(${user?.role === 'ADMIN' ? 4 : 3}, 1fr)`}} gap={4} mb={8}>
                <StatCard label={t('dashboard.totalOrders')} value={total} icon={RiFileList3Line} color="#4d76ff" change={12} />
                <StatCard label={t('dashboard.inProgress')} value={inProgress} icon={RiTimeLine} color="#fdcb6e" />
                <StatCard label={t('dashboard.completed')} value={done} icon={RiCheckboxCircleLine} color="#00b894" change={8} />
                {user?.role === 'ADMIN' && (
                    <StatCard label={t('dashboard.revenue')} value={`₴${revenue.toLocaleString()}`} icon={RiMoneyDollarCircleLine} color="#a29bfe" change={5} />
                )}
            </Grid>

            <RecentOrders orders={orders} />
        </Box>
    );
}