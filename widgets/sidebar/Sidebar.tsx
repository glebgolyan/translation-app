'use client';
import {
  Box, VStack, Text, Icon, Flex, Avatar,
  Menu, MenuButton, MenuList, MenuItem,
  HStack, IconButton, Tooltip,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiDashboardLine, RiFileList3Line, RiUserLine,
  RiTranslate2, RiSettings3Line, RiLogoutBoxLine,
  RiArrowDownSLine, RiMenuFoldLine, RiMenuUnfoldLine, RiBarChart2Line, RiChat3Line,
} from 'react-icons/ri';
import { User, UserRole } from '@/entities/user/model/types';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useT } from '@/shared/hooks/useT';
import { useColorModeValue } from '@chakra-ui/react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UnreadBadge } from "@/widgets/order-table/components/UnreadBadge";

// ─── Sidebar collapse store ───────────────────────────────────────────────────

interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
    persist(
        (set) => ({
          collapsed: false,
          toggle: () => set(state => ({ collapsed: !state.collapsed })),
        }),
        { name: 'sidebar-collapsed' }
    )
);

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  component?: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'nav.messages',
    href: '/messages',
    icon: RiChat3Line,
    component: () => <><UnreadBadge/></>,
    roles: ['ADMIN', 'MANAGER', 'TRANSLATOR']
  },
  { labelKey: 'nav.dashboard', href: '/dashboard', icon: RiDashboardLine, roles: ['CLIENT', 'MANAGER', 'TRANSLATOR', 'ADMIN'] },
  { labelKey: 'nav.orders', href: '/orders', icon: RiFileList3Line, roles: ['MANAGER', 'ADMIN'] },
  { labelKey: 'nav.translatorStats', href: '/translations', icon: RiBarChart2Line, roles: ['MANAGER', 'ADMIN'] },
  { labelKey: 'nav.apostilization', href: '/apostilization', icon: RiFileList3Line, roles: ['MANAGER', 'ADMIN'] },
  { labelKey: 'nav.myOrders', href: '/my-orders', icon: RiFileList3Line, roles: ['CLIENT'] },
  { labelKey: 'nav.assignments', href: '/assignments', icon: RiTranslate2, roles: ['TRANSLATOR'] },
  { labelKey: 'nav.users', href: '/admin/users', icon: RiUserLine, roles: ['ADMIN'] },
  { labelKey: 'nav.settings', href: '/settings', icon: RiSettings3Line, roles: ['CLIENT', 'MANAGER', 'TRANSLATOR', 'ADMIN'] },
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
  const { t } = useT();
  const { collapsed, toggle } = useSidebarStore();

  const sidebarBg = useColorModeValue('white', '#141414');
  const borderColor = useColorModeValue('gray.100', '#2a2a2a');
  const activeBg = useColorModeValue('brand.50', '#1a2540');
  const activeColor = useColorModeValue('brand.600', 'brand.300');
  const hoverBg = useColorModeValue('gray.50', '#222222');
  const inactiveColor = useColorModeValue('gray.600', '#888888');
  const textColor = useColorModeValue('gray.900', '#f0f0f0');
  const mutedColor = useColorModeValue('gray.400', '#666666');
  const menuBg = useColorModeValue('white', '#1a1a1a');

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  const w = collapsed ? '64px' : '240px';

  return (
      <Box
          w={w}
          minH="100vh"
          bg={sidebarBg}
          borderRight="1px solid"
          borderColor={borderColor}
          display="flex"
          flexDirection="column"
          position="fixed"
          left={0}
          top={0}
          zIndex={10}
          transition="width 0.2s ease"
          overflow="hidden"
      >
        {/* Logo + collapse button */}
        <Box
            px={collapsed ? 0 : 6}
            py={5}
            borderBottom="1px solid"
            borderColor={borderColor}
            display="flex"
            alignItems="center"
            justifyContent={collapsed ? 'center' : 'space-between'}
            minH="64px"
        >
          {!collapsed && (
              <Flex align="center" gap={2}>
                <Box
                    w="28px" h="28px" bg="brand.600" borderRadius="6px"
                    display="flex" alignItems="center" justifyContent="center"
                    flexShrink={0}
                >
                  <Text color="white" fontSize="14px" fontFamily="Syne" fontWeight="800" lineHeight={1}>T</Text>
                </Box>
                <Text fontFamily="Syne" fontWeight="700" fontSize="16px" letterSpacing="-0.01em" color={textColor}>
                  TranslateOS
                </Text>
              </Flex>
          )}

          <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
                aria-label="Toggle sidebar"
                icon={<Icon as={collapsed ? RiMenuUnfoldLine : RiMenuFoldLine} />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                color={mutedColor}
                onClick={toggle}
                flexShrink={0}
            />
          </Tooltip>
        </Box>

        {/* Nav */}
        <VStack spacing={0.5} align="stretch" px={collapsed ? 1.5 : 3} py={4} flex={1}>
          {visibleItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
                <Tooltip
                    key={item.href}
                    label={collapsed ? t(item.labelKey) : ''}
                    placement="right"
                    hasArrow
                >
                  <Link href={item.href} style={{ textDecoration: 'none' }}>
                    <Flex
                        align="center"
                        gap={collapsed ? 0 : 3}
                        px={collapsed ? 0 : 3}
                        py={2.5}
                        borderRadius="6px"
                        justifyContent={collapsed ? 'center' : 'flex-start'}
                        bg={isActive ? activeBg : 'transparent'}
                        color={isActive ? activeColor : inactiveColor}
                        _hover={{ bg: isActive ? activeBg : hoverBg, color: isActive ? activeColor : textColor }}
                        transition="all 0.15s"
                        cursor="pointer"
                    >
                      <Icon as={item.icon} boxSize={4} flexShrink={0} />
                      {!collapsed && (
                          <Text fontSize="14px" fontWeight={isActive ? '600' : '400'} fontFamily="DM Sans">
                            {t(item.labelKey)}
                          </Text>
                      )}
                      {item.component && <item.component />}
                    </Flex>
                  </Link>
                </Tooltip>
            );
          })}
        </VStack>

        {/* Language + Theme */}
        {!collapsed && (
            <Box px={4} py={3} borderTop="1px solid" borderColor={borderColor}>
              <Text fontSize="10px" color={mutedColor} fontFamily="Syne" fontWeight="600"
                    letterSpacing="0.06em" textTransform="uppercase" mb={2}>
                {t('common.language')}
              </Text>
              <HStack justify="space-between" align="center">
                <LanguageSwitcher />
                <ThemeToggle />
              </HStack>
            </Box>
        )}


        {collapsed && (
            <Box py={3} display="flex" justifyContent="center" borderTop="1px solid" borderColor={borderColor}>
              <ThemeToggle />
            </Box>
        )}

        {/* User */}
        <Box px={collapsed ? 1.5 : 3} py={4} borderTop="1px solid" borderColor={borderColor}>
          <Menu placement="top">
            <Tooltip label={collapsed ? user.name : ''} placement="right">
              <MenuButton w="full">
                <Flex
                    align="center"
                    gap={collapsed ? 0 : 3}
                    px={collapsed ? 0 : 3}
                    py={2}
                    borderRadius="6px"
                    justifyContent={collapsed ? 'center' : 'flex-start'}
                    _hover={{ bg: hoverBg }}
                    cursor="pointer"
                >
                  <Avatar size="sm" name={user.name} bg="brand.100" color="brand.700" flexShrink={0} />
                  {!collapsed && (
                      <>
                        <Box flex={1} textAlign="left" minW={0}>
                          <Text fontSize="13px" fontWeight="500" noOfLines={1} fontFamily="DM Sans" color={textColor}>
                            {user.name}
                          </Text>
                          <Box
                              display="inline-block" px={1.5} borderRadius="3px"
                              bg={ROLE_COLORS[user.role]}
                              fontSize="9px" color="white"
                              fontFamily="Syne" fontWeight="700" letterSpacing="0.06em"
                          >
                            {user.role}
                          </Box>
                        </Box>
                        <Icon as={RiArrowDownSLine} color={mutedColor} />
                      </>
                  )}
                </Flex>
              </MenuButton>
            </Tooltip>
            <MenuList bg={menuBg} borderColor={borderColor} shadow="lg" minW="210px">
              <MenuItem
                  icon={<Icon as={RiLogoutBoxLine} />}
                  onClick={onLogout}
                  color="red.500"
                  fontFamily="DM Sans"
                  fontSize="14px"
                  bg={menuBg}
                  _hover={{ bg: hoverBg }}
              >
                {t('auth.logout')}
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
  );
}