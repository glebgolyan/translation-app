'use client';
// Suspense fallback shown while SidebarServer resolves the session — matches
// Sidebar's own fixed positioning/width/background so swapping the real
// Sidebar in doesn't cause a layout jump.
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useSidebarStore } from '@/widgets/sidebar/Sidebar';

export function SidebarSkeleton() {
  const { collapsed } = useSidebarStore();
  const sidebarBg = useColorModeValue('white', '#141414');
  const borderColor = useColorModeValue('gray.100', '#2a2a2a');

  return (
    <Box
      w={collapsed ? '64px' : '240px'}
      minH='100vh'
      bg={sidebarBg}
      borderRight='1px solid'
      borderColor={borderColor}
      position='fixed'
      left={0}
      top={0}
    />
  );
}
