// frontend/src/pages/DashboardPage.tsx
import { useEffect, useRef, useState } from "react"
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  SimpleGrid,
  HStack,
  useDisclosure,
  Spinner
} from "@chakra-ui/react"
import { FaPlus, FaBoxOpen, FaExchangeAlt, FaCoins, FaChartLine } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { CreateServiceModal } from "../components/services/CreateServiceModal"
import { ServiceCard } from "../components/services/ServiceCard"
import { servicesApi, type ServiceListing } from "../api/services"
import type { ElementType } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { MyServicesSection } from "../components/services/MyServicesSection"

// --- COMPONENTE VISUAL: StatCard ---
interface StatCardProps {
  icon: ElementType
  label: string
  value: string
  color: string
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <Box
    bg="white"
    p={5}
    borderRadius="2xl"
    border="1px solid"
    borderColor="gray.100"
    shadow="sm"
    position="relative"
    overflow="hidden"
    transition="all 0.2s"
    _hover={{ transform: "translateY(-2px)", shadow: "md", borderColor: `${color}.200` }}
  >
    <Box position="absolute" right="-10px" top="-10px" opacity={0.1} transform="rotate(15deg)">
      <Icon as={icon} boxSize={24} color={color} />
    </Box>

    <Flex align="center" gap={4} position="relative" zIndex={1}>
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        borderRadius="xl"
        bg={`${color}.50`}
        color={`${color}.500`}
        shadow="sm"
      >
        <Icon as={icon} boxSize={6} />
      </Flex>
      <Box>
        <Text
          fontSize="xs"
          color="gray.500"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="800" color="gray.700" lineHeight="1">
          {value}
        </Text>
      </Box>
    </Flex>
  </Box>
)

export const DashboardPage = () => {
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const location = useLocation()
  const navigate = useNavigate()

  const [services, setServices] = useState<ServiceListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Evita re-abrir el modal dos veces en dev (React StrictMode monta/desmonta doble)
  const handledNewRouteRef = useRef(false)

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const data = await servicesApi.getAll()

      // Mostrar SOLO servicios que NO son del usuario actual
      const othersServices = data.filter((service) => service.owner.id !== user?.id)

      setServices(othersServices)
    } catch (error) {
      console.error("Error cargando servicios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadServices()
    } else {
      // si no hay user (por ejemplo, en transición), evita estado inconsistente
      setServices([])
      setIsLoading(false)
    }
  }, [user])

  /**
   * ✅ Manejo correcto de /services/new (crear servicio es MODAL, no página)
   * - Si el usuario llega a /services/new, abrimos modal
   * - Normalizamos URL a /services para evitar que quede "new" como un "id"
   */
  useEffect(() => {
    const isNewRoute = location.pathname === "/services/new"
    if (!isNewRoute) {
      handledNewRouteRef.current = false
      return
    }

    // No hagas nada si todavía no hay usuario (rutas protegidas deberían evitarlo, pero por seguridad)
    if (!user) return

    // Guard para StrictMode / doble ejecución en dev
    if (handledNewRouteRef.current) return
    handledNewRouteRef.current = true

    // 1) Abrir modal
    onOpen()

    // 2) Normalizar URL para que no choque con /services/:id
    // replace = true para que Back no vuelva a /services/new
    navigate("/services", { replace: true })
  }, [location.pathname, navigate, onOpen, user])

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      <CreateServiceModal isOpen={isOpen} onClose={onClose} onSuccess={loadServices} />

      {/* HERO HEADER */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        pb={12}
        pt={10}
        bgGradient="linear(to-b, white, gray.50)"
      >
        <Container maxW="container.xl">
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={8}
            mb={10}
          >
            <Box maxW="2xl">
              <Heading size="2xl" color="gray.800" letterSpacing="tight" mb={3}>
                Hola,{" "}
                <Box as="span" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  {user?.name?.split(" ")[0]}
                </Box>{" "}
                👋
              </Heading>
              <Text fontSize="lg" color="gray.500">
                Bienvenido a <b>SkillBarter</b>. Encuentra lo que necesitas intercambiando tus
                habilidades.
              </Text>
            </Box>

            <Button
              size="lg"
              colorScheme="blue"
              bgGradient="linear(to-r, blue.500, blue.600)"
              _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", transform: "scale(1.02)" }}
              color="white"
              borderRadius="xl"
              px={8}
              shadow="lg"
              onClick={onOpen}
              leftIcon={<FaPlus />}
            >
              Publicar Servicio
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <StatCard icon={FaCoins} label="Mis Créditos" value="100" color="yellow" />
            <StatCard icon={FaExchangeAlt} label="Intercambios Activos" value="0" color="purple" />
            <StatCard icon={FaChartLine} label="Reputación" value="Nueva" color="green" />
          </SimpleGrid>
        </Container>
      </Box>

      {/* ÁREA DE SERVICIOS */}
      <Container maxW="container.xl" py={12}>
        <HStack mb={8} justify="space-between" align="center">
          <Heading size="lg" color="gray.700" letterSpacing="tight">
            Explorar Mercado
          </Heading>
        </HStack>

        {isLoading ? (
          <Flex justify="center" py={20} direction="column" align="center" gap={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.400" fontSize="sm">
              Cargando ofertas...
            </Text>
          </Flex>
        ) : services.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={8} pb={10}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                author={service.owner.name}
                category={service.category}
                price="Trueque"
                colorPalette="blue"
                ratingAverage={service.owner.ratingAverage}
                ratingCount={service.owner.ratingCount}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            bg="white"
            borderRadius="3xl"
            border="2px dashed"
            borderColor="gray.200"
            textAlign="center"
            mx="auto"
            maxW="3xl"
          >
            <Flex
              bg="blue.50"
              w={20}
              h={20}
              borderRadius="full"
              align="center"
              justify="center"
              mb={6}
              color="blue.500"
            >
              <Icon as={FaBoxOpen} boxSize={8} />
            </Flex>
            <Heading size="md" color="gray.800" mb={2}>
              No hay otros servicios disponibles
            </Heading>
            <Text color="gray.500" maxW="md" mb={8}>
              Parece que eres el único aquí o ya has visto todo. ¡Invita a más amigos!
            </Text>
            <Button
              variant="outline"
              borderColor="blue.300"
              color="blue.600"
              onClick={onOpen}
              _hover={{ bg: "blue.50" }}
            >
              Publicar otro servicio
            </Button>
          </Flex>
        )}

        {/* SPRINT 4: MIS SERVICIOS + EDITAR/ELIMINAR */}
        <MyServicesSection />
      </Container>
    </Box>
  )
}
