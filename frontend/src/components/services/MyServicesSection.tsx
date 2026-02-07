import { useEffect, useState } from "react"
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Spinner,
  Button,
  Icon,
  useColorModeValue,
  useToast
} from "@chakra-ui/react"
import { FaBoxOpen, FaSyncAlt } from "react-icons/fa"
import { servicesApi, type ServiceListing } from "../../api/services"
import { MyServiceCard } from "./MyServiceCard"
import { getApiErrorMessage } from "../../utils/error"

export const MyServicesSection = () => {
  const toast = useToast()
  const emptyBg = useColorModeValue("surface", "surface")
  const emptyBorder = useColorModeValue("gray.200", "whiteAlpha.200")
  const emptyText = useColorModeValue("gray.500", "gray.400")
  const iconBg = useColorModeValue("sand.100", "whiteAlpha.100")
  const titleColor = useColorModeValue("gray.700", "gray.100")
  const [myServices, setMyServices] = useState<ServiceListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadMine = async () => {
    setIsLoading(true)
    try {
      const data = await servicesApi.getMine()
      setMyServices(data)
    } catch (error) {
      console.error("Error cargando mis servicios:", error)
      toast({
        title: "No se pudieron cargar tus servicios",
        description: getApiErrorMessage(error, "Verifica tu sesión o intenta nuevamente."),
        status: "error",
        duration: 3500,
        isClosable: true,
        position: "top"
      })
      setMyServices([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMine()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box mt={14}>
      <Flex justify="space-between" align="center" mb={6} gap={4} wrap="wrap">
        <Box>
          <Heading size="lg" color={titleColor} letterSpacing="tight">
            Mis Servicios
          </Heading>
          <Text color={emptyText} fontSize="sm" mt={1}>
            Gestiona tus publicaciones: editar y eliminar.
          </Text>
        </Box>

        <Button
          leftIcon={<FaSyncAlt />}
          variant="outline"
          borderRadius="xl"
          onClick={loadMine}
          isLoading={isLoading}
        >
          Refrescar
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" py={14} direction="column" align="center" gap={3}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color={emptyText} fontSize="sm">
            Cargando tus servicios...
          </Text>
        </Flex>
      ) : myServices.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} pb={2}>
          {myServices.map((service) => (
            <MyServiceCard key={service.id} service={service} onChanged={loadMine} />
          ))}
        </SimpleGrid>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={16}
          bg={emptyBg}
          borderRadius="3xl"
          border="2px dashed"
          borderColor={emptyBorder}
          textAlign="center"
        >
          <Flex
            bg={iconBg}
            w={20}
            h={20}
            borderRadius="full"
            align="center"
            justify="center"
            mb={6}
            color="sand.600"
          >
            <Icon as={FaBoxOpen} boxSize={8} />
          </Flex>

          <Heading size="md" color="gray.800" mb={2}>
            Aún no has publicado servicios
          </Heading>
          <Text color={emptyText} maxW="md">
            Publica un servicio desde el botón “Publicar Servicio” para que aparezca aquí.
          </Text>
        </Flex>
      )}
    </Box>
  )
}
