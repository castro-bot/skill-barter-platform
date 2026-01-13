// src/components/layout/Navbar.tsx
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Container, 
  Heading,
  Menu,           // <--- V2: Componente principal
  MenuButton,     // <--- V2: El botón que abre el menú
  MenuList,       // <--- V2: La lista desplegable
  MenuItem,       // <--- V2: Cada opción
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
          <HStack spacing={2}>
            <Heading size="md" color="blue.600" letterSpacing="tight" fontWeight="800">
              SkillBarter
            </Heading>
            <Box 
              // CORRECCIÓN V2: Sintaxis de gradiente lineal
              bgGradient="linear(to-r, blue.500, purple.500)"
              px={2} py={0.5} borderRadius="full"
            >
              <Text fontSize="10px" fontWeight="bold" color="white" letterSpacing="wider">BETA</Text>
            </Box>
          </HStack>

          {/* LADO DERECHO: MENÚ */}
          <Box>
            {/* CORRECCIÓN V2: Estructura clásica de Menú */}
            <Menu placement="bottom-end">
              <MenuButton 
                as={Button} 
                variant="ghost" 
                size="sm" 
                p={1} 
                borderRadius="full" 
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.200", transform: "scale(0.98)" }}
                sx={{ userSelect: "none" }}
              >
                <HStack spacing={2}>
                  <Flex 
                    align="center" justify="center" 
                    // CORRECCIÓN V2: Gradiente lineal
                    bgGradient="linear(to-br, blue.500, blue.700)"
                    color="white" w={8} h={8} borderRadius="full" fontSize="xs" fontWeight="bold" shadow="md"
                  >
                    {getInitials(user?.name)}
                  </Flex>
                  <Text display={{ base: 'none', md: 'block' }} fontWeight="medium" fontSize="sm" color="gray.700">
                    {user?.name}
                  </Text>
                  <Box as={FaChevronDown} fontSize="10px" color="gray.400" />
                </HStack>
              </MenuButton>
              
              <MenuList 
                minW="220px" 
                bg="white" 
                p={2} 
                shadow="xl" 
                borderRadius="xl" 
                border="1px solid" 
                borderColor="gray.100"
                zIndex="2000"
              >
                <Box px={3} py={3} mb={1} borderBottom="1px solid" borderColor="gray.100" bg="gray.50" borderRadius="md">
                  <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Cuenta</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800" noOfLines={1}> {/* lineClamp -> noOfLines */}
                    {user?.email}
                  </Text>
                </Box>
                
                <MenuItem _hover={{ bg: "blue.50", color: "blue.600" }} borderRadius="md" transition="all 0.2s">
                  <HStack><FaUser size={12} /><Text fontSize="sm">Mi Perfil</Text></HStack>
                </MenuItem>
                
                <MenuItem _hover={{ bg: "red.50", color: "red.600" }} borderRadius="md" onClick={logout} transition="all 0.2s">
                  <HStack><FaSignOutAlt size={12} /><Text fontSize="sm">Cerrar Sesión</Text></HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>

        </Flex>
      </Container>
    </Box>
  );
};