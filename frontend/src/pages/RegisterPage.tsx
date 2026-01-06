import { Box, Grid, Heading, Text, VStack, Link as ChakraLink, Image, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <Grid minH="100vh" templateColumns={{ base: "1fr", md: "1fr 1fr" }}>
      
      {/* COLUMNA IZQUIERDA: Formulario */}
      <Flex 
        p={{ base: 5, md: 8 }} // <--- AJUSTE: Optimizado para móvil
        flexDir="column" 
        align="center" 
        justify="center" 
        bg="white"
      >
        <Box w="full" maxW="md">
          <VStack gap={6} align="stretch">
            
            <Box textAlign="center" mb={{ base: 2, md: 4 }}>
              <Heading 
                size={{ base: "xl", md: "2xl" }} // <--- AJUSTE: Título responsivo
                color="green.600" 
                letterSpacing="tight"
              >
                Únete a SkillBarter
              </Heading>
              <Text color="gray.500" fontSize={{ base: "md", md: "lg" }} mt={2}>
                Crea tu cuenta en segundos
              </Text>
            </Box>

            <RegisterForm />

            <Text fontSize="sm" color="gray.600" textAlign="center" mt={4}>
              ¿Ya tienes cuenta?{' '}
              <ChakraLink asChild color="blue.600" fontWeight="bold">
                <Link to="/login">Inicia Sesión aquí</Link>
              </ChakraLink>
            </Text>
          </VStack>
        </Box>
      </Flex>

      {/* COLUMNA DERECHA: Imagen (Solo Desktop) */}
      <Box display={{ base: "none", md: "block" }} position="relative">
        <Image 
          src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
          alt="Comunidad"
          objectFit="cover" 
          h="100%" 
          w="100%"
        />
        <Box 
          position="absolute" top="0" left="0" w="full" h="full" 
          bg="blackAlpha.400" mixBlendMode="multiply"
        />
      </Box>
    </Grid>
  );
};