'use client';
// app/admin/users/page.tsx
import {
  Box, Text, Flex, Table, Thead, Tbody, Tr, Th, Td,
  Avatar, Badge, Select, Button, Icon, HStack, useToast,
  Spinner, Center,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiUserLine, RiLoginCircleLine } from 'react-icons/ri';
import { usersApi } from '@/features/admin/api/usersApi';
import { authApi } from '@/features/auth/api/authApi';
import { User, UserRole } from '@/entities/user/model/types';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: 'blue',
  MANAGER: 'green',
  TRANSLATOR: 'yellow',
  ADMIN: 'red',
};

export default function AdminUsersPage() {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Role updated', status: 'success', duration: 2000 });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: (userId: string) => authApi.impersonate(userId),
    onSuccess: ({ tokens, user }) => {
      Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
      Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
      toast({ title: `Now viewing as ${user.name}`, status: 'info', duration: 3000 });
      router.push('/dashboard');
      router.refresh();
    },
  });

  return (
    <Box p={8}>
      <Flex align="center" gap={3} mb={6}>
        <Icon as={RiUserLine} boxSize={5} color="gray.400" />
        <Box>
          <Text fontFamily="Syne" fontWeight="800" fontSize="24px" letterSpacing="-0.02em">
            User Management
          </Text>
          <Text color="gray.400" fontSize="14px">{users.length} users registered</Text>
        </Box>
      </Flex>

      <Box bg="white" borderRadius="8px" border="1px solid" borderColor="gray.100" overflow="hidden">
        {isLoading ? (
          <Center py={12}><Spinner color="brand.500" /></Center>
        ) : (
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user: User) => (
                <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Flex align="center" gap={3}>
                      <Avatar size="xs" name={user.name} />
                      <Text fontSize="13px" fontWeight="500">{user.name}</Text>
                    </Flex>
                  </Td>
                  <Td>
                    <Text fontSize="13px" fontFamily="mono" color="gray.600">{user.email}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="13px" color="gray.500">{user.phone || '—'}</Text>
                  </Td>
                  <Td>
                    <Select
                      size="xs"
                      value={user.role}
                      onChange={e => roleMutation.mutate({ id: user.id, role: e.target.value as UserRole })}
                      maxW="130px"
                      fontFamily="Syne"
                      fontWeight="600"
                      fontSize="11px"
                    >
                      {(['CLIENT', 'MANAGER', 'TRANSLATOR', 'ADMIN'] as UserRole[]).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Text fontSize="12px" color="gray.400" fontFamily="mono">
                      {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                    </Text>
                  </Td>
                  <Td>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="brand"
                      leftIcon={<Icon as={RiLoginCircleLine} />}
                      onClick={() => impersonateMutation.mutate(user.id)}
                      isLoading={impersonateMutation.isPending}
                    >
                      Login as
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
