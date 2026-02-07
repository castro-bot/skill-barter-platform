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
  keyframes,
  useDisclosure,
  useColorModeValue,
  Spinner
} from "@chakra-ui/react"
import { FaPlus, FaBoxOpen, FaExchangeAlt, FaChartLine, FaCheckCircle } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { CreateServiceModal } from "../components/services/CreateServiceModal"
import { ServiceCard } from "../components/services/ServiceCard"
import { servicesApi, type ServiceListing } from "../api/services"
import { tradesApi } from "../api/trades"
import type { ElementType } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { MyServicesSection } from "../components/services/MyServicesSection"

// --- COMPONENTE VISUAL: StatCard ---
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

interface StatCardProps {
  icon: ElementType
  label: string
  value: string
  color: string
  delay?: number
}

const StatCard = ({ icon, label, value, color, delay = 0 }: StatCardProps) => {
  const subtleBg = useColorModeValue(`${color}.50`, "whiteAlpha.100")
  const labelColor = useColorModeValue("gray.500", "gray.400")
  const valueColor = useColorModeValue("gray.700", "gray.100")

  return (
    <Box
      bg="surface"
      p={5}
      borderRadius="2xl"
      border="1px solid"
      borderColor="borderSubtle"
      shadow="sm"
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", shadow: "md", borderColor: `${color}.200` }}
      animation={`${fadeUp} 0.6s ease ${delay}s both`}
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
          bg={subtleBg}
          color={`${color}.500`}
          shadow="sm"
        >
          <Icon as={icon} boxSize={6} />
        </Flex>
        <Box>
          <Text
            fontSize="xs"
            color={labelColor}
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="800" color={valueColor} lineHeight="1">
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

export const DashboardPage = () => {
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const heroGradient = useColorModeValue("linear(to-b, white, brand.50)", "linear(to-b, gray.900, gray.800)")
  const heroBorder = useColorModeValue("gray.200", "whiteAlpha.200")
  const subtleText = useColorModeValue("gray.500", "gray.400")
  const titleColor = useColorModeValue("gray.800", "gray.100")
  const emptyIconBg = useColorModeValue("brand.50", "whiteAlpha.100")

  const location = useLocation()
  const navigate = useNavigate()

  const [services, setServices] = useState<ServiceListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [completedTradesCount, setCompletedTradesCount] = useState(0)
  const [activeTradesCount, setActiveTradesCount] = useState(0)

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

  const loadStats = async () => {
    setIsStatsLoading(true)
    try {
      const trades = await tradesApi.getAll()

      const allTrades = [...(trades.incoming || []), ...(trades.outgoing || [])]
      const active = allTrades.filter((t) => t.status === "PENDING" || t.status === "ACCEPTED")
      const completed = allTrades.filter((t) => t.status === "COMPLETED")
      setActiveTradesCount(active.length)
      setCompletedTradesCount(completed.length)
    } catch (error) {
      console.error("Error cargando estadisticas:", error)
      setActiveTradesCount(0)
      setCompletedTradesCount(0)
    } finally {
      setIsStatsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadServices()
      loadStats()
    } else {
      // si no hay user (por ejemplo, en transición), evita estado inconsistente
      setServices([])
      setIsLoading(false)
      setIsStatsLoading(false)
      setActiveTradesCount(0)
      setCompletedTradesCount(0)
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
    <Box bg="transparent" minH="calc(100vh - 64px)">
      <CreateServiceModal isOpen={isOpen} onClose={onClose} onSuccess={loadServices} />

      {/* HERO HEADER */}
      <Box
        bg="surface"
        borderBottom="1px solid"
        borderColor={heroBorder}
        pb={12}
        pt={10}
        bgGradient={heroGradient}
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
              <Heading size="2xl" color={titleColor} letterSpacing="tight" mb={3}>
                Hola,{" "}
                <Box as="span" bgGradient="linear(to-r, brand.500, sand.400)" bgClip="text">
                  {user?.name?.split(" ")[0]}
                </Box>{" "}
                👋
              </Heading>
              <Text fontSize="lg" color={subtleText}>
                Bienvenido a <b>SkillBarter</b>. Encuentra lo que necesitas intercambiando tus
                habilidades.
              </Text>
            </Box>

            <Button
              size="lg"
              colorScheme="brand"
              bgGradient="linear(to-r, brand.500, brand.700)"
              _hover={{ bgGradient: "linear(to-r, brand.600, brand.800)", transform: "scale(1.02)" }}
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
            <StatCard
              icon={FaCheckCircle}
              label="Trueques Completados"
              value={isStatsLoading ? "..." : String(completedTradesCount)}
              color="sand"
              delay={0.05}
            />
            <StatCard
              icon={FaExchangeAlt}
              label="Intercambios Activos"
              value={isStatsLoading ? "..." : String(activeTradesCount)}
              color="brand"
              delay={0.1}
            />
            <StatCard
              icon={FaChartLine}
              label="Reputación"
              value={
                isStatsLoading
                  ? "..."
                  : user?.ratingCount
                    ? `${(user.ratingAverage ?? 0).toFixed(1)}/5.0 (${user.ratingCount})`
                    : "Nueva"
              }
              color="green"
              delay={0.15}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* ÁREA DE SERVICIOS */}
      <Container maxW="container.xl" py={12}>
        <HStack mb={8} justify="space-between" align="center">
          <Heading size="lg" color={titleColor} letterSpacing="tight">
            Explorar Mercado
          </Heading>
        </HStack>

        {isLoading ? (
          <Flex justify="center" py={20} direction="column" align="center" gap={4}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text color={subtleText} fontSize="sm">
              Cargando ofertas...
            </Text>
          </Flex>
        ) : services.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={8} pb={10}>
            {services.map((service, index) => (
              <Box key={service.id} animation={`${fadeUp} 0.5s ease ${index * 0.04}s both`}>
                <ServiceCard
                  id={service.id}
                  title={service.title}
                  author={service.owner.name}
                  category={service.category}
                  price="Trueque"
                  colorPalette="brand"
                  ratingAverage={service.owner.ratingAverage}
                  ratingCount={service.owner.ratingCount}
                />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            bg="surface"
            borderRadius="3xl"
            border="2px dashed"
            borderColor="borderSubtle"
            textAlign="center"
            mx="auto"
            maxW="3xl"
          >
            <Flex
              bg={emptyIconBg}
              w={20}
              h={20}
              borderRadius="full"
              align="center"
              justify="center"
              mb={6}
              color="brand.500"
            >
              <Icon as={FaBoxOpen} boxSize={8} />
            </Flex>
            <Heading size="md" color={titleColor} mb={2}>
              No hay otros servicios disponibles
            </Heading>
            <Text color={subtleText} maxW="md" mb={8}>
              Parece que eres el único aquí o ya has visto todo. ¡Invita a más amigos!
            </Text>
            <Button
              variant="outline"
              borderColor="brand.300"
              color="brand.700"
              onClick={onOpen}
              _hover={{ bg: "brand.50" }}
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
