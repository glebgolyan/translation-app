'use client';
import {
    Box, FormControl, FormLabel, Input, Button, VStack,
    Text, InputGroup, InputRightElement, IconButton, Icon,
    useToast, useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { authApi } from '@/features/auth/api/authApi';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
    const router = useRouter();
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const labelColor = useColorModeValue('gray.400', '#666666');
    const inputBg = useColorModeValue('white', '#252525');
    const errorColor = useColorModeValue('red.500', 'red.400');

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await authApi.register({
                name: values.name,
                email: values.email,
                password: values.password,
                phone: values.phone || undefined,
            });
            toast({
                title: 'Account created successfully',
                status: 'success',
                duration: 2000,
            });
            router.push('/login?register=true');
        } catch (err: any) {
            toast({
                title: 'Registration failed',
                description: err?.response?.data?.message || 'Unknown error',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4} align="stretch">
                {/* Name Field */}
                <FormControl isInvalid={!!errors.name}>
                    <FormLabel fontSize="13px" color={labelColor} fontWeight="500">
                        Full Name
                    </FormLabel>
                    <Input
                        {...register('name')}
                        placeholder="John Doe"
                        size="sm"
                        bg={inputBg}
                        borderColor="gray.300"
                        _dark={{ borderColor: '#2e2e2e' }}
                        _focus={{
                            borderColor: 'brand.400',
                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                        }}
                    />
                    {errors.name && (
                        <Text fontSize="12px" color={errorColor} mt={1}>
                            {errors.name.message}
                        </Text>
                    )}
                </FormControl>

                {/* Email Field */}
                <FormControl isInvalid={!!errors.email}>
                    <FormLabel fontSize="13px" color={labelColor} fontWeight="500">
                        Email Address
                    </FormLabel>
                    <Input
                        {...register('email')}
                        type="email"
                        placeholder="you@example.com"
                        size="sm"
                        bg={inputBg}
                        borderColor="gray.300"
                        _dark={{ borderColor: '#2e2e2e' }}
                        _focus={{
                            borderColor: 'brand.400',
                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                        }}
                    />
                    {errors.email && (
                        <Text fontSize="12px" color={errorColor} mt={1}>
                            {errors.email.message}
                        </Text>
                    )}
                </FormControl>

                {/* Phone Field */}
                <FormControl isInvalid={!!errors.phone}>
                    <FormLabel fontSize="13px" color={labelColor} fontWeight="500">
                        Phone Number <Text as="span" color="gray.400">(Optional)</Text>
                    </FormLabel>
                    <Input
                        {...register('phone')}
                        placeholder="+380 XX XXX XXXX"
                        size="sm"
                        bg={inputBg}
                        borderColor="gray.300"
                        _dark={{ borderColor: '#2e2e2e' }}
                        _focus={{
                            borderColor: 'brand.400',
                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                        }}
                    />
                    {errors.phone && (
                        <Text fontSize="12px" color={errorColor} mt={1}>
                            {errors.phone.message}
                        </Text>
                    )}
                </FormControl>

                {/* Password Field */}
                <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="13px" color={labelColor} fontWeight="500">
                        Password
                    </FormLabel>
                    <InputGroup size="sm">
                        <Input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 6 characters"
                            bg={inputBg}
                            borderColor="gray.300"
                            _dark={{ borderColor: '#2e2e2e' }}
                            _focus={{
                                borderColor: 'brand.400',
                                boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                            }}
                        />
                        <InputRightElement>
                            <IconButton
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                icon={<Icon as={showPassword ? RiEyeOffLine : RiEyeLine} boxSize={4} />}
                                size="xs"
                                variant="ghost"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </InputRightElement>
                    </InputGroup>
                    {errors.password && (
                        <Text fontSize="12px" color={errorColor} mt={1}>
                            {errors.password.message}
                        </Text>
                    )}
                </FormControl>

                {/* Confirm Password Field */}
                <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel fontSize="13px" color={labelColor} fontWeight="500">
                        Confirm Password
                    </FormLabel>
                    <InputGroup size="sm">
                        <Input
                            {...register('confirmPassword')}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            bg={inputBg}
                            borderColor="gray.300"
                            _dark={{ borderColor: '#2e2e2e' }}
                            _focus={{
                                borderColor: 'brand.400',
                                boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                            }}
                        />
                        <InputRightElement>
                            <IconButton
                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                icon={<Icon as={showConfirm ? RiEyeOffLine : RiEyeLine} boxSize={4} />}
                                size="xs"
                                variant="ghost"
                                onClick={() => setShowConfirm(!showConfirm)}
                            />
                        </InputRightElement>
                    </InputGroup>
                    {errors.confirmPassword && (
                        <Text fontSize="12px" color={errorColor} mt={1}>
                            {errors.confirmPassword.message}
                        </Text>
                    )}
                </FormControl>

                {/* Submit Button */}
                <Button
                    type="submit"
                    w="100%"
                    size="sm"
                    isLoading={loading}
                    loadingText="Creating..."
                    mt={2}
                >
                    Create Account
                </Button>
            </VStack>
        </Box>
    );
}