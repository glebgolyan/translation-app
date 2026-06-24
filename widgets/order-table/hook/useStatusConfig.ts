'use client';
import { useT } from '@/shared/hooks/useT';

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'TAKEN' | 'PAID' | 'CANCELLED' | 'CERTIFIED';

interface StatusConfig {
    label: string;
    colorScheme: string;
}

export function useStatusConfig() {
    const { t } = useT();
    const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
        NEW: {
            label: t('status.NEW') || 'NEW',
            colorScheme: 'blue',
        },
        IN_PROGRESS: {
            label: t('status.IN_PROGRESS') || 'IN PROGRESS',
            colorScheme: 'orange',
        },
        DONE: {
            label: t('status.DONE') || 'DONE',
            colorScheme: 'green',
        },
        TAKEN: {
            label: t('status.TAKEN') || 'TAKEN',
            colorScheme: 'green',
        },
        PAID: {
            label: t('status.PAID') || 'PAID',
            colorScheme: 'purple',
        },
        CANCELLED: {
            label: t('status.CANCELLED') || 'CANCELLED',
            colorScheme: 'red',
        },
        CERTIFIED: {
            label: t('status.CERTIFIED') || 'CERTIFIED',
            colorScheme: 'orange',
        },
    };

    return STATUS_CONFIG;
}