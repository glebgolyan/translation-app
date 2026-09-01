'use client';
import { Box, Text, Button, Icon, HStack, useColorModeValue } from '@chakra-ui/react';
import { RiAppleFill, RiWindowsFill } from 'react-icons/ri';
import { DESKTOP_APP_DOWNLOADS } from '@/shared/config/downloads';

export function DesktopAppSection() {
  const bg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.100', '#2e2e2e');
  const labelColor = useColorModeValue('gray.400', '#666666');
  const textColor = useColorModeValue('gray.900', '#f0f0f0');

  return (
    <Box
      bg={bg}
      borderRadius='12px'
      border='1px solid'
      borderColor={borderColor}
      overflow='hidden'
    >
      <Box
        px={6}
        py={5}
        borderBottom='1px solid'
        borderColor={borderColor}
      >
        <Text
          fontFamily='Syne'
          fontWeight='700'
          fontSize='15px'
          color={textColor}
        >
          Desktop App
        </Text>
        <Text
          fontSize='13px'
          color={labelColor}
          mt={0.5}
        >
          Get TranslateOS as a native app for macOS or Windows
        </Text>
      </Box>

      <Box p={{ base: 4, md: 6 }}>
        <HStack
          spacing={3}
          flexWrap='wrap'
        >
          <Button
            as='a'
            href={DESKTOP_APP_DOWNLOADS.mac}
            target='_blank'
            rel='noopener noreferrer'
            leftIcon={<Icon as={RiAppleFill} boxSize={5} />}
            size='md'
            variant='outline'
          >
            Download for Mac
          </Button>
          <Button
            as='a'
            href={DESKTOP_APP_DOWNLOADS.windows}
            target='_blank'
            rel='noopener noreferrer'
            leftIcon={<Icon as={RiWindowsFill} boxSize={5} />}
            size='md'
            variant='outline'
          >
            Download for Windows
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
