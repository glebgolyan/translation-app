'use client';
import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '@/features/auth/model/useAuth';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { User } from '@/entities/user/model/types';

export default function SettingsPage() {
    const { user, login } = useAuth();

    const textColor = useColorModeValue('gray.900', '#f0f0f0');
    const subtitleColor = useColorModeValue('gray.400', '#666666');

    if (!user) return null;

    const handleProfileUpdate = (updated: User) => {
        // Refresh user in auth state by re-fetching
        window.location.reload();
    };

    return (
        <Box p={8} maxW="800px">
            <Box mb={8}>
                <Text fontFamily="Syne" fontWeight="800" fontSize="24px"
                      letterSpacing="-0.02em" color={textColor}>
                    Settings
                </Text>
                <Text color={subtitleColor} fontSize="14px" mt={0.5}>
                    Manage your account preferences
                </Text>
            </Box>

            <VStack spacing={6} align="stretch">
                <ProfileSection user={user} onUpdate={handleProfileUpdate} />
                <PasswordSection />
            </VStack>
        </Box>
    );
}