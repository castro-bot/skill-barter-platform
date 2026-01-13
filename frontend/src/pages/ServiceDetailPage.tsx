// frontend/src/pages/ServiceDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Badge, Button, Flex, 
  Avatar, HStack, Card, CardBody, Icon, Spinner, Tag, useDisclosure, Divider 
} from '@chakra-ui/react';
import { FaArrowLeft, FaExchangeAlt } from 'react-icons/fa';
import { servicesApi, type ServiceListing } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { CreateTradeModal } from '../components/trades/CreateTradeModal';

// Definimos un tipo local para parchear los datos que faltan en la interfaz original
// Esto satisface al Linter sin usar 'any'
type ServiceWithExtras = ServiceListing & {
  price?: string;
  owner: {
    avatarUrl?: string;
  };
};

export const ServiceDetailPage = () => {
  const { id } = useParams(); 
  const { user } = useAuth(); 
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [service, setService] = useState<ServiceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.log(`[ServiceDetail] Componente MONTADO. ID Param: ${id}`);
    if (id) console.timeEnd(`Navegación-Servicio-${id}`);
    
    return () => {
      console.log(`[ServiceDetail] Componente DESMONTADO`);
    };
  }, [id]);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        console.warn('[ServiceDetail] ID indefinido, abortando fetch');
        return;
      }

      console.log('[ServiceDetail] Iniciando fetch...');
      setIsLoading(true);
      try {
        const data = await servicesApi.getById(id);
        console.log('[ServiceDetail] Datos recibidos:', data);
        setService(data);
      } catch (error) {
        console.error("[ServiceDetail] Error fetching service:", error);
      } finally {
        setIsLoading(false);
        console.log('[ServiceDetail] Loading finalizado');
      }
    };
    fetchService();
  }, [id]);

  if (isLoading) {
    console.log('[ServiceDetail] Renderizando Spinner');
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (!service) return <Text textAlign="center" mt={10}>Servicio no encontrado</Text>;

  const isMyService = user?.id === service.owner.id;

  // CORRECCIÓN: Casteo seguro usando el tipo extendido definido arriba
  const serviceExtended = service as unknown as ServiceWithExtras;

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.md">
        
        <CreateTradeModal 
          isOpen={isOpen}
          onClose={onClose}
          requestedServiceId={service.id}
          requestedServiceTitle={service.title}
          ownerName={service.owner.name}
        />

        <Button as={Link} to="/services" variant="ghost" mb={6} leftIcon={<Icon as={FaArrowLeft} />}>
          Volver al mercado
        </Button>

        <Card size="lg" shadow="lg" bg="white" borderRadius="2xl" overflow="hidden">
          <CardBody p={{ base: 6, md: 8 }}>
            <HStack mb={4} justify="space-between">
              <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                {service.category}
              </Badge>
              <Tag size="lg" variant="subtle" colorScheme="green">
                {/* Usamos serviceExtended para acceder a price */}
                Valor: {serviceExtended.price || "A convenir"}
              </Tag>
            </HStack>

            <Heading size="2xl" mb={6} color="gray.800" lineHeight="tight">
              {service.title}
            </Heading>

            <Text fontSize="lg" color="gray.600" lineHeight="tall" mb={8}>
              {service.description}
            </Text>

            <Divider my={6} />

            <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'start', sm: 'center' }} gap={4}>
              <HStack spacing={4}>
                <Avatar 
                  size="md" 
                  name={service.owner.name} 
                  // Usamos serviceExtended para acceder a avatarUrl
                  src={serviceExtended.owner.avatarUrl || undefined} 
                />
                <Box>
                  <Text fontWeight="bold" fontSize="md">{service.owner.name}</Text>
                  <Text fontSize="sm" color="gray.500">Propietario</Text>
                </Box>
              </HStack>

              {!isMyService && (
                <Button 
                  size="lg" 
                  colorScheme="blue" 
                  leftIcon={<Icon as={FaExchangeAlt} />}
                  onClick={onOpen}
                  width={{ base: 'full', sm: 'auto' }}
                >
                  Proponer Intercambio
                </Button>
              )}
            </Flex>
            
            <Box pt={4} mt={4} borderTop="1px dashed gray">
                 <Text fontSize="xs" color="gray.400">Debug Info - ID Servicio: {id}</Text>
            </Box>

          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};