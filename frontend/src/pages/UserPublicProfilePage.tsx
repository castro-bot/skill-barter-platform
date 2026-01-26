// frontend/src/pages/UserPublicProfilePage.tsx
import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Badge
} from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import client from "../api/client"
import { ServiceCard } from "../components/services/ServiceCard"
import { useAuth } from "../context/AuthContext"

type PublicUser = {
  id: string
  name: string
  email?: string
  createdAt?: string
}

type PublicService = {
  id: string
  title: string
  description?: string
  category: string
  owner: {
    id: string
    name: string
  }
  createdAt: string
  // Si backend ya tiene esto, lo aprovechamos:
  isActive?: boolean
  status?: string
}

type PublicProfileResponse = {
  user: PublicUser
  services: PublicService[]
}

const safeName = (name?: string) => (name && name.trim().length > 0 ? name : "Usuario")

export const UserPublicProfilePage = () => {
  const { id } = useParams()
  const { user: me } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null)

  const isMyProfile = useMemo(() => {
    if (!me?.id || !id) return false
    return me.id === id
  }, [me?.id, id])

  const loadProfile = async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      // Backend recomendado para Sprint 4:
      // GET /api/v1/users/:id  -> { user, services }
      const { data } = await client.get<PublicProfileResponse>(`/users/${id}`)

      // Filtro defensivo (si backend ya filtra, no molesta).
      const services = (data.services ?? []).filter((s) => {
        // si viene status/isActive, filtramos lo inactivo
        if (typeof s.isActive === "boolean") return s.isActive
        if (typeof s.status === "string") return s.status !== "INACTIVE" && s.status !== "TRADED"
        return true
      })

      setProfile({ ...data, services })
        } catch {
        setError("No se pudo cargar el perfil público.")
        setProfile(null)
        } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (isLoading) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.md" py={16}>
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" />
            <Text color="gray.500">Cargando perfil...</Text>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.md" py={10}>
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  if (!profile) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.md" py={10}>
          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            Perfil no encontrado.
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      <Container maxW="container.xl" py={10}>
        {/* HEADER PERFIL */}
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6} shadow="sm">
          <HStack spacing={4} align="center">
            <Avatar name={safeName(profile.user.name)} size="lg" />
            <Box>
              <HStack spacing={3} align="center">
                <Heading size="md" color="gray.800">
                  {safeName(profile.user.name)}
                </Heading>
                {isMyProfile && (
                  <Badge colorScheme="blue" borderRadius="full" px={3}>
                    Tú
                  </Badge>
                )}
              </HStack>

              <Text color="gray.500" fontSize="sm">
                Perfil público
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* SERVICIOS */}
        <Box mt={8}>
          <HStack justify="space-between" mb={4}>
            <Heading size="md" color="gray.800">
              Servicios publicados
            </Heading>
            <Text color="gray.500" fontSize="sm">
              {profile.services.length} disponibles
            </Text>
          </HStack>

          {profile.services.length === 0 ? (
            <Box
              bg="white"
              border="1px dashed"
              borderColor="gray.200"
              borderRadius="2xl"
              p={10}
              textAlign="center"
            >
              <Text color="gray.500">Este usuario no tiene servicios visibles.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={8} pb={10}>
              {profile.services.map((s) => (
                <ServiceCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  author={s.owner?.name ?? safeName(profile.user.name)}
                  category={s.category}
                  price="Trueque"
                  colorPalette="blue"
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Container>
    </Box>
  )
}