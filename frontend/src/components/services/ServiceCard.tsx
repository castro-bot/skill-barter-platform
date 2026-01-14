// frontend/src/components/services/ServiceCard.tsx
import { Box, Badge, Heading, Text, Button, Avatar, HStack, Icon, Spacer } from '@chakra-ui/react';
// CORRECCIÓN: Eliminamos 'Flex' de arriba porque no lo estamos usando
import { Link } from 'react-router-dom';
import { FaArrowRight, FaTag } from 'react-icons/fa';

export interface ServiceCardProps {
  id: string;
  title: string;
  author: string;
  category: string;
  price: string;
  colorPalette: string; 
}

export const ServiceCard = ({ id, title, author, category, price, colorPalette }: ServiceCardProps) => {
  
  // Debug handler (Mantenemos tu lógica original)
  const handleNavigationDebug = () => {
    console.log(`[ServiceCard] Click en ver servicio. ID: ${id}`);
    console.time(`Navegación-Servicio-${id}`); 
  };

  // Función estética: Elegir color según la categoría
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Tecnología': 'blue.500',
      'Idiomas': 'purple.500',
      'Asesoría': 'teal.500',
      'Otros': 'orange.500'
    };
    return colors[cat] || `${colorPalette}.500`;
  };

  const bgHeader = getCategoryColor(category);

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
        transform: 'translateY(-5px)', 
        shadow: 'xl',
        borderColor: 'blue.200'
      }}
    >
      {/* 1. Header decorativo */}
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
          fontWeight="bold"
        >
          {price}
        </Badge>
      </Box>

      {/* 2. Contenido */}
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
            por <Text as="span" fontWeight="semibold" color="gray.800">{author}</Text>
          </Text>
        </HStack>

        {/* Botón */}
        <Button 
          as={Link} 
          to={`/services/${id}`} 
          onClick={handleNavigationDebug} 
          colorScheme={colorPalette} 
          variant="outline"
          width="full" 
          borderRadius="xl"
          size="sm"
          _hover={{ bg: `${colorPalette}.50` }}
          rightIcon={<FaArrowRight />}
        >
          Ver / Intercambiar
        </Button>
      </Box>
    </Box>
  );
};