'use client';
// app/login/page.tsx
import {
  Box, VStack, Text, FormControl, FormLabel, FormErrorMessage,
  Input, Button, Flex, Icon, useToast, InputGroup,
  InputRightElement, IconButton, useColorModeValue,
  Link as ChakraLink
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAuth } from '@/features/auth/model/useAuth';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const showRegister = searchParams.get('register') === 'true';

  const bg = useColorModeValue('white', '#1a1a1a');
  const labelColor = useColorModeValue('gray.400', '#666666');
  const subtextColor = useColorModeValue('gray.500', '#888888');
  const linkColor = useColorModeValue('brand.500', 'brand.300');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch {
      toast({ title: 'Invalid credentials', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" bg={bg}>
      {/* Left decorative panel */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="45%"
        bg="brand.600"
        flexDirection="column"
        justifyContent="center"
        px={16}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute" top="-100px" right="-100px"
          w="400px" h="400px" borderRadius="full"
          bg="whiteAlpha.100"
        />
        <Box
          position="absolute" bottom="-80px" left="-80px"
          w="300px" h="300px" borderRadius="full"
          bg="whiteAlpha.100"
        />
        <Box position="relative" zIndex={1}>
          <Flex align="center" gap={3} mb={12}>
            <Box
              w="36px" h="36px" bg="white" borderRadius="8px"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Text color="brand.600" fontFamily="Syne" fontWeight="800" fontSize="18px">T</Text>
            </Box>
            <Text color="white" fontFamily="Syne" fontWeight="700" fontSize="20px">TranslateOS</Text>
          </Flex>
          <Text color="white" fontFamily="Syne" fontWeight="800" fontSize="40px" lineHeight={1.1} letterSpacing="-0.03em" mb={6}>
            Professional<br />Translation<br />Management
          </Text>
          <Text color="whiteAlpha.700" fontFamily="DM Sans" fontSize="16px" lineHeight={1.7}>
            Manage your document translation workflows with precision. From order intake to final delivery.
          </Text>
        </Box>
      </Box>

      {/* Right login form */}
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" px={8}>
        <Box w="100%" maxW="380px">
          <Box mb={8}>
            <Text fontFamily="Syne" fontWeight="800" fontSize="28px" letterSpacing="-0.02em" mb={2}>
              Welcome back
            </Text>
            <Text color={labelColor} fontSize="14px">Sign in to your account to continue</Text>
          </Box>

          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Email</FormLabel>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  size="md"
                  bg={bg}
                />
                <FormErrorMessage fontSize="12px">{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Password</FormLabel>
                <InputGroup>
                  <Input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    size="md"
                    bg={bg}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password"
                      icon={<Icon as={showPw ? RiEyeOffLine : RiEyeLine} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="gray"
                      onClick={() => setShowPw(p => !p)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize="12px">{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="md"
                isLoading={loading}
                loadingText="Signing in…"
                mt={2}
              >
                Sign In
              </Button>
            </VStack>
          </Box>
          {showRegister && (
              <Box mt={6} textAlign="center">
                <Text fontSize="14px" color={subtextColor}>
                  Don't have an account?{' '}
                  <ChakraLink href="/register?login=true" color={linkColor} fontWeight="600" _hover={{ textDecoration: 'underline' }}>
                    Register
                  </ChakraLink>
                </Text>
              </Box>
          )}
          {/*<Text textAlign="center" fontSize="13px" color="gray.400" mt={6}>*/}
          {/*  Don't have an account?{' '}*/}
          {/*  <NextLink href="/register" style={{ textDecoration: 'none' }}>*/}
          {/*    <Text as="span" color="brand.600" fontWeight="500" _hover={{ textDecoration: 'underline' }}>*/}
          {/*      Register*/}
          {/*    </Text>*/}
          {/*  </NextLink>*/}
          {/*</Text>*/}
        </Box>
      </Box>
    </Box>
  );
}
