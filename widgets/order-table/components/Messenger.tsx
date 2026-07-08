'use client';
import {
    Box, VStack, HStack, Input, Button, Icon, IconButton,
    Text, useColorModeValue, Flex,
    Tooltip, Badge,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RiChatSmileLine } from 'react-icons/ri';
import { messagesApi } from '@/features/messages/api/messagesApi';
import { useAuth } from '@/features/auth/model/useAuth';

const REACTIONS = ['❤️', '👍', '👎', '🔥', '😂', '🎉', '😍', '🙌'];

interface MessengerProps {
    orderId?: string;
    translatorId?: string;
    onNewMessage?: (message: any) => void;
}

export function Messenger({ orderId, translatorId, onNewMessage }: MessengerProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [showReactions, setShowReactions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false)
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const bg = useColorModeValue('white', '#1a1a1a');
    const borderColor = useColorModeValue('gray.100', '#2e2e2e');
    const messageOwn = useColorModeValue('brand.50', '#1a2540');
    const messageOther = useColorModeValue('gray.50', '#222222');
    const textColor = useColorModeValue('gray.800', '#e0e0e0');

    // Load initial messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                if (orderId) {
                    const data = await messagesApi.getOrderMessages(orderId);
                    setMessages(data);
                } else if (translatorId) {
                    const data = await messagesApi.getTranslatorMessages(translatorId);
                    setMessages(data);
                }
            } catch (err) {
                console.error('Failed to load messages:', err);
            }
        };
        loadMessages();
    }, [orderId, translatorId]);

    // Connect WebSocket
    useEffect(() => {
        if (!user?.id) return;

        // Get base URL by removing /api from NEXT_PUBLIC_API_URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

        const baseUrl = new URL(apiUrl).origin || 'http://localhost:3001';

        console.log('Connecting to socket.io at:', baseUrl, 'namespace: /messages');

        const socket = io(`${baseUrl}/messages`, {
            query: { userId: user.id },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            setConnected(true);

            // Join the appropriate room
            if (orderId) {
                console.log('📍 Joining order room:', orderId);
                socket.emit('join_order', { orderId });
            }
            if (translatorId) {
                console.log('📍 Joining translator room:', translatorId);
                socket.emit('join_translator', { translatorId });
            }
        });

        socket.on('new_message', (message: any) => {
            console.log('💬 Received new message:', message);

            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === message.id)) {
                    console.log('⚠️ Message already exists, skipping');
                    return prev;
                }
                return [...prev, message];
            });

            // Only show toast for messages from others
            if (message.senderId !== user.id) {
                console.log('🔔 Showing toast for message from:', message.senderId);
                onNewMessage?.(message);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });

        socketRef.current = socket;

        return () => {
            console.log('🧹 Cleaning up socket');
            socket.close();
        };
    }, [user?.id, orderId, translatorId, onNewMessage]);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
            }, 0);
        }
    }, [messages]);

    const handleSendMessage = async (reaction?: string) => {
        console.log('check count of clicks here on send message')
        if (!text && !reaction) return;
        if (!user?.id) return;
        if (!connected) {
            console.warn('⚠️ Socket not connected, cannot send message');
            return;
        }

        const messageData = {
            orderId: orderId || null,
            translatorId: translatorId || null,
            senderId: user.id,
            text: reaction ? null : text,
            reaction: reaction || null,
        };

        // Optimistic update - add message to UI immediately
        const tempMessage = {
            id: `temp-${Date.now()}`,
            ...messageData,
            sender: { id: user.id, name: user.name, email: user.email, role: user.role },
            isRead: false,
            createdAt: new Date(),
        };

        // setMessages(prev => [...prev, tempMessage]);
        setText('');
        setShowReactions(false);
        setLoading(true);

        try {
            // Emit through socket to notify others
            if (socketRef.current?.connected) {
                console.log('📡 Emitting send_message via socket');
                socketRef.current.emit('send_message', messageData);
            }
        } catch (err) {
            console.error('❌ Failed to send message:', err);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            setText(messageData.text || '');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async () => {
        const unreadIds = messages
            .filter(m => !m.isRead && m.senderId !== user?.id)
            .map(m => m.id);

        if (unreadIds.length > 0) {
            try {
                await messagesApi.markAsRead(unreadIds);
                setMessages(prev =>
                    prev.map(m => (unreadIds.includes(m.id) ? { ...m, isRead: true } : m))
                );
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }
    };

    useEffect(() => {
        handleMarkRead();
    }, [messages, user?.id]);

    return (
        <VStack spacing={3} w="100%" minH="260px" maxH='600px' bg={bg} border="1px solid" borderColor={borderColor} borderRadius="8px" p={3}>
            {/* Messages area */}
            <Box
                ref={scrollRef}
                flex={1}
                w="100%"
                overflowY="auto"
                display="flex"
                flexDirection="column"
                gap={2}
            >
                {messages.length === 0 ? (
                    <Flex align="center" justify="center" h="100%" color="gray.400" fontSize="13px">
                        No messages yet
                    </Flex>
                ) : (
                    messages.map(msg => (
                        <Box
                            key={msg.id}
                            alignSelf={msg.senderId === user?.id ? 'flex-end' : 'flex-start'}
                            maxW="75%"
                        >
                            <Box
                                bg={msg.senderId === user?.id ? messageOwn : messageOther}
                                borderRadius="8px"
                                p={2}
                                borderBottomLeftRadius={msg.senderId === user?.id ? '8px' : '2px'}
                                borderBottomRightRadius={msg.senderId === user?.id ? '2px' : '8px'}
                                opacity={msg.id.startsWith('temp-') ? 0.7 : 1}
                            >
                                {msg.text && (
                                    <Text fontSize="13px" color={textColor}>
                                        {msg.text}
                                    </Text>
                                )}
                                {msg.reaction && (
                                    <Text fontSize="20px">{msg.reaction}</Text>
                                )}
                                <Text fontSize="10px" color="gray.500" mt={1}>
                                    {new Date(msg.createdAt).toLocaleTimeString('uk-UA', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </Box>
                            {!msg.isRead && msg.senderId !== user?.id && (
                                <Badge size="xs" colorScheme="blue" mt={1}>
                                    Unread
                                </Badge>
                            )}
                        </Box>
                    ))
                )}
            </Box>

            {/* Input area */}
            <HStack w="100%" spacing={1}>
                <Input
                    placeholder="Type message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    size="sm"
                    isDisabled={loading}
                />

                {/* Reactions dropdown */}
                <Box position="relative">
                    <Tooltip label="Send reaction" placement="top">
                        <IconButton
                            aria-label="Reactions"
                            icon={<Icon as={RiChatSmileLine} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowReactions(!showReactions)}
                        />
                    </Tooltip>
                    {showReactions && (
                        <Box
                            position="absolute"
                            bottom="100%"
                            left={0}
                            bg={bg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="8px"
                            p={2}
                            mb={1}
                            display="grid"
                            gridTemplateColumns="repeat(4, 1fr)"
                            gap={1}
                            zIndex={10}
                        >
                            {REACTIONS.map(reaction => (
                                <Button
                                    key={reaction}
                                    size="sm"
                                    fontSize="16px"
                                    p={1}
                                    minW="auto"
                                    onClick={() => handleSendMessage(reaction)}
                                    isLoading={loading}
                                >
                                    {reaction}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Send button */}
                <Button
                    size="sm"
                    onClick={() => handleSendMessage()}
                    isDisabled={!text && !loading}
                    isLoading={loading}
                >
                    Send
                </Button>
            </HStack>
        </VStack>
    );
}