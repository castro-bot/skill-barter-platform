import { Box, Container, Heading, Text, Button, Flex, Icon, SimpleGrid, HStack } from '@chakra-ui/react';
import { FaPlus, FaBoxOpen, FaStar, FaExchangeAlt, FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, ElementType } from 'react';

// --- COMPONENTES VISUALES ---

interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <Box 
    bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm"
    display="flex" alignItems="center" gap={4}
  >
    <Flex w={12} h={12} align="center" justify="center" borderRadius="lg" bg={`${color}.50`} color={`${color}.500`}>
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">{label}</Text>
      <Text fontSize="xl" fontWeight="bold" color="gray.700">{value}</Text>
    </Box>
  </Box>
);

// Tarjeta Simple (Hecha a mano con Box para evitar errores)
const ServiceCard = ({ title, category }: { title: string, category: string }) => (
  <Box 
    bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.200"
    _hover={{ shadow: 'md', borderColor: 'blue.300' }} transition="all 0.2s"
  >
    <Flex justify="space-between" align="center" mb={3}>
      <Box bg="blue.100" color="blue.700" px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="bold">
        {category}
      </Box>
      <Icon as={FaStar} color="yellow.400" />
    </Flex>
    <Heading size="sm" color="gray.700" mb={2}>{title}</Heading>
    <Text fontSize="sm" color="gray.500" mb={4}>Ofrecido por: Compañero</Text>
    <Button size="sm" colorScheme="blue" variant="outline" width="full">
        Ver Detalles
    </Button>
  </Box>
);

// --- PÁGINA PRINCIPAL ---

export const DashboardPage = () => {
  const { user } = useAuth();
  
  // ESTADO: Lista de servicios
  const [services, setServices] = useState<Array<{id: number, title: string, category: string}>>([]);

  // FUNCIÓN: Crear servicio
  const handleSimularPublicacion = () => {
    const nuevoServicio = {
      id: Date.now(),
      title: "Clases de Matemáticas",
      category: "Tutoría"
    };
    setServices([nuevoServicio, ...services]);
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      
      {/* HEADER */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" pb={10} pt={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={6} mb={8}>
            <Box>
              <Heading size="xl" color="gray.800">
                Hola, <Box as="span" color="blue.600">{user?.name?.split(' ')[0] || 'Estudiante'}</Box> 👋
              </Heading>
              <Text fontSize="lg" color="gray.500" mt={2}>
                Tienes {services.length} servicios activos.
              </Text>
            </Box>
            
            <Button 
              size="lg" bg="blue.600" color="white" borderRadius="full" px={6} shadow="md"
              _hover={{ bg: "blue.700" }}
              onClick={handleSimularPublicacion}
            >
              <Icon as={FaPlus} mr={2} />
              Publicar Servicio (Prueba)
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <StatCard icon={FaCoins} label="Mis Créditos" value="150" color="yellow" />
            <StatCard icon={FaExchangeAlt} label="Intercambios" value="3" color="purple" />
            <StatCard icon={FaStar} label="Reputación" value="4.8" color="green" />
          </SimpleGrid>
        </Container>
      </Box>

      {/* LISTA DE SERVICIOS */}
      <Container maxW="container.xl" py={10}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="gray.700">Explorar Mercado</Heading>
        </Flex>

        {services.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap={6}>
            {services.map((service) => (
              <ServiceCard key={service.id} title={service.title} category={service.category} />
            ))}
          </SimpleGrid>
        ) : (
          <Flex direction="column" align="center" justify="center" py={16} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.300">
            <Icon as={FaBoxOpen} boxSize={10} color="blue.300" mb={4} />
            <Heading size="md" color="gray.500">No hay servicios disponibles</Heading>
            <Text color="gray.400">Dale al botón de arriba para crear uno.</Text>
          </Flex>
        )}
      </Container>
    </Box>
  );
};