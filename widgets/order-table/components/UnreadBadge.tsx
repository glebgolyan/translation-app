'use client';
import { Badge, Icon, Tooltip, useToast } from '@chakra-ui/react';
import { RiChat3Line } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '@/features/messages/api/messagesApi';
import { useAuth } from '@/features/auth/model/useAuth';
import { useEffect, useRef } from 'react';
import { useMessageSound } from '@/shared/hooks/useMessageSound';

interface UnreadBadgeProps {
  orderId?: string;
}

export function UnreadBadge({ orderId }: UnreadBadgeProps) {
  const { user } = useAuth();

  const toast = useToast();

  const playMessageSound = useMessageSound();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread_messages'],
    queryFn: () => messagesApi.getUnreadCount(user?.id!, orderId),
    enabled: !!user?.id,
    refetchInterval: 3000,
  });

  // Tracks the last-seen count so we only notify on a genuine increase —
  // this component lives in the sidebar and remounts on every navigation
  // (Sidebar isn't a persisted layout instance across these routes), so
  // firing on "unreadCount is truthy" alone re-toasted the SAME
  // already-existing unread messages on every page change.
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = unreadCount;

    if (prev === null) return; // first load after mount — nothing "new" yet
    if (unreadCount > prev) {
      playMessageSound();

      toast({
        title: '📨 New Message',
        description: ``,
        status: 'info',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [unreadCount]);

  // if (unreadCount === 0) return null;

  return (
    <Tooltip label={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}>
      <Badge
        colorScheme='red'
        fontSize='10px'
      >
        <Icon
          as={RiChat3Line}
          mr={1}
          boxSize={3}
        />
        {unreadCount}
      </Badge>
    </Tooltip>
  );
}
