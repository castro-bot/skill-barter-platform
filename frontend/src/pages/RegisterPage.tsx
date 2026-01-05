import { Box, Center, Heading, Text, VStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <Center h="100vh" bg="gray.50" px={4}>
      <Box p={8} bg="white" shadow="xl" borderRadius="2xl" width="100%" maxW="400px" borderWidth="1px">
        <VStack gap={6}>
          <Box textAlign="center">
            <Heading size="xl" color="green.600" mb={2}>Únete a SkillBarter</Heading>
            <Text color="gray.500">Crea tu cuenta para empezar a intercambiar</Text>
          </Box>

          <RegisterForm />

          <Text fontSize="sm" color="gray.600">
            ¿Ya tienes cuenta?{' '}
            <ChakraLink asChild color="blue.500" fontWeight="bold">
              <Link to="/login">Inicia Sesión aquí</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Center>
  );
};