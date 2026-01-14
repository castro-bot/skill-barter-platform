// frontend/src/components/layout/Navbar.tsx
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Container, 
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  Icon
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaChevronDown, FaExchangeAlt, FaBell } from 'react-icons/fa';
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
      bg="rgba(255, 255, 255, 0.85)" 
      backdropFilter="blur(12px)"
      borderBottom="1px solid" 
      borderColor="gray.100" 
      transition="all 0.3s"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justify="space-between">
          
          {/* LADO IZQUIERDO: LOGO PREMIUM */}
          <Link to="/services">
            {/* CORRECCIÓN: Cambiamos 'group' por 'role="group"' */}
            <HStack spacing={2} cursor="pointer" role="group">
              <Heading 
                size="lg" 
                letterSpacing="tighter" 
                fontWeight="900"
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                transition="all 0.3s"
                _groupHover={{ bgGradient: "linear(to-r, blue.500, purple.500)", transform: "scale(1.02)" }}
              >
                SkillBarter
              </Heading>
              <Box 
                bgGradient="linear(to-r, blue.500, purple.500)"
                px={2} py={0.5} borderRadius="full" shadow="sm"
              >
                <Text fontSize="9px" fontWeight="800" color="white" letterSpacing="widest">BETA</Text>
              </Box>
            </HStack>
          </Link>

          {/* LADO DERECHO: ACCIONES */}
          <HStack spacing={3}>
            
            {/* Botón de Notificaciones (Visual) */}
            <Button 
              variant="ghost" 
              size="sm" 
              borderRadius="full" 
              color="gray.400" 
              _hover={{ color: "blue.500", bg: "blue.50" }}
            >
               <Icon as={FaBell} boxSize={4} />
            </Button>

            {/* MENÚ DE USUARIO */}
            <Menu placement="bottom-end" autoSelect={false}>
              <MenuButton 
                as={Button} 
                variant="ghost" 
                size="sm" 
                p={1}
                pr={3}
                borderRadius="full" 
                _hover={{ bg: "gray.50" }}
                _active={{ bg: "gray.100" }}
              >
                <HStack spacing={3}>
                  {/* Avatar con Gradiente */}
                  <Flex 
                    align="center" justify="center" 
                    bgGradient="linear(to-br, blue.500, purple.600)"
                    color="white" w={9} h={9} borderRadius="full" fontSize="xs" fontWeight="bold" shadow="md"
                    border="2px solid white"
                  >
                    {getInitials(user?.name)}
                  </Flex>
                  
                  {/* Nombre y Rol */}
                  <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" lineHeight="1">
                        {user?.name?.split(' ')[0]}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        Mi Cuenta
                    </Text>
                  </Box>
                  <Icon as={FaChevronDown} fontSize="10px" color="gray.400" ml={1} />
                </HStack>
              </MenuButton>
              
              {/* LISTA DESPLEGABLE ESTILIZADA */}
              <MenuList 
                minW="260px" 
                bg="white" 
                p={2} 
                shadow="2xl" 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="gray.100"
                zIndex="popover"
              >
                <Box px={4} py={3} mb={2}>
                  <Text fontSize="xx-small" color="gray.400" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={1}>
                    Conectado como
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="gray.800" noOfLines={1}>
                    {user?.email}
                  </Text>
                </Box>
                
                <MenuDivider borderColor="gray.100" mb={2} />
                
                {/* Opción: Perfil */}
                <MenuItem _hover={{ bg: "blue.50", color: "blue.700" }} borderRadius="lg" py={3} transition="all 0.2s">
                  <HStack spacing={3}>
                    <Flex w={8} h={8} bg="blue.100" borderRadius="md" align="center" justify="center" color="blue.600">
                        <Icon as={FaUser} boxSize={4} />
                    </Flex>
                    <Text fontSize="sm" fontWeight="medium">Mi Perfil Público</Text>
                  </HStack>
                </MenuItem>

                {/* Opción: Mis Trueques */}
                <MenuItem 
                  as={Link} 
                  to="/trades" 
                  _hover={{ bg: "purple.50", color: "purple.700" }} 
                  borderRadius="lg" 
                  py={3}
                  transition="all 0.2s"
                >
                  <HStack spacing={3}>
                    <Flex w={8} h={8} bg="purple.100" borderRadius="md" align="center" justify="center" color="purple.600">
                        <Icon as={FaExchangeAlt} boxSize={4} />
                    </Flex>
                    <Box>
                        <Text fontSize="sm" fontWeight="medium">Mis Trueques</Text>
                        <Text fontSize="xs" color="gray.500">Bandeja de entrada</Text>
                    </Box>
                  </HStack>
                </MenuItem>
                
                <MenuDivider borderColor="gray.100" my={2} />
                
                {/* Opción: Cerrar Sesión */}
                <MenuItem _hover={{ bg: "red.50", color: "red.700" }} borderRadius="lg" onClick={logout} py={3} transition="all 0.2s">
                  <HStack spacing={3}>
                    <Flex w={8} h={8} bg="red.100" borderRadius="md" align="center" justify="center" color="red.600">
                        <Icon as={FaSignOutAlt} boxSize={4} />
                    </Flex>
                    <Text fontSize="sm" fontWeight="medium">Cerrar Sesión</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

        </Flex>
      </Container>
    </Box>
  );
};