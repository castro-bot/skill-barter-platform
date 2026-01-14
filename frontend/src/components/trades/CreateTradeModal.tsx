// frontend/src/components/trades/CreateTradeModal.tsx
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Box
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { servicesApi, type ServiceListing } from '../../api/services';
import { tradesApi } from '../../api/trades';
import { useAuth } from '../../context/AuthContext'; // <--- IMPORTANTE: Importamos Auth

interface Props {
  isOpen: boolean;
  onClose: () => void;
  requestedServiceId: string;
  requestedServiceTitle: string;
  ownerName: string;
}

export const CreateTradeModal = ({
  isOpen,
  onClose,
  requestedServiceId,
  requestedServiceTitle,
  ownerName,
}: Props) => {
  const { user } = useAuth(); // <--- Obtenemos el usuario actual
  const toast = useToast();
  const navigate = useNavigate();
  
  const [myServices, setMyServices] = useState<ServiceListing[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchMyServices();
      setSelectedServiceId('');
      setNote('');
    }
  }, [isOpen, user]);

  const fetchMyServices = async () => {
    setIsLoadingServices(true);
    try {
      // CORRECCIÓN CLAVE:
      // En lugar de llamar al endpoint que falla (/my-services),
      // traemos todos los servicios (que sabemos que funciona) y filtramos.
      const allServices = await servicesApi.getAll();
      
      // Filtramos solo los que pertenecen al usuario logueado (axel2)
      const mine = allServices.filter(service => service.owner.id === user?.id);
      
      setMyServices(mine);
    } catch (error) {
      console.error('Error cargando mis servicios', error);
      toast({
        title: 'Error de conexión',
        description: 'No pudimos cargar tus servicios. Intenta nuevamente.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedServiceId) {
      toast({
        title: 'Falta información',
        description: 'Debes seleccionar qué servicio ofreces a cambio.',
        status: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Enviamos los datos con los nombres correctos para el backend
      await tradesApi.create({
        proposerServiceId: selectedServiceId,
        receiverServiceId: requestedServiceId,
        note: note.trim(),
      });

      toast({
        title: '¡Propuesta enviada!',
        description: `Tu oferta ha sido notificada a ${ownerName}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose(); 
    } catch (error) {
      console.error('Error creando trade', error);
      
      let errorMsg = 'Hubo un problema procesando tu solicitud.';
      
      // ✅ VERIFICACIÓN DE TIPO SEGURA (Sin usar any)
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      toast({
        title: 'Error al enviar',
        description: errorMsg,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoadingServices) {
      return (
        <VStack py={8} spacing={4}>
          <Spinner size="xl" color="blue.500" thickness='4px' />
          <Text color="gray.500">Buscando tus servicios disponibles...</Text>
        </VStack>
      );
    }

    if (myServices.length === 0) {
      return (
        <VStack spacing={4} py={4} align="stretch">
          <Alert status="warning" borderRadius="md" variant="subtle">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">No tienes servicios para intercambiar</Text>
              <Text fontSize="sm">
                El trueque requiere dar algo a cambio. ¡Publica tu primer servicio!
              </Text>
            </Box>
          </Alert>
          <Button 
            colorScheme="green" 
            onClick={() => {
              onClose();
              navigate('/services/new');
            }}
          >
            Publicar un Servicio Ahora
          </Button>
        </VStack>
      );
    }

    return (
      <VStack spacing={5} align="stretch">
        <Box bg="blue.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
          <Text fontSize="sm" color="blue.800">
            Estás solicitando: <strong>{requestedServiceTitle}</strong>
          </Text>
          <Text fontSize="xs" color="blue.600">
            Propietario: {ownerName}
          </Text>
        </Box>

        <FormControl isRequired>
          <FormLabel>¿Qué ofreces a cambio?</FormLabel>
          <Select 
            placeholder="Selecciona uno de tus servicios..."
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            focusBorderColor="blue.500"
          >
            {myServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} ({service.category})
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Nota o Mensaje (Opcional)</FormLabel>
          <Textarea 
            placeholder={`Hola ${ownerName}, me interesa tu servicio porque...`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            resize="none"
            rows={3}
          />
        </FormControl>
      </VStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px">Proponer Intercambio</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          {renderContent()}
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          
          {myServices.length > 0 && !isLoadingServices && (
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Enviando..."
              isDisabled={!selectedServiceId}
            >
              Enviar Propuesta
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};