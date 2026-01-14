// frontend/src/pages/TradesPage.tsx
import { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel,
  Card, CardBody, Text, Badge, Button, HStack, Flex, Avatar, Icon,
  Spinner, Alert, AlertIcon, useToast
} from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa'; // Icono de intercambio
import { tradesApi, type Trade, type TradesResponse } from '../api/trades';

export const TradesPage = () => {
  const toast = useToast();
  const [trades, setTrades] = useState<TradesResponse>({ incoming: [], outgoing: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTrades = async () => {
    setIsLoading(true);
    try {
      const data = await tradesApi.getAll();
      setTrades(data);
    } catch (error) {
      console.error('Error cargando trueques', error);
      toast({ title: 'Error cargando trueques', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleRespond = async (tradeId: string, action: 'accept' | 'reject') => {
    setProcessingId(tradeId);
    try {
      await tradesApi.respond(tradeId, action);
      toast({
        title: action === 'accept' ? '¡Trueque Aceptado!' : 'Trueque Rechazado',
        status: action === 'accept' ? 'success' : 'info',
      });
      fetchTrades();
    } catch (error) {
      console.error("Error respondiendo al trueque:", error);
      toast({ title: 'Error al procesar la acción', status: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'green';
      case 'REJECTED': return 'red';
      case 'COMPLETED': return 'purple';
      default: return 'blue'; // Pending
    }
  };

  // --- COMPONENTE VISUAL: Tarjeta de Trueque Premium ---
  const TradeCard = ({ trade, isIncoming }: { trade: Trade, isIncoming: boolean }) => (
    <Card 
      mb={6} 
      overflow="hidden" 
      variant="outline" 
      borderColor={trade.status === 'PENDING' ? 'blue.300' : 'gray.200'}
      boxShadow={trade.status === 'PENDING' ? 'md' : 'sm'}
      borderRadius="xl"
      borderWidth={trade.status === 'PENDING' ? '2px' : '1px'}
      transition="all 0.2s"
      _hover={{ shadow: 'lg' }}
    >
      <CardBody p={0}>
        {/* CABECERA DE LA TARJETA */}
        <Flex 
          bg={trade.status === 'PENDING' ? 'blue.50' : 'gray.50'} 
          p={4} 
          justify="space-between" 
          align="center"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Badge 
            colorScheme={getStatusColor(trade.status)} 
            px={3} py={1} 
            borderRadius="md"
            fontSize="xs"
            fontWeight="bold"
          >
            {trade.status === 'PENDING' ? 'PENDIENTE DE RESPUESTA' : trade.status}
          </Badge>
          <Text fontSize="xs" fontWeight="bold" color="gray.500">
            {new Date(trade.createdAt).toLocaleDateString()}
          </Text>
        </Flex>

        {/* CUERPO DEL INTERCAMBIO */}
        <Flex direction={{ base: 'column', md: 'row' }} p={6} align="center" gap={6}>
          
          {/* LADO IZQUIERDO: Origen */}
          <Box flex={1} textAlign={{ base: 'center', md: 'left' }} w="full">
            <Text fontSize="xx-small" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2} letterSpacing="wider">
              {isIncoming ? 'TE OFRECEN' : 'TÚ OFRECES'}
            </Text>
            
            <Heading size="md" color="blue.600" mb={2}>
              {trade.proposerService?.title || "Servicio no disponible"}
            </Heading>
            
            <HStack justify={{ base: 'center', md: 'start' }} spacing={3}>
              <Avatar size="xs" name={trade.proposer?.name} />
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                {trade.proposer?.name}
              </Text>
            </HStack>
          </Box>

          {/* CENTRO: Icono de Intercambio */}
          <Flex 
            bg="gray.100" 
            w={12} h={12} 
            borderRadius="full" 
            align="center" justify="center"
            color="gray.500"
            shrink={0}
          >
            <Icon as={FaExchangeAlt} />
          </Flex>

          {/* LADO DERECHO: Destino */}
          <Box flex={1} textAlign={{ base: 'center', md: 'right' }} w="full">
             <Flex direction="column" align={{ base: 'center', md: 'flex-end' }}>
              <Text fontSize="xx-small" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2} letterSpacing="wider">
                {isIncoming ? 'A CAMBIO DE TU' : 'POR SU'}
              </Text>
              
              <Heading size="md" color="purple.600" mb={2}>
                {trade.receiverService?.title || "Servicio no disponible"}
              </Heading>
              
              <HStack spacing={3}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {isIncoming ? 'Tu servicio' : trade.receiver?.name}
                </Text>
                {!isIncoming && <Avatar size="xs" name={trade.receiver?.name} />}
              </HStack>
            </Flex>
          </Box>
        </Flex>

        {/* PIE DE TARJETA: Notas y Botones */}
        <Box px={6} pb={6}>
          {trade.note && (
            <Box bg="yellow.50" p={4} borderRadius="lg" mb={4} borderLeft="4px solid" borderColor="yellow.400">
              <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={1}>NOTA:</Text>
              <Text fontSize="sm" fontStyle="italic" color="gray.700">"{trade.note}"</Text>
            </Box>
          )}

          {/* BOTONES (Solo visibles si es Incoming y Pending) */}
          {isIncoming && trade.status === 'PENDING' && (
            <Flex gap={3} mt={4} justify={{ base: 'stretch', md: 'flex-end' }}>
              <Button 
                flex={{ base: 1, md: 'none' }}
                colorScheme="red" 
                variant="ghost"
                size="sm"
                isLoading={processingId === trade.id}
                onClick={() => handleRespond(trade.id, 'reject')}
              >
                Rechazar
              </Button>
              <Button 
                flex={{ base: 1, md: 'none' }}
                colorScheme="green"
                shadow="md"
                size="sm"
                isLoading={processingId === trade.id}
                onClick={() => handleRespond(trade.id, 'accept')}
              >
                Aceptar Trueque
              </Button>
            </Flex>
          )}
          
          {/* Mensaje de estado final */}
          {trade.status === 'ACCEPTED' && (
            <Flex justify={{ base: 'center', md: 'flex-end' }}>
               <Badge colorScheme="green" variant="solid" px={3} py={1} borderRadius="full">
                  ✅ ¡Trueque Aceptado!
               </Badge>
            </Flex>
          )}
        </Box>
      </CardBody>
    </Card>
  );

  // --- RENDER PRINCIPAL ---
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
         <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.md">
        <Heading mb={8} size="xl" color="gray.700" letterSpacing="tight">
          Mis Trueques
        </Heading>
        
        <Tabs isFitted variant="soft-rounded" colorScheme="blue">
          <TabList mb={6} bg="white" p={1} borderRadius="full" shadow="sm">
            <Tab borderRadius="full" fontWeight="bold">Recibidos (Inbox)</Tab>
            <Tab borderRadius="full" fontWeight="bold">Enviados</Tab>
          </TabList>

          <TabPanels>
            {/* PANEL 1: RECIBIDOS */}
            <TabPanel px={0}>
              {trades.incoming?.length > 0 ? (
                trades.incoming.map(t => <TradeCard key={t.id} trade={t} isIncoming={true} />)
              ) : (
                <Alert status="info" borderRadius="xl" variant="subtle" flexDirection="column" alignItems="center" justifyItems="center" textAlign="center" height="200px" justifyContent="center">
                  <AlertIcon boxSize="40px" mr={0} />
                  <Heading size="md" mt={4} mb={1}>Sin solicitudes</Heading>
                  <Text maxW="sm">Nadie te ha propuesto un trueque todavía. ¡Mejora tus servicios para atraer más gente!</Text>
                </Alert>
              )}
            </TabPanel>

            {/* PANEL 2: ENVIADOS */}
            <TabPanel px={0}>
              {trades.outgoing?.length > 0 ? (
                trades.outgoing.map(t => <TradeCard key={t.id} trade={t} isIncoming={false} />)
              ) : (
                <Alert status="info" borderRadius="xl" variant="subtle" flexDirection="column" alignItems="center" justifyItems="center" textAlign="center" height="200px" justifyContent="center">
                  <AlertIcon boxSize="40px" mr={0} />
                  <Heading size="md" mt={4} mb={1}>No has ofertado</Heading>
                  <Text maxW="sm">Explora el mercado y propón intercambios a los servicios que te interesen.</Text>
                </Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};