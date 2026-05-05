'use client';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
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
  semanticTokens: {
    colors: {
      // backgrounds
      'bg.app': { default: '#fafafa', _dark: '#0f0f0f' },
      'bg.surface': { default: 'white', _dark: '#1a1a1a' },
      'bg.subtle': { default: 'gray.50', _dark: '#222222' },
      'bg.hover': { default: 'gray.50', _dark: '#2a2a2a' },
      // borders
      'border.default': { default: 'gray.100', _dark: '#2e2e2e' },
      'border.subtle': { default: 'gray.50', _dark: '#252525' },
      // text
      'text.primary': { default: 'gray.900', _dark: '#f0f0f0' },
      'text.secondary': { default: 'gray.500', _dark: '#888888' },
      'text.muted': { default: 'gray.400', _dark: '#666666' },
      // sidebar
      'sidebar.bg': { default: 'white', _dark: '#141414' },
      'sidebar.border': { default: 'gray.100', _dark: '#2a2a2a' },
      'sidebar.active.bg': { default: 'brand.50', _dark: '#1a2540' },
      'sidebar.active.color': { default: 'brand.600', _dark: 'brand.300' },
      'sidebar.hover.bg': { default: 'gray.50', _dark: '#222222' },
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
        ghost: { borderRadius: '4px' },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: '4px',
            borderColor: 'border.default',
            bg: 'bg.surface',
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderRadius: '4px',
            borderColor: 'border.default',
            bg: 'bg.surface',
          },
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            fontFamily: 'Syne',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.muted',
            borderColor: 'border.default',
            py: 3,
          },
          td: {
            borderColor: 'border.subtle',
            fontSize: '14px',
            py: 3,
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: '3px',
        fontSize: '11px',
        fontFamily: 'Syne',
        fontWeight: '700',
        letterSpacing: '0.06em',
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'bg.surface',
          borderColor: 'border.default',
          shadow: 'lg',
        },
        item: {
          bg: 'bg.surface',
          _hover: { bg: 'bg.hover' },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: { bg: 'bg.surface' },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: { bg: 'bg.surface' },
      },
    },
    Divider: {
      baseStyle: {
        borderColor: 'border.default',
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: 'bg.app',
        color: 'text.primary',
      },
    }),
  },
});

export function AppChakraProvider({ children }: { children: React.ReactNode }) {
  return (
      <>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </>
  );
}