import { Box, Badge, Heading, Text, Flex, Button, Separator } from '@chakra-ui/react';

export interface ServiceCardProps {
  title: string;
  author: string;
  category: string;
  price: string;
  colorPalette: string;
}

export const ServiceCard = ({ title, author, category, price, colorPalette }: ServiceCardProps) => {
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
          <Badge colorPalette={colorPalette} variant="surface" px={2} py={1} borderRadius="full">
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

        <Separator mb={4} />

        <Button variant="surface" colorPalette={colorPalette} width="full" size="sm">
          Intercambiar
        </Button>
      </Box>
    </Box>
  );
};