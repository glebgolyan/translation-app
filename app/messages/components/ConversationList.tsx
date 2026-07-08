'use client';
import {
    Box, HStack, Text, Badge, Avatar, Divider,
    useColorModeValue, Spinner, Center, Icon, VStack as VStackVertical,
} from '@chakra-ui/react';
import { RiChat3Line, RiCheckDoubleLine } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '@/features/messages/api/messagesApi';
import { useAuth } from '@/features/auth/model/useAuth';

interface ConversationListProps {
    onSelectConversation: (conversation: any) => void;
    selectedId?: string;
}

export function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
    const { user } = useAuth();

    const hoverBg = useColorModeValue('gray.50', '#222222');
    const textColor = useColorModeValue('gray.800', '#e0e0e0');
    const mutedColor = useColorModeValue('gray.500', '#999999');
    const selectedBg = useColorModeValue('brand.50', '#1a2540');

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['conversations', user?.role],
        queryFn: () =>
            user?.role === 'TRANSLATOR'
                ? messagesApi.getTranslatorConversations()
                : messagesApi.getAllConversations(),
        refetchInterval: 5000,
    });

    if (isLoading) {
        return (
            <Center h="400px">
                <Spinner color="brand.500" />
            </Center>
        );
    }

    if (conversations.length === 0) {
        return (
            <Center h="400px" flexDirection="column" gap={3}>
                <Icon as={RiChat3Line} boxSize={8} color="gray.400" />
                <Text color={mutedColor} fontSize="14px">
                    No conversations yet
                </Text>
            </Center>
        );
    }

    return (
        <VStackVertical spacing={0} divider={<Divider />} align="stretch" h="100%" overflowY="auto">
            {conversations.map((conv: any) => (
                <Box
                    key={conv.id}
                    p={3}
                    cursor="pointer"
                    bg={selectedId === conv.id ? selectedBg : 'transparent'}
                    _hover={{ bg: hoverBg }}
                    onClick={() => onSelectConversation(conv)}
                    transition="all 0.2s"
                    borderLeft="3px solid"
                    borderLeftColor={selectedId === conv.id ? 'brand.500' : 'transparent'}
                >
                    <HStack spacing={2} mb={2}>
                        <Avatar
                            name={conv.clientName}
                            size="sm"
                            bg="brand.500"
                        />
                        <VStackVertical spacing={0} flex={1}>
                            <HStack spacing={2} justify="space-between" w="100%">
                                <Text fontWeight="700" fontSize="13px" color={textColor}>
                                    Order #{conv.id}
                                </Text>
                                {conv.unreadCount > 0 && (
                                    <Badge colorScheme="red" fontSize="10px">
                                        {conv.unreadCount}
                                    </Badge>
                                )}
                            </HStack>
                            <Text fontSize="11px" color={mutedColor} noOfLines={1}>
                                {conv.clientName}
                            </Text>
                        </VStackVertical>
                    </HStack>

                    <Text
                        fontSize="12px"
                        color={mutedColor}
                        noOfLines={1}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        mb={2}
                    >
                        {conv.lastMessage?.text ||
                            (conv.lastMessage?.reaction ? `Sent ${conv.lastMessage.reaction}` : 'No messages')}
                    </Text>

                    <HStack spacing={2} fontSize="10px" color={mutedColor}>
                        <Text>
                            {new Date(conv.lastMessage?.createdAt).toLocaleDateString('uk-UA')}
                        </Text>
                        {conv.lastMessage?.isRead && (
                            <Icon as={RiCheckDoubleLine} boxSize={3} color="blue.400" />
                        )}
                        <Badge colorScheme="gray" fontSize="9px" variant="subtle">
                            {conv.status || 'Active'}
                        </Badge>
                    </HStack>
                </Box>
            ))}
        </VStackVertical>
    );
}