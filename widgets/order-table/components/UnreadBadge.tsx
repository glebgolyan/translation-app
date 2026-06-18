'use client';
import { Badge, Icon, Tooltip } from '@chakra-ui/react';
import { RiChat3Line } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '@/features/messages/api/messagesApi';
import { useAuth } from '@/features/auth/model/useAuth';

interface UnreadBadgeProps {
    orderId?: string;
}

export function UnreadBadge({ orderId }: UnreadBadgeProps) {
    const { user } = useAuth();

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unread_messages'],
        queryFn: () => messagesApi.getUnreadCount(user?.id!, orderId),
        enabled: !!user?.id,
        refetchInterval: 3000,
    });

    // if (unreadCount === 0) return null;

    return (
        <Tooltip label={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}>
            <Badge colorScheme="red" fontSize="10px">
                <Icon as={RiChat3Line} mr={1} boxSize={3} />
                {unreadCount}
            </Badge>
        </Tooltip>
    );
}