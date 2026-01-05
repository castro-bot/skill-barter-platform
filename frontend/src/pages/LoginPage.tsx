import { Box, Center, Heading, Text, VStack, Link as ChakraLink } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // CAMBIO: Redirigir a /services
      navigate('/services', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Center h="100vh" bg="gray.50" px={4}>
      <Box 
        p={8} 
        bg="white" 
        shadow="xl" 
        borderRadius="2xl" 
        width="100%" 
        maxW="400px"
        borderWidth="1px"
      >
        <VStack gap={6}>
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>SkillBarter</Heading>
            <Text color="gray.500">Tu mercado de habilidades universitario</Text>
          </Box>

          <LoginForm />

          <Text fontSize="sm" color="gray.600" textAlign="center" mt={4}>
            ¿No tienes cuenta?{' '}
            <ChakraLink asChild color="blue.500" fontWeight="bold">
              <Link to="/register">Regístrate gratis</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Center>
  );
};