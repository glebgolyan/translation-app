'use client';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  Link as ChakraLink,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/model/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPageContent() {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
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
    <Box
      flex={1}
      display='flex'
      alignItems='center'
      justifyContent='center'
      px={8}
      bg={bg}
    >
      <Box
        w='100%'
        maxW='380px'
      >
        <Box mb={8}>
          <Text
            color={labelColor}
            fontFamily='Syne'
            fontWeight='800'
            fontSize='28px'
            letterSpacing='-0.02em'
            mb={2}
          >
            Welcome back
          </Text>
          <Text
            color={labelColor}
            fontSize='14px'
          >
            Sign in to your account to continue
          </Text>
        </Box>

        <Box
          as='form'
          onSubmit={handleSubmit(onSubmit)}
        >
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel
                fontSize='13px'
                fontWeight='500'
                color='gray.600'
              >
                Email
              </FormLabel>
              <Input
                {...register('email')}
                type='email'
                placeholder='you@company.com'
                size='md'
                bg={bg}
              />
              <FormErrorMessage fontSize='12px'>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel
                fontSize='13px'
                fontWeight='500'
                color='gray.600'
              >
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder='••••••••'
                  size='md'
                  bg={bg}
                />
                <InputRightElement>
                  <IconButton
                    aria-label='Toggle password'
                    icon={<Icon as={showPw ? RiEyeOffLine : RiEyeLine} />}
                    size='sm'
                    variant='ghost'
                    colorScheme='gray'
                    onClick={() => setShowPw((p) => !p)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage fontSize='12px'>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type='submit'
              w='full'
              size='md'
              isLoading={loading}
              loadingText='Signing in…'
              mt={2}
            >
              Sign In
            </Button>
          </VStack>
        </Box>
        {showRegister && (
          <Box
            mt={6}
            textAlign='center'
          >
            <Text
              fontSize='14px'
              color={subtextColor}
            >
              Don't have an account?{' '}
              <ChakraLink
                href='/register?login=true'
                color={linkColor}
                fontWeight='600'
                _hover={{ textDecoration: 'underline' }}
              >
                Register
              </ChakraLink>
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
