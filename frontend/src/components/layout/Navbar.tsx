import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Container, 
  Heading,
  Menu, 
  HStack 
} from '@chakra-ui/react';
import { FaSignOutAlt, FaUser, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const getInitials = (name: string = '') => name.substring(0, 2).toUpperCase();

  return (
    <Box 
      as="nav" 
      position="sticky" 
      top="0" 
      zIndex="1000"
      bg="rgba(255, 255, 255, 0.8)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid" 
      borderColor="gray.200" 
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justify="space-between">
          
          {/* LADO IZQUIERDO: LOGO */}
          <HStack gap={2}>
            <Heading size="md" color="blue.600" letterSpacing="tight" fontWeight="800">
              SkillBarter
            </Heading>
            <Box 
              bgGradient="to-r" gradientFrom="blue.500" gradientTo="purple.500"
              px={2} py={0.5} borderRadius="full"
            >
              <Text fontSize="10px" fontWeight="bold" color="white" letterSpacing="wider">BETA</Text>
            </Box>
          </HStack>

          {/* LADO DERECHO: MENÚ */}
          {/* Envolvemos en Box para proteger el Flex Layout de cualquier cambio de tamaño interno */}
          <Box>
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  p={1} 
                  borderRadius="full" 
                  _hover={{ bg: "gray.100" }}
                  _active={{ bg: "gray.200", transform: "scale(0.98)" }}
                  css={{ userSelect: "none" }} // Evita selección de texto accidental
                >
                  <HStack gap={2}>
                    <Flex 
                      align="center" justify="center" 
                      bgGradient="to-br" gradientFrom="blue.500" gradientTo="blue.700"
                      color="white" w={8} h={8} borderRadius="full" fontSize="xs" fontWeight="bold" shadow="md"
                    >
                      {getInitials(user?.name)}
                    </Flex>
                    <Text display={{ base: 'none', md: 'block' }} fontWeight="medium" fontSize="sm" color="gray.700">
                      {user?.name}
                    </Text>
                    <Box as={FaChevronDown} fontSize="10px" color="gray.400" />
                  </HStack>
                </Button>
              </Menu.Trigger>
              
              {/* PORTAL: Renderiza el menú fuera del DOM del navbar para no afectar el layout */}
              <Menu.Positioner>
                <Menu.Content 
                  minW="220px" 
                  bg="white" 
                  p={2} 
                  shadow="xl" 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor="gray.100"
                  zIndex="2000" // Aseguramos que flote sobre todo
                >
                  <Box px={3} py={3} mb={1} borderBottom="1px solid" borderColor="gray.100" bg="gray.50" borderRadius="md">
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Cuenta</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.800" lineClamp={1}>
                      {user?.email}
                    </Text>
                  </Box>
                  <Menu.Item value="profile" cursor="pointer" _hover={{ bg: "blue.50", color: "blue.600" }} p={2} borderRadius="md" transition="all 0.2s">
                    <HStack><FaUser size={12} /><Text fontSize="sm">Mi Perfil</Text></HStack>
                  </Menu.Item>
                  <Menu.Item value="logout" cursor="pointer" _hover={{ bg: "red.50", color: "red.600" }} p={2} borderRadius="md" onClick={logout} transition="all 0.2s">
                    <HStack><FaSignOutAlt size={12} /><Text fontSize="sm">Cerrar Sesión</Text></HStack>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </Box>

        </Flex>
      </Container>
    </Box>
  );
};