'use client';
// widgets/sidebar/Sidebar.tsx
import {
  Box, VStack, Text, Icon, Flex, Avatar, Menu,
  MenuButton, MenuList, MenuItem, Divider, Badge,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiDashboardLine, RiFileList3Line, RiUserLine,
  RiTranslate2, RiSettings3Line, RiLogoutBoxLine,
  RiArrowDownSLine,
} from 'react-icons/ri';
import { User, UserRole } from '@/entities/user/model/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: RiDashboardLine, roles: ['CLIENT', 'MANAGER', 'TRANSLATOR', 'ADMIN'] },
  { label: 'Orders', href: '/orders', icon: RiFileList3Line, roles: ['MANAGER', 'ADMIN'] },
  { label: 'My Orders', href: '/my-orders', icon: RiFileList3Line, roles: ['CLIENT'] },
  { label: 'Assignments', href: '/assignments', icon: RiTranslate2, roles: ['TRANSLATOR'] },
  { label: 'Users', href: '/admin/users', icon: RiUserLine, roles: ['ADMIN'] },
  { label: 'Settings', href: '/settings', icon: RiSettings3Line, roles: ['CLIENT', 'MANAGER', 'TRANSLATOR', 'ADMIN'] },
];

const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: '#4d76ff',
  MANAGER: '#00b894',
  TRANSLATOR: '#fdcb6e',
  ADMIN: '#e17055',
};

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <Box
      w="240px"
      minH="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.100"
      display="flex"
      flexDirection="column"
      position="fixed"
      left={0}
      top={0}
      zIndex={10}
    >
      {/* Logo */}
      <Box px={6} py={5} borderBottom="1px solid" borderColor="gray.100">
        <Flex align="center" gap={2}>
          <Box
            w="28px"
            h="28px"
            bg="brand.600"
            borderRadius="6px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="14px" fontFamily="Syne" fontWeight="800" lineHeight={1}>
              T
            </Text>
          </Box>
          <Text fontFamily="Syne" fontWeight="700" fontSize="16px" letterSpacing="-0.01em">
            TranslateOS
          </Text>
        </Flex>
      </Box>

      {/* Nav */}
      <VStack spacing={0.5} align="stretch" px={3} py={4} flex={1}>
        {visibleItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Flex
                align="center"
                gap={3}
                px={3}
                py={2.5}
                borderRadius="6px"
                bg={isActive ? 'brand.50' : 'transparent'}
                color={isActive ? 'brand.600' : 'gray.600'}
                _hover={{ bg: isActive ? 'brand.50' : 'gray.50', color: isActive ? 'brand.600' : 'gray.800' }}
                transition="all 0.15s"
                cursor="pointer"
              >
                <Icon as={item.icon} boxSize={4} />
                <Text fontSize="14px" fontWeight={isActive ? '600' : '400'} fontFamily="DM Sans">
                  {item.label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </VStack>

      {/* User */}
      <Box px={3} py={4} borderTop="1px solid" borderColor="gray.100">
        <Menu placement="top">
          <MenuButton w="full">
            <Flex align="center" gap={3} px={3} py={2} borderRadius="6px" _hover={{ bg: 'gray.50' }} cursor="pointer">
              <Avatar size="sm" name={user.name} bg="brand.100" color="brand.700" />
              <Box flex={1} textAlign="left" minW={0}>
                <Text fontSize="13px" fontWeight="500" noOfLines={1} fontFamily="DM Sans">{user.name}</Text>
                <Badge
                  fontSize="9px"
                  px={1.5}
                  py={0}
                  borderRadius="3px"
                  bg={ROLE_COLORS[user.role]}
                  color="white"
                  fontFamily="Syne"
                  letterSpacing="0.06em"
                >
                  {user.role}
                </Badge>
              </Box>
              <Icon as={RiArrowDownSLine} color="gray.400" />
            </Flex>
          </MenuButton>
          <MenuList shadow="lg" border="1px solid" borderColor="gray.100" minW="210px">
            <MenuItem icon={<Icon as={RiLogoutBoxLine} />} onClick={onLogout} color="red.500" fontFamily="DM Sans" fontSize="14px">
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
}
