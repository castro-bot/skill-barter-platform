// frontend/src/pages/ServiceDetailPage.tsx
import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Avatar,
  HStack,
  Card,
  CardBody,
  Icon,
  Spinner,
  Tag,
  useDisclosure,
  useColorModeValue,
  Divider
} from "@chakra-ui/react"
import { FaArrowLeft, FaExchangeAlt } from "react-icons/fa"
import { servicesApi, type ServiceListing } from "../api/services"
import { useAuth } from "../context/AuthContext"
import { CreateTradeModal } from "../components/trades/CreateTradeModal"
import { StarRating } from "../components/ratings/StarRating"

type ServiceWithExtras = ServiceListing & {
  price?: string
  owner: {
    avatarUrl?: string
    ratingAverage?: number
    ratingCount?: number
  }
}

export const ServiceDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [service, setService] = useState<ServiceListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const titleColor = useColorModeValue("gray.800", "gray.100")
  const textMuted = useColorModeValue("gray.600", "gray.400")
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.200")

  // Timer label estable (solo para DEV)
  const timerLabel = useMemo(() => `Navegación-Servicio-${id ?? "undefined"}`, [id])

  // Logs controlados (solo DEV) + timer seguro
  useEffect(() => {
    if (!import.meta.env.DEV) return

    console.log(`[ServiceDetail] MONTADO. ID Param: ${id}`)

    if (id) {
      try {
        console.time(timerLabel)
      } catch {
        // no-op
      }
    }

    return () => {
      console.log("[ServiceDetail] DESMONTADO")

      if (id) {
        try {
          console.timeEnd(timerLabel)
        } catch {
          // no-op
        }
      }
    }
  }, [id, timerLabel])

  useEffect(() => {
    const fetchService = async () => {
      // Si por algún motivo falta id, no hacemos nada
      if (!id) {
        setIsLoading(false)
        setService(null)
        return
      }

      // Si por error alguien enruta "new" a esta página, lo tratamos como "not found"
      // (la ruta /services/new debe resolverse en otra page/modal, no aquí)
      if (id === "new") {
        if (import.meta.env.DEV) {
          console.warn(
            "[ServiceDetail] WARNING: /services/new está llegando a ServiceDetailPage. Revisa el orden de rutas."
          )
        }
        setIsLoading(false)
        setService(null)
        return
      }

      if (import.meta.env.DEV) console.log("[ServiceDetail] Fetch service...")
      setIsLoading(true)

      try {
        const data = await servicesApi.getById(id)
        if (import.meta.env.DEV) console.log("[ServiceDetail] Datos recibidos:", data)
        setService(data)
      } catch (error) {
        console.error("[ServiceDetail] Error fetching service:", error)
        setService(null)
      } finally {
        setIsLoading(false)
        if (import.meta.env.DEV) console.log("[ServiceDetail] Loading finalizado")
      }
    }

    fetchService()
  }, [id])

  // Loading state
  if (isLoading) {
    if (import.meta.env.DEV) console.log("[ServiceDetail] Renderizando Spinner")
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    )
  }

  // Not found state
  if (!service) {
    return (
      <Container maxW="container.md" py={10}>
        <Card shadow="md" borderRadius="xl" borderColor={cardBorder}>
          <CardBody>
            <Heading size="lg" mb={2} color={titleColor}>
              Servicio no encontrado
            </Heading>
            <Text color={textMuted} mb={6}>
              El servicio que buscas no existe o no está disponible.
            </Text>

            <Button as={Link} to="/services" leftIcon={<Icon as={FaArrowLeft} />}>
              Volver al mercado
            </Button>
          </CardBody>
        </Card>
      </Container>
    )
  }

  const isMyService = user?.id === service.owner.id
  const serviceExtended = service as unknown as ServiceWithExtras

  return (
    <Box bg="transparent" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.md">
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

        <Card size="lg" shadow="lg" bg="surface" borderRadius="2xl" overflow="hidden" borderColor={cardBorder}>
          <CardBody p={{ base: 6, md: 8 }}>
            <HStack mb={4} justify="space-between">
              <Badge colorScheme="brand" px={3} py={1} borderRadius="full" fontSize="sm">
                {service.category}
              </Badge>

              <Tag size="lg" variant="subtle" colorScheme="green">
                Valor: {serviceExtended.price || "A convenir"}
              </Tag>
            </HStack>

            <Heading size="2xl" mb={6} color={titleColor} lineHeight="tight">
              {service.title}
            </Heading>

            <Text fontSize="lg" color={textMuted} lineHeight="tall" mb={8}>
              {service.description}
            </Text>

            <Divider my={6} />

            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "start", sm: "center" }}
              gap={4}>
              <HStack spacing={4}>
                <Avatar
                  size="md"
                  name={service.owner.name}
                  src={serviceExtended.owner.avatarUrl || undefined}
                />
                <Box>
                  <Text fontWeight="bold" fontSize="md">
                    {service.owner.name}
                  </Text>
                  <StarRating
                    value={serviceExtended.owner.ratingAverage ?? 0}
                    count={serviceExtended.owner.ratingCount ?? 0}
                    size="xs"
                    showValue={false}
                  />
                  <Text fontSize="sm" color={textMuted}>
                    Propietario
                  </Text>
                </Box>
              </HStack>

              {!isMyService && (
                <Button
                  size="lg"
                  colorScheme="brand"
                  leftIcon={<Icon as={FaExchangeAlt} />}
                  onClick={onOpen}
                  width={{ base: "full", sm: "auto" }}>
                  Proponer Intercambio
                </Button>
              )}
            </Flex>

            {import.meta.env.DEV && (
              <Box pt={4} mt={4} borderTop="1px dashed gray">
                <Text fontSize="xs" color="gray.400">
                  Debug Info - ID Servicio: {id}
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
