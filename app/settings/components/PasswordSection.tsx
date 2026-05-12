'use client';
import {
    Box, Text, FormControl, FormLabel, Input, Button,
    Icon, useToast, VStack, HStack, InputGroup,
    InputRightElement, IconButton, useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { RiSaveLine, RiEyeLine, RiEyeOffLine, RiLockLine } from 'react-icons/ri';
import { profileApi } from '@/features/auth/api/profileApi';

const schema = z.object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'Min 6 characters'),
    confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export function PasswordSection() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const bg = useColorModeValue('white', '#1a1a1a');
    const borderColor = useColorModeValue('gray.100', '#2e2e2e');
    const labelColor = useColorModeValue('gray.400', '#666666');
    const textColor = useColorModeValue('gray.900', '#f0f0f0');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await profileApi.update({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            toast({ title: 'Password changed successfully', status: 'success', duration: 2000 });
            reset();
        } catch (err: any) {
            toast({
                title: 'Failed to change password',
                description: err?.response?.data?.message || err?.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box bg={bg} borderRadius="12px" border="1px solid" borderColor={borderColor} overflow="hidden">
            <Box px={6} py={5} borderBottom="1px solid" borderColor={borderColor}>
                <Text fontFamily="Syne" fontWeight="700" fontSize="15px" color={textColor}>
                    Change Password
                </Text>
                <Text fontSize="13px" color={labelColor} mt={0.5}>
                    Make sure to use a strong password
                </Text>
            </Box>

            <Box p={6}>
                <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                    <VStack spacing={4} align="stretch" maxW="400px">
                        <FormControl isInvalid={!!errors.currentPassword}>
                            <FormLabel fontSize="13px" color={labelColor}>Current Password</FormLabel>
                            <InputGroup size="sm">
                                <Input
                                    {...register('currentPassword')}
                                    type={showCurrent ? 'text' : 'password'}
                                    placeholder="••••••••"
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label="Toggle"
                                        icon={<Icon as={showCurrent ? RiEyeOffLine : RiEyeLine} />}
                                        size="xs" variant="ghost"
                                        onClick={() => setShowCurrent(p => !p)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            {errors.currentPassword && (
                                <Text fontSize="12px" color="red.400" mt={1}>{errors.currentPassword.message}</Text>
                            )}
                        </FormControl>

                        <FormControl isInvalid={!!errors.newPassword}>
                            <FormLabel fontSize="13px" color={labelColor}>New Password</FormLabel>
                            <InputGroup size="sm">
                                <Input
                                    {...register('newPassword')}
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="••••••••"
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label="Toggle"
                                        icon={<Icon as={showNew ? RiEyeOffLine : RiEyeLine} />}
                                        size="xs" variant="ghost"
                                        onClick={() => setShowNew(p => !p)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            {errors.newPassword && (
                                <Text fontSize="12px" color="red.400" mt={1}>{errors.newPassword.message}</Text>
                            )}
                        </FormControl>

                        <FormControl isInvalid={!!errors.confirmPassword}>
                            <FormLabel fontSize="13px" color={labelColor}>Confirm New Password</FormLabel>
                            <Input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="••••••••"
                                size="sm"
                            />
                            {errors.confirmPassword && (
                                <Text fontSize="12px" color="red.400" mt={1}>{errors.confirmPassword.message}</Text>
                            )}
                        </FormControl>

                        <HStack justify="flex-end" pt={2}>
                            <Button
                                type="submit"
                                size="sm"
                                leftIcon={<Icon as={RiLockLine} />}
                                isLoading={loading}
                                loadingText="Changing…"
                                colorScheme="brand"
                            >
                                Change Password
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </Box>
        </Box>
    );
}