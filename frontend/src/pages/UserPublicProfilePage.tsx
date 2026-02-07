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
  WrapItem,
  useColorModeValue
} from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import client from "../api/client"
import { ServiceCard } from "../components/services/ServiceCard"
import { useAuth } from "../context/AuthContext"
import { ratingsApi, type Rating, type RatingSummary } from "../api/ratings"
import { StarRating } from "../components/ratings/StarRating"
import { getApiErrorMessage } from "../utils/error"

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
  const cardBg = useColorModeValue("surface", "surface")
  const borderTone = useColorModeValue("gray.100", "whiteAlpha.200")
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const titleColor = useColorModeValue("gray.800", "gray.100")

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
    } catch (error) {
      setError(getApiErrorMessage(error, "No se pudo cargar el perfil publico."))
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
      <Box bg="transparent" minH="calc(100vh - 64px)">
        <Container maxW="container.md" py={16}>
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" />
            <Text color={textMuted}>Cargando perfil...</Text>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box bg="transparent" minH="calc(100vh - 64px)">
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
      <Box bg="transparent" minH="calc(100vh - 64px)">
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
    <Box bg="transparent" minH="calc(100vh - 64px)">
      <Container maxW="container.xl" py={10}>
        {/* HEADER PERFIL */}
        <Box bg={cardBg} border="1px solid" borderColor={borderTone} borderRadius="2xl" p={6} shadow="sm">
          <HStack spacing={4} align="center" justify="space-between" wrap="wrap">
            <HStack spacing={4} align="center">
              <Avatar name={safeName(profile.user.name)} size="lg" />
              <Box>
                <HStack spacing={3} align="center">
                  <Heading size="md" color={titleColor}>
                    {safeName(profile.user.name)}
                  </Heading>
                  {isMyProfile && (
                    <Badge colorScheme="brand" borderRadius="full" px={3}>
                      Tu
                    </Badge>
                  )}
                </HStack>

                <Text color={textMuted} fontSize="sm">
                  Perfil publico
                </Text>
              </Box>
            </HStack>

            <Box>
              {ratingSummary.count > 0 ? (
                <StarRating value={ratingSummary.average} count={ratingSummary.count} size="sm" />
              ) : (
                <Badge colorScheme="sand" variant="subtle">
                  Sin calificaciones
                </Badge>
              )}
            </Box>
          </HStack>
        </Box>

        {/* CALIFICACIONES */}
        <Box mt={8} bg={cardBg} border="1px solid" borderColor={borderTone} borderRadius="2xl" p={6} shadow="sm">
          <HStack justify="space-between" mb={4} wrap="wrap">
            <Heading size="md" color={titleColor}>
              Calificaciones recientes
            </Heading>
            <Text color={textMuted} fontSize="sm">
              {ratingSummary.count} total
            </Text>
          </HStack>

          {ratings.length === 0 ? (
            <Text color={textMuted}>Aun no hay calificaciones.</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {ratings.map((rating) => (
                <Box key={rating.id} border="1px solid" borderColor={borderTone} borderRadius="xl" p={4}>
                  <HStack justify="space-between" align="start" wrap="wrap">
                    <Box>
                      <Text fontWeight="bold" color={titleColor}>
                        {rating.rater?.name || "Usuario"}
                      </Text>
                      <StarRating value={rating.score} showValue={false} showCount={false} size="xs" />
                    </Box>
                    <Text fontSize="xs" color={textMuted}>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </Text>
                  </HStack>

                  {rating.comment && (
                    <Text mt={2} color={textMuted} fontSize="sm">
                      "{rating.comment}"
                    </Text>
                  )}

                  {rating.tags.length > 0 && (
                    <Wrap mt={3} spacing={2}>
                      {rating.tags.map((tag) => (
                        <WrapItem key={tag}>
                        <Tag size="sm" colorScheme="brand" variant="subtle">
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
            <Heading size="md" color={titleColor}>
              Servicios publicados
            </Heading>
            <Text color={textMuted} fontSize="sm">
              {profile.services.length} disponibles
            </Text>
          </HStack>

          {profile.services.length === 0 ? (
            <Box
              bg={cardBg}
              border="1px dashed"
              borderColor={borderTone}
              borderRadius="2xl"
              p={10}
              textAlign="center"
            >
              <Text color={textMuted}>Este usuario no tiene servicios visibles.</Text>
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
                  colorPalette="brand"
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
