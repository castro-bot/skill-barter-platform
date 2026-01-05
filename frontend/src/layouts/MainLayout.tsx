import { Box, Flex, HStack, Text, Button } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <Flex direction="column" h="100vh">
      {/* 1. Navbar Superior Fijo */}
      <Box as="nav" bg="blue.600" color="white" px={8} py={4} shadow="md">
        <Flex justify="space-between" align="center">
          <Text fontSize="xl" fontWeight="bold">SkillBarter 🤝</Text>
          
          <HStack gap={4}>
            <Text fontSize="sm">Hola, {user?.name}</Text>
            <Button size="sm" variant="surface" colorPalette="white" onClick={logout}>
              Salir
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* 2. Área de Contenido Variable */}
      <Box flex="1" bg="gray.50" p={8} overflowY="auto">
        {/* Aquí se renderizarán las páginas hijas (Dashboard, Perfil, etc.) */}
        <Outlet />
      </Box>

      {/* 3. Footer Sencillo */}
      <Box as="footer" py={4} textAlign="center" color="gray.500" fontSize="sm">
        © 2026 SkillBarter - DevSky
      </Box>
    </Flex>
  );
};