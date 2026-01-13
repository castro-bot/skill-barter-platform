// frontend/src/components/trades/CreateTradeModal.tsx
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, FormControl, FormLabel, Select, Textarea, Text, VStack, useToast, Box
  // Quité 'Badge' de aquí porque no lo estábamos usando
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { servicesApi, type ServiceListing } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  requestedServiceTitle: string;
  requestedServiceId: string;
  ownerName: string;
}

export const CreateTradeModal = ({ isOpen, onClose, requestedServiceTitle, requestedServiceId, ownerName }: Props) => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [myServices, setMyServices] = useState<ServiceListing[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Cargar MIS servicios cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      const fetchMyServices = async () => {
        try {
          const allServices = await servicesApi.getAll(); 
          const mine = allServices.filter(s => s.owner.id === user.id);
          setMyServices(mine);
        } catch (error) {
          // CORRECCIÓN: Ahora usamos la variable 'error' imprimiéndola en consola
          console.error("Error cargando mis servicios:", error);
        }
      };
      fetchMyServices();
    }
  }, [isOpen, user]);

  // 2. Enviar el Trueque
  const handlePropose = async () => {
    if (!selectedServiceId) {
      toast({ title: 'Selecciona un servicio para ofrecer', status: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      // AQUÍ CONECTAREMOS CON LA API DE TRUEQUES LUEGO
      console.log("Enviando propuesta:", {
        offeredServiceId: selectedServiceId,
        requestedServiceId: requestedServiceId,
        note
      });

      // Simulación de éxito
      setTimeout(() => {
        toast({ title: '¡Oferta enviada con éxito!', status: 'success' });
        onClose();
      }, 1000);

    } catch (error) {
      // CORRECCIÓN: Usamos la variable 'error'
      console.error("Falló la propuesta:", error);
      toast({ title: 'Error al enviar oferta', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Proponer Intercambio</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            
            {/* Resumen del intercambio */}
            <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.100">
              <Text fontSize="sm" color="blue.700">
                Estás solicitando: <strong>{requestedServiceTitle}</strong>
              </Text>
              <Text fontSize="xs" color="blue.500">
                Propietario: {ownerName}
              </Text>
            </Box>

            <FormControl isRequired>
              <FormLabel>¿Qué ofreces a cambio?</FormLabel>
              {myServices.length > 0 ? (
                <Select 
                  placeholder="Selecciona uno de tus servicios..."
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                >
                  {myServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title} ({service.category})
                    </option>
                  ))}
                </Select>
              ) : (
                <Box textAlign="center" py={2}>
                  <Text fontSize="sm" color="red.500">No tienes servicios publicados.</Text>
                  <Button size="xs" colorScheme="blue" mt={2} onClick={onClose}>Ir a crear uno</Button>
                </Box>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Nota para {ownerName} (Opcional)</FormLabel>
              <Textarea 
                placeholder="Hola, me interesa tu servicio porque..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormControl>

          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
          <Button 
            colorScheme="blue" 
            onClick={handlePropose}
            isLoading={isLoading}
            isDisabled={!selectedServiceId}
          >
            Enviar Oferta
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};