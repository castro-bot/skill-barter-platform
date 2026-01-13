// frontend/src/components/services/ServiceCard.tsx
import { Box, Heading, Text, Badge, HStack, Avatar, Button, Icon, Flex } from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface ServiceProps {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: {
    name: string;
  };
}

export const ServiceCard = ({ id, title, description, category, owner }: ServiceProps) => {
  return (
    <Box 
      bg="white" 
      border="1px solid" 
      borderColor="gray.200" 
      borderRadius="xl" 
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-4px)", shadow: "lg", borderColor: "blue.200" }}
      display="flex"
      flexDirection="column"
    >
      <Box p={5} flex="1">
        <HStack justify="space-between" mb={3}>
          <Badge colorScheme="blue" borderRadius="full" px={2}>
            {category}
          </Badge>
          <Text fontSize="xs" color="gray.400" fontWeight="bold">
            OFERTA
          </Text>
        </HStack>

        <Heading size="md" mb={2} color="gray.800" lineHeight="short">
          {title}
        </Heading>
        
        <Text color="gray.500" fontSize="sm" noOfLines={3} mb={4}>
          {description}
        </Text>
      </Box>

      {/* Footer de la tarjeta */}
      <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
        <Flex justify="space-between" align="center">
          <HStack>
            <Avatar size="xs" name={owner.name} />
            <Text fontSize="xs" fontWeight="bold" color="gray.600">
              {owner.name}
            </Text>
          </HStack>

          {/* ESTE BOTÓN ES CLAVE PARA EL SPRINT 3 */}
          <Button 
            as={Link} 
            to={`/services/${id}`} 
            size="sm" 
            colorScheme="blue" 
            variant="ghost"
            rightIcon={<Icon as={FaExchangeAlt} />}
          >
            Ver
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};