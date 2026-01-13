// frontend/src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react'; // <--- IMPORTANTE: Hooks para datos
import { Box, Container, Heading, Text, Button, Flex, Icon, SimpleGrid, HStack, useDisclosure, Spinner } from '@chakra-ui/react';
import { FaPlus, FaBoxOpen, FaStar, FaExchangeAlt, FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { CreateServiceModal } from '../components/services/CreateServiceModal';
import { ServiceCard } from '../components/services/ServiceCard'; // <--- Importamos la tarjeta
import { servicesApi, type ServiceListing } from '../api/services';
import type { ElementType } from 'react';

// Componente StatCard (Se mantiene igual)
interface StatCardProps { icon: ElementType; label: string; value: string; color: string; }
const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm" display="flex" alignItems="center" gap={4} transition="transform 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "md" }}>
    <Flex w={12} h={12} align="center" justify="center" borderRadius="lg" bg={`${color}.50`} color={`${color}.500`}><Icon as={icon} boxSize={5} /></Flex>
    <Box><Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">{label}</Text><Text fontSize="xl" fontWeight="bold" color="gray.700">{value}</Text></Box>
  </Box>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // 1. ESTADO: Aquí guardaremos los servicios que vengan del Backend
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. FUNCIÓN: Pedir datos a la API
  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await servicesApi.getAll();
      setServices(data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. EFECTO: Ejecutar esto apenas entres a la página
  useEffect(() => {
    loadServices();
  }, []);

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      
      {/* MODAL: Al terminar de crear (onSuccess), recargamos la lista */}
      <CreateServiceModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onSuccess={loadServices} 
      />

      {/* HERO HEADER */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" pb={10} pt={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={6} mb={8}>
            <Box maxW="2xl">
              <HStack mb={2}>
                <Heading size="xl" color="gray.800" letterSpacing="tight">
                  Hola, <Box as="span" color="blue.600">{user?.name?.split(' ')[0]}</Box> 👋
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.500">Bienvenido a tu panel de control.</Text>
            </Box>
            <Button size="lg" colorScheme="blue" bg="blue.600" _hover={{ bg: "blue.700" }} color="white" borderRadius="full" px={6} shadow="md" onClick={onOpen}>
              <Icon as={FaPlus} mr={2} /> Publicar Servicio
            </Button>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <StatCard icon={FaCoins} label="Mis Créditos" value="100" color="yellow" />
            <StatCard icon={FaExchangeAlt} label="Intercambios" value="0" color="purple" />
            <StatCard icon={FaStar} label="Reputación" value="Nueva" color="green" />
          </SimpleGrid>
        </Container>
      </Box>

      {/* ÁREA DE SERVICIOS - ¡LÓGICA DINÁMICA! */}
      <Container maxW="container.xl" py={10}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="gray.700">Explorar Mercado</Heading>
        </Flex>

        {/* CASO 1: CARGANDO */}
        {isLoading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Flex>
        ) : services.length > 0 ? (
          // CASO 2: HAY DATOS -> Mostramos la cuadrícula
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {services.map((service) => (
              <ServiceCard 
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                category={service.category}
                owner={service.owner}
              />
            ))}
          </SimpleGrid>
        ) : (
          // CASO 3: NO HAY DATOS -> Mostramos el Empty State (Caja vacía)
          <Flex direction="column" align="center" justify="center" py={16} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.300" textAlign="center">
            <Box bg="blue.50" p={6} borderRadius="full" mb={4} color="blue.500">
              <Icon as={FaBoxOpen} boxSize={10} />
            </Box>
            <Heading size="md" color="gray.800" mb={2}>No hay servicios disponibles</Heading>
            <Text color="gray.500" maxW="md" mb={6}>¡Sé el primero en publicar!</Text>
            <Button variant="outline" borderColor="blue.200" color="blue.600" size="sm" onClick={onOpen}>
              Crear primera publicación
            </Button>
          </Flex>
        )}
      </Container>
    </Box>
  );
};