import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export const MainLayout = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Barra Superior */}
      <Navbar />

      {/* Contenido de la página (Dashboard, Perfil, etc.) */}
      <Box as="main" py={8}>
        <Outlet />
      </Box>
    </Box>
  );
};