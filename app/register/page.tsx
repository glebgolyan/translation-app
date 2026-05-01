'use client';
// app/register/page.tsx
import {
  Box, VStack, Text, FormControl, FormLabel, FormErrorMessage,
  Input, Button, useToast, Select,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuth } from '@/features/auth/model/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Min 6 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await authRegister({ email: values.email, password: values.password, name: values.name, phone: values.phone });
      router.push('/dashboard');
    } catch {
      toast({ title: 'Registration failed', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#fafafa" p={8}>
      <Box w="100%" maxW="420px">
        <Box mb={8} textAlign="center">
          <Box
            w="40px" h="40px" bg="brand.600" borderRadius="10px"
            display="flex" alignItems="center" justifyContent="center"
            mx="auto" mb={4}
          >
            <Text color="white" fontFamily="Syne" fontWeight="800" fontSize="20px">T</Text>
          </Box>
          <Text fontFamily="Syne" fontWeight="800" fontSize="26px" letterSpacing="-0.02em" mb={2}>
            Create account
          </Text>
          <Text color="gray.400" fontSize="14px">Join TranslateOS as a client</Text>
        </Box>

        <Box bg="white" borderRadius="12px" border="1px solid" borderColor="gray.100" p={8}>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontSize="13px">Full Name</FormLabel>
                <Input {...register('name')} placeholder="John Doe" />
                <FormErrorMessage fontSize="12px">{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="13px">Email</FormLabel>
                <Input {...register('email')} type="email" placeholder="you@example.com" />
                <FormErrorMessage fontSize="12px">{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="13px">Phone (optional)</FormLabel>
                <Input {...register('phone')} placeholder="+380 XX XXX XXXX" />
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="13px">Password</FormLabel>
                <Input {...register('password')} type="password" placeholder="••••••••" />
                <FormErrorMessage fontSize="12px">{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.confirm}>
                <FormLabel fontSize="13px">Confirm Password</FormLabel>
                <Input {...register('confirm')} type="password" placeholder="••••••••" />
                <FormErrorMessage fontSize="12px">{errors.confirm?.message}</FormErrorMessage>
              </FormControl>

              <Button type="submit" w="full" isLoading={loading} loadingText="Creating…" mt={2}>
                Create Account
              </Button>
            </VStack>
          </Box>
        </Box>

        <Text textAlign="center" fontSize="13px" color="gray.400" mt={4}>
          Already have an account?{' '}
          <NextLink href="/login" style={{ textDecoration: 'none' }}>
            <Text as="span" color="brand.600" fontWeight="500">Sign in</Text>
          </NextLink>
        </Text>
      </Box>
    </Box>
  );
}
