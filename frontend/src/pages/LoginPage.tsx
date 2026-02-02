// frontend/src/pages/LoginPage.tsx
import { Box, Grid, Heading, Text, VStack, Link as ChakraLink, Image, Flex } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/services', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Grid minH="100vh" templateColumns={{ base: "1fr", md: "1fr 1fr" }}>
      
      {/* Columna Izquierda */}
      <Flex p={{ base: 5, md: 8 }} flexDir="column" align="center" justify="center" bg="white">
        <Box w="full" maxW="md">
          <VStack spacing={6} align="stretch">
            
            <Box textAlign="center" mb={{ base: 2, md: 4 }}>
              <Heading size={{ base: "xl", md: "2xl" }} color="blue.600" letterSpacing="tight">
                SkillBarter
              </Heading>
              <Text color="gray.500" fontSize={{ base: "md", md: "lg" }} mt={2}>
                Tu mercado de habilidades universitario
              </Text>
            </Box>

            <LoginForm />

            <Text fontSize="sm" color="gray.600" textAlign="center" mt={4}>
              ¿No tienes cuenta?{' '}
              {/* 👇 ESTA ES LA LÍNEA QUE ARREGLA EL ERROR DE CONSOLA 👇 */}
              <ChakraLink as={Link} to="/register" color="blue.600" fontWeight="bold">
                Regístrate gratis
              </ChakraLink>
            </Text>
          </VStack>
        </Box>
      </Flex>

      {/* Columna Derecha */}
      <Box display={{ base: "none", md: "block" }} position="relative">
        <Image 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
          alt="Estudiantes" objectFit="cover" h="100%" w="100%"
        />
        <Box position="absolute" top="0" left="0" w="full" h="full" bg="blackAlpha.300" mixBlendMode="multiply" />
      </Box>
    </Grid>
  );
};