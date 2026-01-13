// frontend/src/components/services/ServiceCard.tsx
import { Box, Badge, Heading, Text, Flex, Button, Divider } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export interface ServiceCardProps {
  id: string;
  title: string;
  author: string;
  category: string;
  price: string;
  colorPalette: string;
}

export const ServiceCard = ({ id, title, author, category, price, colorPalette }: ServiceCardProps) => {
  
  // Debug handler
  const handleNavigationDebug = () => {
    console.log(`[ServiceCard] Click en ver servicio. ID: ${id}`);
    console.time(`Navegación-Servicio-${id}`); // Inicia cronómetro
  };

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

        <Divider mb={4} />

        <Button 
          as={Link} 
          to={`/services/${id}`} 
          onClick={handleNavigationDebug} // <--- Hookeamos el evento para log
          variant="outline" 
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