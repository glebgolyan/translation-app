'use client';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
  Avatar,
  Select,
  Button,
  Icon,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  useBreakpointValue,
  Grid,
  Box,
  Divider,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RiLoginCircleLine } from 'react-icons/ri';
import { usersApi } from '@/features/admin/api/usersApi';
import { authApi } from '@/features/auth/api/authApi';
import { User, UserRole } from '@/entities/user/model/types';
import { useT } from '@/shared/hooks/useT';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
}

const ROLE_OPTIONS: UserRole[] = ['CLIENT', 'MANAGER', 'TRANSLATOR', 'ADMIN'];

export function UserTable({ users, isLoading }: UserTableProps) {
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Role updated', status: 'success', duration: 2000 });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: (userId: string) => authApi.impersonate(userId),
    onSuccess: ({ tokens, user }) => {
      Cookies.set('accessToken', tokens.accessToken, {
        expires: 3,
        secure: window.location.protocol === 'https:',
        sameSite: 'strict',
      });
      Cookies.set('refreshToken', tokens.refreshToken, {
        expires: 7,
        secure: window.location.protocol === 'https:',
        sameSite: 'strict',
      });
      toast({ title: `Now viewing as ${user.name}`, status: 'info', duration: 3000 });
      router.push('/dashboard');
      router.refresh();
    },
  });

  if (isLoading)
    return (
      <Center py={12}>
        <Spinner color='brand.500' />
      </Center>
    );

  if (isMobile) {
    return (
      <Grid
        templateColumns='1fr'
        gap={3}
        p={3}
      >
        {users.map((user: User) => (
          <Box
            key={user.id}
            bg={bg}
            border='1px solid'
            borderColor={borderColor}
            borderRadius='12px'
            p={4}
          >
            <Flex
              align='center'
              gap={3}
              mb={3}
            >
              <Avatar
                size='sm'
                name={user.name}
              />
              <Box flex={1}>
                <Text
                  fontSize='13px'
                  fontWeight='600'
                >
                  {user.name}
                </Text>
                <Text
                  fontSize='12px'
                  fontFamily='mono'
                  color={labelColor}
                  noOfLines={1}
                >
                  {user.email}
                </Text>
              </Box>
            </Flex>

            <Divider
              borderColor={borderColor}
              mb={3}
            />

            <Grid
              templateColumns='1fr 1fr'
              gap={3}
              mb={3}
            >
              <Box>
                <Text
                  fontSize='10px'
                  color={labelColor}
                  fontWeight='600'
                  textTransform='uppercase'
                  letterSpacing='0.06em'
                  mb={0.5}
                >
                  {t('users.phone') ?? 'Phone'}
                </Text>
                <Text
                  fontSize='13px'
                  color={labelColor}
                >
                  {user.phone || '—'}
                </Text>
              </Box>
              <Box>
                <Text
                  fontSize='10px'
                  color={labelColor}
                  fontWeight='600'
                  textTransform='uppercase'
                  letterSpacing='0.06em'
                  mb={0.5}
                >
                  {t('users.joined')}
                </Text>
                <Text
                  fontSize='12px'
                  color={labelColor}
                  fontFamily='mono'
                >
                  {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                </Text>
              </Box>
            </Grid>

            <Flex
              justify='space-between'
              align='center'
              gap={2}
            >
              <Select
                size='xs'
                value={user.role}
                onChange={(e) =>
                  roleMutation.mutate({ id: user.id, role: e.target.value as UserRole })
                }
                maxW='130px'
                fontFamily='Syne'
                fontWeight='600'
                fontSize='11px'
              >
                {ROLE_OPTIONS.map((r) => (
                  <option
                    key={r}
                    value={r}
                  >
                    {r}
                  </option>
                ))}
              </Select>

              <Button
                size='xs'
                variant='ghost'
                colorScheme='brand'
                leftIcon={<Icon as={RiLoginCircleLine} />}
                onClick={() => impersonateMutation.mutate(user.id)}
                isLoading={impersonateMutation.isPending}
              >
                {t('users.loginAs')}
              </Button>
            </Flex>
          </Box>
        ))}
      </Grid>
    );
  }

  return (
    <Box overflowX='auto'>
      <Table
        variant='simple'
        size='sm'
      >
        <Thead bg={bg}>
          <Tr>
            <Th>{t('users.user')}</Th>
            <Th>Email</Th>
            <Th>{t('users.phone') ?? 'Phone'}</Th>
            <Th>{t('users.role')}</Th>
            <Th>{t('users.joined')}</Th>
            <Th>{t('users.actions')}</Th>
          </Tr>
        </Thead>
        <Tbody bg={bg}>
          {users.map((user: User) => (
            <Tr
              key={user.id}
              _hover={bg}
            >
              <Td>
                <Flex
                  align='center'
                  gap={3}
                >
                  <Avatar
                    size='xs'
                    name={user.name}
                  />
                  <Text
                    fontSize='13px'
                    fontWeight='500'
                  >
                    {user.name}
                  </Text>
                </Flex>
              </Td>
              <Td>
                <Text
                  fontSize='13px'
                  fontFamily='mono'
                  color='gray.600'
                >
                  {user.email}
                </Text>
              </Td>
              <Td>
                <Text
                  fontSize='13px'
                  color='gray.500'
                >
                  {user.phone || '—'}
                </Text>
              </Td>
              <Td>
                <Select
                  size='xs'
                  value={user.role}
                  onChange={(e) =>
                    roleMutation.mutate({ id: user.id, role: e.target.value as UserRole })
                  }
                  maxW='130px'
                  fontFamily='Syne'
                  fontWeight='600'
                  fontSize='11px'
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option
                      key={r}
                      value={r}
                    >
                      {r}
                    </option>
                  ))}
                </Select>
              </Td>
              <Td>
                <Text
                  fontSize='12px'
                  color='gray.400'
                  fontFamily='mono'
                >
                  {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                </Text>
              </Td>
              <Td>
                <Button
                  size='xs'
                  variant='ghost'
                  colorScheme='brand'
                  leftIcon={<Icon as={RiLoginCircleLine} />}
                  onClick={() => impersonateMutation.mutate(user.id)}
                  isLoading={impersonateMutation.isPending}
                >
                  {t('users.loginAs')}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
