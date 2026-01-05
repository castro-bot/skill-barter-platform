import { Box, Button, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { ServiceCard } from '../components/dashboard/ServiceCard';

const MOCK_SERVICES = [
  {
    id: 1,
    title: "Tutoría de Cálculo Diferencial",
    author: "María G.",
    category: "Académico",
    price: "2 Créditos",
    colorPalette: "blue"
  },
  {
    id: 2,
    title: "Formateo de Laptops y Drivers",
    author: "Juan P.",
    category: "Tecnología",
    price: "3 Créditos",
    colorPalette: "purple"
  },
  {
    id: 3,
    title: "Diseño de Logos Vectoriales",
    author: "Andrea L.",
    category: "Diseño",
    price: "Gratis",
    colorPalette: "pink"
  },
  {
    id: 4,
    title: "Conversación en Inglés (B2)",
    author: "Carlos M.",
    category: "Idiomas",
    price: "1 Crédito",
    colorPalette: "green"
  },
  {
    id: 5,
    title: "Asesoría en Tesis (Normas APA)",
    author: "Luis R.",
    category: "Académico",
    price: "5 Créditos",
    colorPalette: "orange"
  },
  {
    id: 6,
    title: "Instalación de SQL Server",
    author: "Axel J.",
    category: "Tecnología",
    price: "2 Créditos",
    colorPalette: "cyan"
  },
];

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2}>Mercado de Talentos</Heading>
          <Text color="gray.500" fontSize="lg">
            Bienvenido, {user?.name}. Tienes <strong>10 Créditos</strong> disponibles.
          </Text>
        </Box>
        <Button size="lg" colorPalette="blue">
          + Nueva Publicación
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
        {MOCK_SERVICES.map((service) => (
          <ServiceCard 
            key={service.id}
            title={service.title}
            author={service.author}
            category={service.category}
            price={service.price}
            colorPalette={service.colorPalette}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};