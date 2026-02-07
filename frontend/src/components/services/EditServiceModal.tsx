// frontend/src/components/services/EditServiceModal.tsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
  InputGroup,
  InputLeftElement,
  Icon,
  Box,
  Text
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaHeading, FaTag, FaAlignLeft, FaPencilAlt } from "react-icons/fa"
import { servicesApi, type ServiceListing } from "../../api/services"
import { getApiErrorMessage } from "../../utils/error"

interface Props {
  isOpen: boolean
  onClose: () => void
  service: ServiceListing | null
  onSuccess?: () => void
}

export const EditServiceModal = ({ isOpen, onClose, service, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Tecnología"
  })

  // Precarga robusta
  useEffect(() => {
    if (!service) return
    setFormData({
      title: service.title ?? "",
      description: service.description ?? "",
      category: service.category ?? "Tecnología"
    })
  }, [service])

  const handleSubmit = async () => {
    if (!service) return

    if (!formData.title || !formData.description) {
      toast({
        title: "Faltan datos",
        description: "Por favor completa el título y la descripción.",
        status: "warning",
        duration: 3000,
        position: "top"
      })
      return
    }

    setIsLoading(true)
    try {
      await servicesApi.update(service.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category
      })

      toast({
        title: "Servicio actualizado",
        description: "Los cambios se guardaron correctamente.",
        status: "success",
        duration: 3500,
        isClosable: true,
        position: "top"
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error al actualizar",
        description: getApiErrorMessage(error, "Verifica tu sesión o intenta nuevamente."),
        status: "error",
        duration: 3500,
        isClosable: true,
        position: "top"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered motionPreset="slideInBottom">
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" shadow="2xl">
        <ModalHeader bgGradient="linear(to-r, purple.600, blue.600)" color="white" py={6}>
          <Box display="flex" alignItems="center" gap={3}>
            <Box bg="whiteAlpha.200" p={2} borderRadius="lg">
              <Icon as={FaPencilAlt} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                Editar Servicio
              </Text>
              <Text fontSize="xs" fontWeight="normal" opacity={0.9}>
                Actualiza tu publicación
              </Text>
            </Box>
          </Box>
        </ModalHeader>

        <ModalCloseButton color="white" mt={2} _hover={{ bg: "whiteAlpha.200" }} />

        <ModalBody py={6} px={6}>
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                Título del Servicio
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <Icon as={FaHeading} />
                </InputLeftElement>
                <Input
                  placeholder="Ej. Clases de Matemáticas Avanzadas"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  focusBorderColor="blue.500"
                  borderRadius="lg"
                  bg="gray.50"
                  _focus={{ bg: "white" }}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                Categoría
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <Icon as={FaTag} />
                </InputLeftElement>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  focusBorderColor="blue.500"
                  borderRadius="lg"
                  pl={10}
                  bg="gray.50"
                  _focus={{ bg: "white" }}
                >
                  <option value="Tecnología">Tecnología</option>
                  <option value="Idiomas">Idiomas</option>
                  <option value="Asesoría">Asesoría</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Otros">Otros</option>
                </Select>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                Descripción Detallada
              </FormLabel>
              <Box position="relative">
                <Box position="absolute" top={3} left={4} zIndex={2} color="gray.400">
                  <Icon as={FaAlignLeft} />
                </Box>
                <Textarea
                  placeholder="Explica qué incluye tu servicio..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  focusBorderColor="blue.500"
                  borderRadius="lg"
                  pl={10}
                  pt={2.5}
                  bg="gray.50"
                  _focus={{ bg: "white" }}
                  resize="none"
                />
              </Box>
              <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
                Mantén la descripción clara y concreta.
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50" py={4}>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg" color="gray.500">
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            bgGradient="linear(to-r, blue.500, blue.600)"
            _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "md" }}
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Guardando"
            borderRadius="lg"
            px={8}
            shadow="sm"
          >
            Guardar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
