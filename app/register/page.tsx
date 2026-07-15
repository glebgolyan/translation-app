import { Box, Text } from '@chakra-ui/react';
import { Suspense } from 'react';
import { RegisterPageContent } from './components/RegisterPageContent';

export default function RegisterPage() {
  return (
    <Box
      minH='100vh'
      display='flex'
    >
      {/* Left side - Brand */}
      <Box
        flex={1}
        bg='brand.600'
        display={{ base: 'none', lg: 'flex' }}
        flexDirection='column'
        justifyContent='center'
        p={8}
      >
        <Box mb={8}>
          <Box
            w='48px'
            h='48px'
            bg='white'
            borderRadius='12px'
            display='flex'
            alignItems='center'
            justifyContent='center'
            mb={6}
          >
            <Text
              color='brand.600'
              fontSize='24px'
              fontFamily='Syne'
              fontWeight='800'
            >
              T
            </Text>
          </Box>
          <Text
            fontFamily='Syne'
            fontSize='32px'
            fontWeight='800'
            color='white'
            letterSpacing='-0.02em'
            mb={2}
          >
            TranslateOS
          </Text>
          <Text
            color='rgba(255,255,255,0.7)'
            fontSize='16px'
            fontFamily='DM Sans'
          >
            Professional Document Translation Management
          </Text>
        </Box>
      </Box>

      {/* Right side - Form */}
      <Suspense fallback={<Box flex={1} />}>
        <RegisterPageContent />
      </Suspense>
    </Box>
  );
}
