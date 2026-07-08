'use client';
import {
    Box, Flex, Text, useColorModeValue, VStack, HStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/model/useAuth';
import { useRouter } from 'next/navigation';
import { ConversationList } from './components/ConversationList';
import { OrderDetailsPanel } from './components/OrderDetailsPanel';
import { Messenger } from '@/widgets/order-table/components/Messenger';

export default function MessagesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedConversation, setSelectedConversation] = useState<any>(null);

    const textColor = useColorModeValue('gray.900', '#f0f0f0');
    const subtitleColor = useColorModeValue('gray.400', '#666666');
    const dividerColor = useColorModeValue('gray.100', '#2e2e2e');
    const bg = useColorModeValue('white', '#1a1a1a');

    useEffect(() => {
        if (user && user.role !== 'MANAGER' && user.role !== 'ADMIN' && user.role !== 'TRANSLATOR') {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN' && user.role !== 'TRANSLATOR')) {
        return null;
    }

    return (
        <Box p={8}>
            <Box mb={6}>
                <Text fontFamily="Syne" fontWeight="800" fontSize="24px" letterSpacing="-0.02em" color={textColor}>
                    Messages
                </Text>
                <Text color={subtitleColor} fontSize="14px" mt={0.5}>
                    {user.role === 'TRANSLATOR'
                        ? 'Chat with managers about your assigned orders'
                        : 'Chat with translators about their work'}
                </Text>
            </Box>

            <Flex gap={6} h="calc(100vh - 200px)">
                {/* Conversations List - Left */}
                <Box
                    flex="0 0 320px"
                    border="1px solid"
                    borderColor={dividerColor}
                    borderRadius="8px"
                    overflow="hidden"
                    bg={bg}
                >
                    <ConversationList
                        onSelectConversation={setSelectedConversation}
                        selectedId={selectedConversation?.id}
                    />
                </Box>

                {/* Message Area - Middle */}
                <Box flex={1}>
                    {selectedConversation ? (
                        <VStack spacing={3} h="100%">
                            <HStack w="100%" pb={3} borderBottom="1px solid" borderColor={dividerColor} align="flex-start">
                                <VStack align="start" spacing={0} flex={1}>
                                    <Text fontFamily="Syne" fontWeight="700" fontSize="14px" color={textColor}>
                                        Order #{selectedConversation.id}
                                    </Text>
                                    <Text fontSize="12px" color={subtitleColor}>
                                        {selectedConversation.clientName}
                                    </Text>
                                </VStack>
                            </HStack>
                            <Box flex={1} w="100%">
                                <Messenger
                                    orderId={selectedConversation.id}
                                />
                            </Box>
                        </VStack>
                    ) : (
                        <Flex
                            h="100%"
                            align="center"
                            justify="center"
                            border="1px solid"
                            borderColor={dividerColor}
                            borderRadius="8px"
                            bg={bg}
                            color={subtitleColor}
                        >
                            <Text fontSize="14px">Select a conversation to start messaging</Text>
                        </Flex>
                    )}
                </Box>

                {/* Order Details - Right */}
                {selectedConversation && (
                    <Box
                        flex="0 0 320px"
                        border="1px solid"
                        borderColor={dividerColor}
                        borderRadius="8px"
                        bg={bg}
                        p={4}
                        overflowY="auto"
                    >
                        <OrderDetailsPanel conversation={selectedConversation} />
                    </Box>
                )}
            </Flex>
        </Box>
    );
}