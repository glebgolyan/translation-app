'use client';
import { Box, Text, Flex, Icon } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { RiUserLine } from 'react-icons/ri';
import { usersApi } from '@/features/admin/api/usersApi';
import { useT } from '@/shared/hooks/useT';
import { UserTable } from './UserTable';

export function AdminUsersContent() {
  const { t } = useT();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Flex
        align='center'
        gap={3}
        mb={6}
      >
        <Icon
          as={RiUserLine}
          boxSize={5}
          color='gray.400'
        />
        <Box>
          <Text
            fontFamily='Syne'
            fontWeight='800'
            fontSize={{ base: '20px', md: '24px' }}
            letterSpacing='-0.02em'
          >
            {t('users.title')}
          </Text>
          <Text
            color='gray.400'
            fontSize='14px'
          >
            {users.length} {t('users.registered')}
          </Text>
        </Box>
      </Flex>

      <Box
        bg={{ base: 'transparent', md: 'white' }}
        borderRadius='8px'
        border={{ base: 'none', md: '1px solid' }}
        borderColor='gray.100'
        overflow='hidden'
      >
        <UserTable
          users={users}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  );
}
