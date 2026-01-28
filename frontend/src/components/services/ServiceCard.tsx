// frontend/src/components/services/ServiceCard.tsx
import {
  Box,
  Badge,
  Heading,
  Text,
  Button,
  Avatar,
  HStack,
  Icon,
  Spacer
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { FaArrowRight, FaTag } from "react-icons/fa"
import { StarRating } from "../ratings/StarRating"

export interface ServiceCardProps {
  id: string
  title: string
  author: string
  category: string
  price: string
  colorPalette: string
  ratingAverage?: number
  ratingCount?: number
}

export const ServiceCard = ({
  id,
  title,
  author,
  category,
  price,
  colorPalette,
  ratingAverage,
  ratingCount
}: ServiceCardProps) => {
  // Debug handler (solo DEV)
  const handleNavigationDebug = () => {
    if (!import.meta.env.DEV) return

    console.log(`[ServiceCard] Click en ver servicio. ID: ${id}`)
    try {
      console.time(`Navegación-Servicio-${id}`)
    } catch {
      // no-op
    }
  }

  // Función estética: color según categoría
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Tecnología: "blue.500",
      Idiomas: "purple.500",
      Asesoría: "teal.500",
      Otros: "orange.500",
      Diseño: "pink.500"
    }
    return colors[cat] || `${colorPalette}.500`
  }

  const bgHeader = getCategoryColor(category)

  // Blindaje: si por error llega id vacío o "new", no debería navegar al detalle
  // (En tu arquitectura, "new" se maneja con modal en DashboardPage)
  const isInvalidId = !id || id === "new"
  const targetHref = isInvalidId ? "/services" : `/services/${id}`

  return (
    <Box
      position="relative"
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      shadow="md"
      border="1px solid"
      borderColor="gray.100"
      transition="all 0.3s ease"
      display="flex"
      flexDirection="column"
      h="100%"
      _hover={{
        transform: "translateY(-5px)",
        shadow: "xl",
        borderColor: "blue.200"
      }}>
      {/* Header decorativo */}
      <Box h="80px" bgGradient={`linear(to-r, ${bgHeader}, gray.300)`} position="relative">
        <Badge
          position="absolute"
          top={3}
          right={3}
          bg="white"
          color="gray.800"
          px={3}
          py={1}
          borderRadius="full"
          shadow="sm"
          fontSize="xs"
          fontWeight="bold">
          {price}
        </Badge>
      </Box>

      {/* Contenido */}
      <Box p={5} flex="1" display="flex" flexDirection="column">
        {/* Categoría */}
        <HStack spacing={1} mb={2} color="gray.500">
          <Icon as={FaTag} boxSize={3} />
          <Text fontSize="xs" textTransform="uppercase" fontWeight="bold" letterSpacing="wide">
            {category}
          </Text>
        </HStack>

        {/* Título */}
        <Heading size="md" mb={2} lineHeight="short" color="gray.800" noOfLines={2}>
          {title}
        </Heading>

        <Spacer />

        {/* Autor */}
        <HStack mt={4} mb={6}>
          <Avatar size="xs" name={author} bg={bgHeader} color="white" />
          <Text fontSize="sm" color="gray.600">
            por{" "}
            <Text as="span" fontWeight="semibold" color="gray.800">
              {author}
            </Text>
          </Text>
        </HStack>

        {typeof ratingAverage === "number" && typeof ratingCount === "number" && (
          <StarRating value={ratingAverage} count={ratingCount} size="xs" showValue={false} />
        )}

        {/* Botón */}
        <Button
          as={Link}
          to={targetHref}
          onClick={handleNavigationDebug}
          colorScheme={colorPalette}
          variant="outline"
          width="full"
          borderRadius="xl"
          size="sm"
          _hover={{ bg: `${colorPalette}.50` }}
          rightIcon={<FaArrowRight />}>
          Ver / Intercambiar
        </Button>

        {/* Debug opcional (solo DEV) */}
        {import.meta.env.DEV && isInvalidId && (
          <Text mt={2} fontSize="xs" color="orange.500">
            Warning: ServiceCard recibió id inválido ({String(id)}). Redirigiendo a /services.
          </Text>
        )}
      </Box>
    </Box>
  )
}
