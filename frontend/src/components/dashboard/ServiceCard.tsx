// frontend/src/components/dashboard/ServiceCard.tsx
import { Box, Badge, Heading, Text, Flex, Button, Divider } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export interface ServiceCardProps {
  id: string;        // <--- AGREGADO: Necesitamos el ID para saber a dónde ir
  title: string;
  author: string;
  category: string;
  price: string;     // O "credits"
  colorPalette: string; // Lo usaremos como colorScheme
}

export const ServiceCard = ({ id, title, author, category, price, colorPalette }: ServiceCardProps) => {
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="2xl" 
      overflow="hidden" 
      bg="white" 
      shadow="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'md', borderColor: `${colorPalette}.400` }}
    >
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={3}>
          {/* CORRECCIÓN 1: colorScheme en vez de colorPalette */}
          <Badge colorScheme={colorPalette} variant="subtle" px={2} py={1} borderRadius="full">
            {category}
          </Badge>
          <Text fontWeight="bold" color={`${colorPalette}.600`} fontSize="sm">
            {price}
          </Text>
        </Flex>

        <Heading size="md" mb={2} lineHeight="short">
          {title}
        </Heading>

        <Text color="gray.500" fontSize="sm" mb={4}>
          Publicado por: {author}
        </Text>

        {/* CORRECCIÓN 2: Divider en vez de Separator */}
        <Divider mb={4} />

        {/* CORRECCIÓN 3: Botón convertido en Link para evitar el "Flash" */}
        <Button 
          as={Link}               // Comportamiento de Link (SPA)
          to={`/services/${id}`}  // Ruta al detalle
          variant="outline"       // Estilo V2
          colorScheme={colorPalette} 
          width="full" 
          size="sm"
        >
          Ver / Intercambiar
        </Button>
      </Box>
    </Box>
  );
};