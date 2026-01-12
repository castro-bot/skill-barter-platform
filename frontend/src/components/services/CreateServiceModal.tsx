// frontend/src/components/services/CreateServiceModal.tsx
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, Select, VStack, useToast 
} from '@chakra-ui/react';
import { useState } from 'react';
import { servicesApi } from '../../api/services'; // Asegúrate que esta ruta sea correcta

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Para recargar la lista cuando creemos uno
}

export const CreateServiceModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tecnología' // Valor por defecto
  });

  const handleSubmit = async () => {
    // 1. Validaciones simples
    if (!formData.title || !formData.description) {
      toast({ title: 'Faltan datos', status: 'warning', duration: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      // 2. Llamada a la API REAL
      await servicesApi.create(formData);

      toast({ title: '¡Servicio Publicado!', status: 'success', duration: 3000 });
      
      // 3. Limpiar y cerrar
      setFormData({ title: '', description: '', category: 'Tecnología' });
      if (onSuccess) onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      toast({ title: 'Error al publicar', description: 'Inténtalo de nuevo', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Publicar Nuevo Servicio</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack gap={4}>
            <FormControl isRequired>
              <FormLabel>Título del Servicio</FormLabel>
              <Input 
                placeholder="Ej. Clases de Matemáticas Avanzadas" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Categoría</FormLabel>
              <Select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Tecnología">Tecnología</option>
                <option value="Idiomas">Idiomas</option>
                <option value="Asesoría">Asesoría</option>
                <option value="Diseño">Diseño</option>
                <option value="Otros">Otros</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Descripción</FormLabel>
              <Textarea 
                placeholder="Describe detalladamente qué ofreces..." 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit} 
            isLoading={isLoading}
          >
            Publicar Ahora
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};