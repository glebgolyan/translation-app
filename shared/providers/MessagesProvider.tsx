'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/model/useAuth';

interface MessagesContextType {
    unreadCount: number;
    socket: Socket | null;
}

export const MessagesContext = createContext<MessagesContextType>({
    unreadCount: 0,
    socket: null,
});

export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        // Get base URL by removing /api from NEXT_PUBLIC_API_URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

        const baseUrl = new URL(apiUrl).origin || 'http://localhost:3001';

        const socket = io(`${baseUrl}/messages`, {
            auth: {
                userId: user.id,
            },
            query: { userId: user.id },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('✅ Messages socket connected');
            console.log('--socket--', socket)

            socket.emit(`user:${user.id}`);
        });

        socket.on('new_message', (message: any) => {

            console.log('--message--', message)
            // Only show toast if message is from someone else
            if (message.senderId !== user.id) {
                console.log('💬 New message received');

                // Increment unread count
                setUnreadCount(prev => prev + 1);

                // Show toast
                const senderName = message.sender?.name || 'Someone';
                const messageText = message.text || message.reaction || 'Sent a message';

                toast({
                    title: '📨 New Message',
                    description: `${senderName}: ${messageText}`,
                    status: 'info',
                    duration: 4000,
                    isClosable: true,
                    position: 'top-right',
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Messages socket disconnected');
        });

        socketRef.current = socket;

        return () => {
            socket.close();
        };
    }, [user?.id, toast]);

    // Reset unread count when user views messages
    // const resetUnreadCount = () => {
    //     setUnreadCount(0);
    // };

    return (
        <MessagesContext.Provider value={{ unreadCount, socket: socketRef.current }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessagesContext);
    if (!context) {
        throw new Error('useMessages must be used within MessagesProvider');
    }
    return context;
}