import {
  Box,
  Badge,
  Heading,
  Text,
  Button,
  HStack,
  Icon,
  Spacer,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
  useColorModeValue
} from "@chakra-ui/react"
import { useRef, useState } from "react"
import { FaTrash, FaEdit, FaTag } from "react-icons/fa"
import type { ServiceListing } from "../../api/services"
import { servicesApi } from "../../api/services"
import { EditServiceModal } from "./EditServiceModal"
import { getApiErrorMessage } from "../../utils/error"

interface Props {
  service: ServiceListing
  onChanged: () => void
}

export const MyServiceCard = ({ service, onChanged }: Props) => {
  const cardBg = useColorModeValue("surface", "surface")
  const borderTone = useColorModeValue("gray.100", "whiteAlpha.200")
  const textMuted = useColorModeValue("gray.600", "gray.400")
  const subtleText = useColorModeValue("gray.400", "gray.500")
  const titleColor = useColorModeValue("gray.800", "gray.100")

  const edit = useDisclosure()
  const del = useDisclosure()

  const cancelRef = useRef<HTMLButtonElement | null>(null)

  const toast = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await servicesApi.remove(service.id)

      toast({
        title: "Servicio eliminado",
        description: "Tu publicación fue eliminada correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      })

      del.onClose()
      onChanged()
    } catch (error) {
      console.error(error)
      toast({
        title: "No se pudo eliminar",
        description: getApiErrorMessage(error, "Verifica permisos (403) o tu sesión."),
        status: "error",
        duration: 3500,
        isClosable: true,
        position: "top"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Box
      position="relative"
      bg={cardBg}
      borderRadius="2xl"
      shadow="sm"
      border="1px solid"
      borderColor={borderTone}
      p={5}
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", shadow: "md", borderColor: "brand.200" }}
    >
      <HStack mb={2} color="gray.500">
        <Icon as={FaTag} boxSize={3} />
        <Badge colorScheme="brand" variant="subtle" borderRadius="full">
          {service.category}
        </Badge>
        <Spacer />
        <Text fontSize="xs" color={subtleText}>
          {new Date(service.createdAt).toLocaleDateString()}
        </Text>
      </HStack>

      <Heading size="md" color={titleColor} noOfLines={2}>
        {service.title}
      </Heading>

      <Text mt={2} color={textMuted} fontSize="sm" noOfLines={3}>
        {service.description}
      </Text>

      <HStack mt={5} spacing={3}>
        <Button
          leftIcon={<FaEdit />}
          colorScheme="brand"
          variant="outline"
          borderRadius="xl"
          size="sm"
          onClick={edit.onOpen}
        >
          Editar
        </Button>

        <Button
          leftIcon={<FaTrash />}
          colorScheme="red"
          variant="outline"
          borderRadius="xl"
          size="sm"
          onClick={del.onOpen}
        >
          Eliminar
        </Button>
      </HStack>

      <EditServiceModal
        isOpen={edit.isOpen}
        onClose={edit.onClose}
        service={service}
        onSuccess={onChanged}
      />

      <AlertDialog
        isOpen={del.isOpen}
        leastDestructiveRef={cancelRef as unknown as React.RefObject<HTMLElement>}
        onClose={del.onClose}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Eliminar servicio
          </AlertDialogHeader>

          <AlertDialogBody>
            ¿Seguro que deseas eliminar <b>{service.title}</b>? Esta acción no se puede deshacer.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={del.onClose} borderRadius="lg">
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              ml={3}
              isLoading={isDeleting}
              loadingText="Eliminando"
              borderRadius="lg"
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  )
}
