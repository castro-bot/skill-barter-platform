// frontend/src/components/services/CreateServiceModal.tsx
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, Select, VStack, useToast, 
  InputGroup, InputLeftElement, Icon, Box, Text
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaHeading, FaTag, FaAlignLeft, FaMagic } from 'react-icons/fa';
import { servicesApi } from '../../api/services';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateServiceModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tecnología'
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast({ 
        title: 'Faltan datos', 
        description: 'Por favor completa el título y la descripción.',
        status: 'warning', 
        duration: 3000,
        position: 'top' 
      });
      return;
    }

    setIsLoading(true);
    try {
      await servicesApi.create(formData);

      toast({ 
        title: '¡Servicio Publicado!', 
        description: 'Tu habilidad ya está visible en el mercado.',
        status: 'success', 
        duration: 4000,
        isClosable: true,
        position: 'top'
      });
      
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered motionPreset="slideInBottom">
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" shadow="2xl">
        
        {/* CABECERA CON GRADIENTE */}
        <ModalHeader 
          bgGradient="linear(to-r, blue.600, purple.600)" 
          color="white" 
          py={6}
        >
          <Box display="flex" alignItems="center" gap={3}>
            <Box bg="whiteAlpha.200" p={2} borderRadius="lg">
              <Icon as={FaMagic} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="bold">Publicar Nuevo Servicio</Text>
              <Text fontSize="xs" fontWeight="normal" opacity={0.9}>
                Ofrece tus habilidades a la comunidad
              </Text>
            </Box>
          </Box>
        </ModalHeader>
        
        <ModalCloseButton color="white" mt={2} _hover={{ bg: 'whiteAlpha.200' }} />
        
        <ModalBody py={6} px={6}>
          <VStack spacing={5}>
            
            {/* TÍTULO */}
            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Título del Servicio</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <Icon as={FaHeading} />
                </InputLeftElement>
                <Input 
                  placeholder="Ej. Clases de Matemáticas Avanzadas" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  focusBorderColor="blue.500"
                  borderRadius="lg"
                  bg="gray.50"
                  _focus={{ bg: 'white' }}
                />
              </InputGroup>
            </FormControl>

            {/* CATEGORÍA */}
            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Categoría</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <Icon as={FaTag} />
                </InputLeftElement>
                <Select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  focusBorderColor="blue.500"
                  borderRadius="lg"
                  pl={10} // Espacio extra para el icono
                  bg="gray.50"
                  _focus={{ bg: 'white' }}
                >
                  <option value="Tecnología">Tecnología</option>
                  <option value="Idiomas">Idiomas</option>
                  <option value="Asesoría">Asesoría</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Otros">Otros</option>
                </Select>
              </InputGroup>
            </FormControl>

            {/* DESCRIPCIÓN */}
            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Descripción Detallada</FormLabel>
              <Box position="relative">
                <Box position="absolute" top={3} left={4} zIndex={2} color="gray.400">
                   <Icon as={FaAlignLeft} />
                </Box>
                <Textarea 
                  placeholder="Explica qué incluye tu servicio, horarios disponibles, o qué buscas a cambio..." 
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  focusBorderColor="blue.500"
                  borderRadius="lg"
                  pl={10} // Espacio para el icono simulado
                  pt={2.5}
                  bg="gray.50"
                  _focus={{ bg: 'white' }}
                  resize="none"
                />
              </Box>
              <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
                Sé claro y conciso para atraer más ofertas.
              </Text>
            </FormControl>

          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50" py={4}>
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={onClose}
            borderRadius="lg"
            color="gray.500"
          >
            Cancelar
          </Button>
          <Button 
            colorScheme="blue" 
            bgGradient="linear(to-r, blue.500, blue.600)"
            _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "md" }}
            onClick={handleSubmit} 
            isLoading={isLoading}
            loadingText="Publicando"
            borderRadius="lg"
            px={8}
            shadow="sm"
          >
            Publicar Ahora
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};