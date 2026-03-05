import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'transparent',
        color: 'gray.100',
      },
    },
  },
  colors: {
    brand: {
      50: '#ffe5ea',
      100: '#ffb3c1',
      200: '#ff8098',
      300: '#ff4d6f',
      400: '#e94560',
      500: '#e94560',
      600: '#c73a52',
      700: '#a52f44',
      800: '#832436',
      900: '#611928',
    },
  },
  fonts: {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;
