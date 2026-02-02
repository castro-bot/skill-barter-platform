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
  Badge,
  Tag,
  Wrap,
  WrapItem
} from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import client from "../api/client"
import { ServiceCard } from "../components/services/ServiceCard"
import { useAuth } from "../context/AuthContext"
import { ratingsApi, type Rating, type RatingSummary } from "../api/ratings"
import { StarRating } from "../components/ratings/StarRating"

type PublicUser = {
  id: string
  name: string
  email?: string
  createdAt?: string
  ratingAverage?: number
  ratingCount?: number
}

type PublicService = {
  id: string
  title: string
  description?: string
  category: string
  owner: {
    id: string
    name: string
    ratingAverage?: number
    ratingCount?: number
  }
  createdAt: string
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
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({ average: 0, count: 0 })
  const [ratings, setRatings] = useState<Rating[]>([])

  const isMyProfile = useMemo(() => {
    if (!me?.id || !id) return false
    return me.id === id
  }, [me?.id, id])

  const loadProfile = async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      const { data } = await client.get<PublicProfileResponse>(`/users/${id}`)

      const services = (data.services ?? []).filter((s) => {
        if (typeof s.isActive === "boolean") return s.isActive
        if (typeof s.status === "string") return s.status !== "INACTIVE" && s.status !== "TRADED"
        return true
      })

      setProfile({ ...data, services })

      setRatingSummary({
        average: data.user.ratingAverage ?? 0,
        count: data.user.ratingCount ?? 0
      })

      try {
        const [summary, list] = await Promise.all([
          ratingsApi.getUserSummary(id),
          ratingsApi.getUserRatings(id, 5, 0)
        ])
        setRatingSummary(summary)
        setRatings(list)
      } catch (innerError) {
        console.error("Error cargando calificaciones", innerError)
      }
    } catch {
      setError("No se pudo cargar el perfil publico.")
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
          <HStack spacing={4} align="center" justify="space-between" wrap="wrap">
            <HStack spacing={4} align="center">
              <Avatar name={safeName(profile.user.name)} size="lg" />
              <Box>
                <HStack spacing={3} align="center">
                  <Heading size="md" color="gray.800">
                    {safeName(profile.user.name)}
                  </Heading>
                  {isMyProfile && (
                    <Badge colorScheme="blue" borderRadius="full" px={3}>
                      Tu
                    </Badge>
                  )}
                </HStack>

                <Text color="gray.500" fontSize="sm">
                  Perfil publico
                </Text>
              </Box>
            </HStack>

            <Box>
              {ratingSummary.count > 0 ? (
                <StarRating value={ratingSummary.average} count={ratingSummary.count} size="sm" />
              ) : (
                <Badge colorScheme="gray" variant="subtle">
                  Sin calificaciones
                </Badge>
              )}
            </Box>
          </HStack>
        </Box>

        {/* CALIFICACIONES */}
        <Box mt={8} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6} shadow="sm">
          <HStack justify="space-between" mb={4} wrap="wrap">
            <Heading size="md" color="gray.800">
              Calificaciones recientes
            </Heading>
            <Text color="gray.500" fontSize="sm">
              {ratingSummary.count} total
            </Text>
          </HStack>

          {ratings.length === 0 ? (
            <Text color="gray.500">Aun no hay calificaciones.</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {ratings.map((rating) => (
                <Box key={rating.id} border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
                  <HStack justify="space-between" align="start" wrap="wrap">
                    <Box>
                      <Text fontWeight="bold" color="gray.700">
                        {rating.rater?.name || "Usuario"}
                      </Text>
                      <StarRating value={rating.score} showValue={false} showCount={false} size="xs" />
                    </Box>
                    <Text fontSize="xs" color="gray.400">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </Text>
                  </HStack>

                  {rating.comment && (
                    <Text mt={2} color="gray.600" fontSize="sm">
                      "{rating.comment}"
                    </Text>
                  )}

                  {rating.tags.length > 0 && (
                    <Wrap mt={3} spacing={2}>
                      {rating.tags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag size="sm" colorScheme="blue" variant="subtle">
                            {tag}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>
              ))}
            </VStack>
          )}
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
                  ratingAverage={s.owner.ratingAverage}
                  ratingCount={s.owner.ratingCount}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Container>
    </Box>
  )
}
