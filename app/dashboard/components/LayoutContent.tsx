'use client';
// Split out from the (now Server Component) layout purely for the sidebar
// collapse state (zustand) that drives the content's left margin — the
// Sidebar and page content themselves are passed in as already-rendered
// children/props from the server, not re-created here.
import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useSidebarStore } from '@/widgets/sidebar/Sidebar';

export function LayoutContent({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <Box
      display='flex'
      minH='100vh'
      bg='bg.app'
    >
      {sidebar}
      <Box
        ml={collapsed ? '64px' : '240px'}
        flex={1}
        minH='100vh'
        bg='bg.app'
        transition='margin-left 0.2s ease'
      >
        {children}
      </Box>
    </Box>
  );
}
