'use client';
import { Badge, Icon, Box, Tooltip } from '@chakra-ui/react';
import { RiChat3Line } from 'react-icons/ri';
import { useMessages } from '@/shared/providers/MessagesProvider';

export function UnreadMessagesBadge() {
  const { unreadCount } = useMessages();

  if (unreadCount === 0) return null;

  return (
    <Tooltip
      label={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
      placement='right'
    >
      <Box position='relative'>
        <Icon
          as={RiChat3Line}
          boxSize={5}
          color='red.400'
          cursor='pointer'
          transition='all 0.2s'
          _hover={{ transform: 'scale(1.1)' }}
        />
        <Badge
          position='absolute'
          top='-2'
          right='-2'
          colorScheme='red'
          borderRadius='full'
          fontSize='10px'
          px={1.5}
          minW='20px'
          textAlign='center'
          animation='pulse 2s infinite'
          css={{
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.6 },
            },
          }}
        >
          {unreadCount}
        </Badge>
      </Box>
    </Tooltip>
  );
}
