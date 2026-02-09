// frontend/src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flex, Spinner, Text, VStack, useColorModeValue } from '@chakra-ui/react';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const pageBg = useColorModeValue("surfaceMuted", "surfaceMuted")
  const textMuted = useColorModeValue("gray.500", "gray.400")

  // 1. SI ESTÁ CARGANDO: Muestra un spinner, NO REDIRIJA AÚN
  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={pageBg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color={textMuted} fontSize="sm">Verificando sesión...</Text>
        </VStack>
      </Flex>
    );
  }

  // 2. SI TERMINÓ DE CARGAR Y NO HAY USUARIO: Ahora sí, al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. SI HAY USUARIO: Pasa adelante
  return <Outlet />;
};
export default ProtectedRoute;
