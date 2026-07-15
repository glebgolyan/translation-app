'use client';
import { IconButton, Icon, useColorMode, Tooltip } from '@chakra-ui/react';
import { RiSunLine, RiMoonLine } from 'react-icons/ri';

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
      <IconButton
        aria-label='Toggle theme'
        icon={<Icon as={colorMode === 'light' ? RiMoonLine : RiSunLine} />}
        size='sm'
        variant='ghost'
        colorScheme='gray'
        onClick={toggleColorMode}
      />
    </Tooltip>
  );
}
