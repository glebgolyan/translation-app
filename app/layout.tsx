import type { Metadata } from 'next';
import { AppChakraProvider } from '@/shared/providers/ChakraProvider';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { ColorModeScript } from '@chakra-ui/react';

export const metadata: Metadata = {
    title: 'TranslateOS — Document Translation Management',
    description: 'Professional document translation management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap"
                rel="stylesheet"
            />
        </head>
        <body>
        <ColorModeScript initialColorMode="light" />
        <QueryProvider>
            <AppChakraProvider>{children}</AppChakraProvider>
        </QueryProvider>
        </body>
        </html>
    );
}