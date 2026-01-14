// frontend/src/theme.ts
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    brand: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      500: '#2196F3', // Azul principal
      600: '#1E88E5',
      900: '#0D47A1',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'xl', // Bordes más redondeados
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          boxShadow: 'sm',
          _hover: {
            boxShadow: 'md',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme;