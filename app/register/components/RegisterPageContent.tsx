'use client';
import { Box, Text, useColorModeValue, Link as ChakraLink } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/model/useAuth';
import { RegisterForm } from './RegisterForm';
import { useT } from '@/shared/hooks/useT';

export function RegisterPageContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useT();
    const searchParams = useSearchParams();
    const hasAccess = searchParams.get('login') === 'true';

    const bgColor = useColorModeValue('white', '#141414');
    const textColor = useColorModeValue('gray.900', '#f0f0f0');
    const subtextColor = useColorModeValue('gray.500', '#888888');
    const linkColor = useColorModeValue('brand.500', 'brand.300');

    useEffect(() => {
        if (user && !loading) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    // Redirect if no login=true query param
    useEffect(() => {
        if (!hasAccess && !loading) {
            router.push('/login');
        }
    }, [hasAccess, loading, router]);

    if (loading || !hasAccess) return null;

    return (
        <Box flex={1} bg={bgColor} display="flex" flexDirection="column" justifyContent="center" p={8}>
            <Box maxW="400px" mx="auto" w="100%">
                <Box mb={8}>
                    <Text fontFamily="Syne" fontSize="24px" fontWeight="800" letterSpacing="-0.02em" color={textColor} mb={2}>
                        {t('auth.register')}
                    </Text>
                </Box>

                <RegisterForm />

                {/* Link back to login */}
                <Box mt={6} textAlign="center">
                    <Text fontSize="14px" color={subtextColor}>
                        {t('auth.haveAccount')}{' '}
                        <ChakraLink href="/login?register=true" color={linkColor} fontWeight="600" _hover={{ textDecoration: 'underline' }}>
                            {t('auth.login')}
                        </ChakraLink>
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}