import {Box, Container, Heading, Text, Button, Flex, Icon, SimpleGrid, HStack } from '@chakra-ui/react';
import { FaPlus, FaBoxOpen, FaStar, FaExchangeAlt, FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import type { ElementType } from 'react';

// 1. SOLUCIÓN TIPO: Definimos qué datos espera la tarjeta
interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  color: string;
}

// 2. SOLUCIÓN RENDIMIENTO: El componente vive AFUERA del DashboardPage
const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <Box 
    bg="white" 
    p={4} 
    borderRadius="xl" 
    border="1px solid" 
    borderColor="gray.100" 
    shadow="sm"
    display="flex"
    alignItems="center"
    gap={4}
    transition="transform 0.2s"
    _hover={{ transform: "translateY(-2px)", shadow: "md" }}
  >
    <Flex 
      w={12} h={12} 
      align="center" justify="center" 
      borderRadius="lg" 
      bg={`${color}.50`} 
      color={`${color}.500`}
    >
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="xl" fontWeight="bold" color="gray.700">
        {value}
      </Text>
    </Box>
  </Box>
);

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      
      {/* 1. HERO HEADER */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" pb={10} pt={8}>
        <Container maxW="container.xl">
          <Flex 
            justify="space-between" 
            align="center" 
            direction={{ base: 'column', md: 'row' }}
            gap={6}
            mb={8}
          >
            <Box maxW="2xl">
              <HStack mb={2}>
                <Heading 
                  size="xl" 
                  color="gray.800"
                  letterSpacing="tight"
                >
                  Hola, <Box as="span" color="blue.600">{user?.name?.split(' ')[0]}</Box> 👋
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.500">
                Bienvenido a tu panel de control. Aquí gestionas tus habilidades.
              </Text>
            </Box>
            
            <Button 
              size="lg"
              colorPalette="blue" 
              bg="blue.600"
              _hover={{ bg: "blue.700" }}
              color="white"
              borderRadius="full"
              px={6}
              shadow="md"
            >
              <Icon as={FaPlus} mr={2} />
              Publicar Servicio
            </Button>
          </Flex>

          {/* 2. BARRA DE ESTADÍSTICAS */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <StatCard icon={FaCoins} label="Mis Créditos" value="0" color="yellow" />
            <StatCard icon={FaExchangeAlt} label="Intercambios" value="0" color="purple" />
            <StatCard icon={FaStar} label="Reputación" value="Nueva" color="green" />
          </SimpleGrid>

        </Container>
      </Box>

      {/* 3. ÁREA DE SERVICIOS */}
      <Container maxW="container.xl" py={10}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="gray.700">Explorar Mercado</Heading>
          
          <HStack gap={2}>
            <Button size="xs" variant="solid" bg="gray.800" color="white" borderRadius="full">Todo</Button>
            <Button size="xs" variant="ghost" color="gray.500" borderRadius="full">Tecnología</Button>
            <Button size="xs" variant="ghost" color="gray.500" borderRadius="full">Idiomas</Button>
          </HStack>
        </Flex>

        {/* EMPTY STATE */}
        <Flex 
          direction="column"
          align="center"
          justify="center"
          py={16} 
          bg="white"
          borderRadius="2xl" 
          border="1px dashed" 
          borderColor="gray.300"
          textAlign="center"
        >
          <Box 
            bg="blue.50" p={6} borderRadius="full" mb={4}
            color="blue.500"
          >
            <Icon as={FaBoxOpen} boxSize={10} />
          </Box>
          <Heading size="md" color="gray.800" mb={2}>
            No hay servicios disponibles
          </Heading>
          <Text color="gray.500" maxW="md" mb={6}>
            Parece que nadie ha publicado nada aún. ¡Sé el primero en ofrecer tu talento y gana créditos extra!
          </Text>
          <Button variant="outline" borderColor="blue.200" color="blue.600" size="sm">
            Crear primera publicación
          </Button>
        </Flex>

      </Container>
    </Box>
  );
};