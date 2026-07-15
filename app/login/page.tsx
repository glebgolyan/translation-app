// app/login/page.tsx
import { Box, Text } from '@chakra-ui/react';
import { Suspense } from 'react';
import { LoginPageContent } from '@/app/login/components/LoginPageContent';

export default function LoginPage() {
  return (
    <Box
      minH='100vh'
      display='flex'
      bg='white'
    >
      {/* Left decorative panel */}
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
            Document Translation Management
          </Text>
        </Box>
      </Box>
      {/*<Box*/}
      {/*  display={{ base: 'none', lg: 'flex' }}*/}
      {/*  w="45%"*/}
      {/*  bg="brand.600"*/}
      {/*  flexDirection="column"*/}
      {/*  justifyContent="center"*/}
      {/*  px={16}*/}
      {/*  position="relative"*/}
      {/*  overflow="hidden"*/}
      {/*>*/}
      {/*  <Box*/}
      {/*    position="absolute" top="-100px" right="-100px"*/}
      {/*    w="400px" h="400px" borderRadius="full"*/}
      {/*    bg="whiteAlpha.100"*/}
      {/*  />*/}
      {/*  <Box*/}
      {/*    position="absolute" bottom="-80px" left="-80px"*/}
      {/*    w="300px" h="300px" borderRadius="full"*/}
      {/*    bg="whiteAlpha.100"*/}
      {/*  />*/}
      {/*  <Box position="relative" zIndex={1}>*/}
      {/*    <Flex align="center" gap={3} mb={12}>*/}
      {/*      <Box*/}
      {/*        w="36px" h="36px" bg="white" borderRadius="8px"*/}
      {/*        display="flex" alignItems="center" justifyContent="center"*/}
      {/*      >*/}
      {/*        <Text color="brand.600" fontFamily="Syne" fontWeight="800" fontSize="18px">T</Text>*/}
      {/*      </Box>*/}
      {/*      <Text color="white" fontFamily="Syne" fontWeight="700" fontSize="20px">TranslateOS</Text>*/}
      {/*    </Flex>*/}
      {/*    <Text color="white" fontFamily="Syne" fontWeight="800" fontSize="40px" lineHeight={1.1} letterSpacing="-0.03em" mb={6}>*/}
      {/*      Professional<br />Translation<br />Management*/}
      {/*    </Text>*/}
      {/*    <Text color="whiteAlpha.700" fontFamily="DM Sans" fontSize="16px" lineHeight={1.7}>*/}
      {/*      Manage your document translation workflows with precision. From order intake to final delivery.*/}
      {/*    </Text>*/}
      {/*  </Box>*/}
      {/*</Box>*/}

      {/* Right login form */}
      <Suspense fallback={<Box flex={1} />}>
        <LoginPageContent />
      </Suspense>
    </Box>
  );
}
