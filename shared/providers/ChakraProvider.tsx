'use client';
// shared/providers/ChakraProvider.tsx
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `'Syne', sans-serif`,
    body: `'DM Sans', sans-serif`,
    mono: `'JetBrains Mono', monospace`,
  },
  colors: {
    brand: {
      50: '#f0f4ff',
      100: '#dce6ff',
      200: '#b9ccff',
      300: '#85a6ff',
      400: '#4d76ff',
      500: '#1a47ff',
      600: '#0030f5',
      700: '#0025cc',
      800: '#001fa3',
      900: '#001880',
    },
    accent: {
      500: '#00d4aa',
      600: '#00b894',
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'brand' },
      variants: {
        solid: {
          borderRadius: '4px',
          fontFamily: 'Syne',
          fontWeight: '600',
          letterSpacing: '0.02em',
        },
        ghost: {
          borderRadius: '4px',
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: '4px',
            borderColor: 'gray.200',
            _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Table: {
      variants: {
        simple: {
          th: {
            fontFamily: 'Syne',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'gray.500',
            borderColor: 'gray.100',
            py: 3,
          },
          td: {
            borderColor: 'gray.50',
            fontSize: '14px',
            py: 3,
          },
        },
      },
    },
    Badge: {
      baseStyle: { borderRadius: '3px', fontSize: '11px', fontFamily: 'Syne', fontWeight: '700', letterSpacing: '0.06em' },
    },
  },
  styles: {
    global: {
      body: { bg: '#fafafa', color: '#111' },
      '@import': "url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap')",
    },
  },
});

export function AppChakraProvider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
