// frontend/src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Mientras verificamos si el usuario existe, mostramos un spinner
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // 2. Si terminó de cargar y NO está autenticado, lo mandamos al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si está autenticado, dejamos que vea el contenido (Outlet)
  return (
    <Box>
      <Outlet />
    </Box>
  );
};