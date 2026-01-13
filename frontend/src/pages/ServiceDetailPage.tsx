// frontend/src/pages/ServiceDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Badge, Button, Flex, 
  Avatar, HStack, Card, CardBody, Icon, Spinner, Tag, useDisclosure 
  // ^^^ CORRECCIÓN: Importamos Card y CardBody por separado
} from '@chakra-ui/react';
import { FaArrowLeft, FaExchangeAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { servicesApi, type ServiceListing } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { CreateTradeModal } from '../components/trades/CreateTradeModal';

export const ServiceDetailPage = () => {
  const { id } = useParams(); 
  const { user } = useAuth(); 
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [service, setService] = useState<ServiceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      try {
        const data = await servicesApi.getById(id);
        setService(data);
      } catch (error) {
        console.error("No se encontró el servicio", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (isLoading) return <Flex justify="center" p={20}><Spinner size="xl" color="blue.500" /></Flex>;
  if (!service) return <Text textAlign="center" mt={10}>Servicio no encontrado</Text>;

  const isMyService = user?.id === service.owner.id;

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.md">
        
        {/* Modal (Invisible hasta que se activa) */}
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

        {/* CORRECCIÓN: Usamos Card directamente, sin .Root */}
        <Card size="lg" shadow="lg" bg="white" borderRadius="2xl" overflow="hidden">
          {/* CORRECCIÓN: Usamos CardBody importado */}
          <CardBody p={{ base: 6, md: 8 }}>
            
            <HStack mb={4} justify="space-between">
              <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                {service.category}
              </Badge>
              <Text fontSize="sm" color="gray.500">Oferta</Text>
            </HStack>

            <Heading size="2xl" mb={6} color="gray.800" lineHeight="tight">{service.title}</Heading>

            <Text fontSize="lg" color="gray.600" lineHeight="tall" mb={8}>
              {service.description}
            </Text>

            <Flex gap={3} mb={8} wrap="wrap">
              <Tag size="lg" colorScheme="gray" borderRadius="full" px={4}>
                <Icon as={FaClock} mr={2} /> Disponibilidad: Consultar
              </Tag>
              <Tag size="lg" colorScheme="green" borderRadius="full" px={4}>
                <Icon as={FaMapMarkerAlt} mr={2} /> Online / Presencial
              </Tag>
            </Flex>

            <Box borderTop="1px solid" borderColor="gray.100" my={6} />

            <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={6}>
              <HStack>
                <Avatar size="md" name={service.owner.name} />
                <Box>
                  <Text fontWeight="bold" fontSize="md">{service.owner.name}</Text>
                  <Text fontSize="sm" color="gray.500">Dueño del Servicio</Text>
                </Box>
              </HStack>

              {isMyService ? (
                <Button colorScheme="gray" isDisabled w={{ base: "full", md: "auto" }}>
                  Es tu servicio
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  colorScheme="blue" 
                  leftIcon={<Icon as={FaExchangeAlt} />}
                  bg="blue.600" 
                  _hover={{ bg: 'blue.700' }}
                  color="white"
                  shadow="md"
                  w={{ base: "full", md: "auto" }}
                  onClick={onOpen} 
                >
                  Proponer Trueque
                </Button>
              )}
            </Flex>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};