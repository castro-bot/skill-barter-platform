// frontend/src/pages/TradesPage.tsx
import { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel,
  Card, CardBody, Text, Badge, Button, HStack, StackDivider,
  Spinner, Alert, AlertIcon, useToast
  // 1. CORRECCIÓN: Eliminamos 'VStack' de aquí porque no se usaba
} from '@chakra-ui/react';
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
      console.log('Mis trueques:', data);
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
      // 2. CORRECCIÓN: Usamos la variable 'error' imprimiéndola en consola
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
      default: return 'yellow';
    }
  };

  const TradeCard = ({ trade, isIncoming }: { trade: Trade, isIncoming: boolean }) => (
    <Card variant="outline" mb={4} borderColor={trade.status === 'PENDING' ? 'blue.200' : 'gray.200'}>
      <CardBody>
        <HStack justify="space-between" align="start" mb={2}>
          <Badge colorScheme={getStatusColor(trade.status)} fontSize="0.8em">
            {trade.status}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            {new Date(trade.createdAt).toLocaleDateString()}
          </Text>
        </HStack>

        <HStack spacing={4} divider={<StackDivider borderColor="gray.200" />} py={2}>
          <Box flex={1}>
            <Text fontSize="xs" color="gray.500" mb={1}>
              {isIncoming ? 'Te ofrecen:' : 'Tú ofreces:'}
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {trade.proposerService?.title || "Servicio eliminado"}
            </Text>
            <Text fontSize="sm">
              de {trade.proposer?.name}
            </Text>
          </Box>

          <Box flex={1}>
            <Text fontSize="xs" color="gray.500" mb={1}>
              {isIncoming ? 'A cambio de tu:' : 'Por su:'}
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {trade.receiverService?.title || "Servicio eliminado"}
            </Text>
            <Text fontSize="sm">
              {isIncoming ? 'Tu servicio' : `de ${trade.receiver?.name}`}
            </Text>
          </Box>
        </HStack>

        {trade.note && (
          <Box bg="gray.50" p={3} borderRadius="md" my={3} fontSize="sm" fontStyle="italic">
            "{trade.note}"
          </Box>
        )}

        {isIncoming && trade.status === 'PENDING' && (
          <HStack mt={4} justify="end">
            <Button 
              size="sm" 
              colorScheme="red" 
              variant="ghost"
              isLoading={processingId === trade.id}
              onClick={() => handleRespond(trade.id, 'reject')}
            >
              Rechazar
            </Button>
            <Button 
              size="sm" 
              colorScheme="green"
              isLoading={processingId === trade.id}
              onClick={() => handleRespond(trade.id, 'accept')}
            >
              Aceptar Trueque
            </Button>
          </HStack>
        )}
      </CardBody>
    </Card>
  );

  if (isLoading) return <Box p={10} textAlign="center"><Spinner size="xl" /></Box>;

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.md">
        <Heading mb={6} size="lg">Mis Trueques</Heading>
        
        <Tabs isFitted variant="enclosed" bg="white" p={4} borderRadius="lg" shadow="sm">
          <TabList mb="1em">
            <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Recibidos (Inbox)</Tab>
            <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Enviados</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {trades.incoming?.length > 0 ? (
                trades.incoming.map(t => <TradeCard key={t.id} trade={t} isIncoming={true} />)
              ) : (
                <Alert status="info"><AlertIcon />No tienes solicitudes pendientes.</Alert>
              )}
            </TabPanel>

            <TabPanel>
              {trades.outgoing?.length > 0 ? (
                trades.outgoing.map(t => <TradeCard key={t.id} trade={t} isIncoming={false} />)
              ) : (
                <Alert status="info"><AlertIcon />No has enviado propuestas aún.</Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};