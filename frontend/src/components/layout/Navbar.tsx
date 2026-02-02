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
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  Badge,
  Spinner,
  Link as ChakraLink
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { FaSignOutAlt, FaUser, FaChevronDown, FaExchangeAlt, FaBell } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { useNotifications } from "../../context/NotificationsContext"

export const Navbar = () => {
  const { user, logout } = useAuth()
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshAll,
    markAllUnreadAsRead,
    markReadByIds
  } = useNotifications()

  const getInitials = (name: string = "") => name.substring(0, 2).toUpperCase()

  /**
   * Formateo simple de fecha ISO (sin librerías).
   * Puedes refinarlo luego si quieres “hace 2 min”.
   */
  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString()
  }

  /**
   * Al abrir el panel:
   * 1) Refrescamos estado (por si cambió en otra pestaña / en backend)
   * 2) Marcamos como leídas todas las no leídas (requiere IDs; lo hace el context)
   */
  const handleOpenNotifications = async () => {
    await refreshAll()
    await markAllUnreadAsRead()
  }

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
      transition="all 0.3s">
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justify="space-between">
          {/* LADO IZQUIERDO: LOGO */}
          <Link to="/services">
            <HStack spacing={2} cursor="pointer" role="group">
              <Heading
                size="lg"
                letterSpacing="tighter"
                fontWeight="900"
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                transition="all 0.3s"
                _groupHover={{
                  bgGradient: "linear(to-r, blue.500, purple.500)",
                  transform: "scale(1.02)"
                }}>
                SkillBarter
              </Heading>
              <Box
                bgGradient="linear(to-r, blue.500, purple.500)"
                px={2}
                py={0.5}
                borderRadius="full"
                shadow="sm">
                <Text fontSize="9px" fontWeight="800" color="white" letterSpacing="widest">
                  BETA
                </Text>
              </Box>
            </HStack>
          </Link>

          {/* LADO DERECHO: ACCIONES */}
          <HStack spacing={3}>
            {/* NOTIFICACIONES */}
            <Popover placement="bottom-end" onOpen={handleOpenNotifications}>
              <PopoverTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                  position="relative"
                  color="gray.400"
                  _hover={{ color: "blue.500", bg: "blue.50" }}
                  aria-label="Notificaciones">
                  <Icon as={FaBell} boxSize={4} />

                  {unreadCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-1"
                      right="-1"
                      borderRadius="full"
                      px={2}
                      fontSize="10px"
                      colorScheme="red">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                w="360px"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                shadow="2xl">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader borderTopRadius="2xl" fontWeight="800" color="gray.700">
                  Notificaciones
                </PopoverHeader>

                <PopoverBody>
                  {isLoading ? (
                    <Flex py={6} justify="center" align="center" gap={3}>
                      <Spinner size="sm" />
                      <Text fontSize="sm" color="gray.500">
                        Cargando...
                      </Text>
                    </Flex>
                  ) : error ? (
                    <Box py={3}>
                      <Text fontSize="sm" color="red.600" fontWeight="600" mb={2}>
                        No se pudieron cargar las notificaciones
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {error}
                      </Text>
                    </Box>
                  ) : notifications.length === 0 ? (
                    <Box py={6} textAlign="center">
                      <Text fontSize="sm" color="gray.500">
                        No tienes notificaciones aún.
                      </Text>
                    </Box>
                  ) : (
                    <VStack align="stretch" spacing={2} maxH="320px" overflowY="auto" pr={1}>
                      {notifications.map((n) => (
                        <Box
                          key={n.id}
                          p={3}
                          borderRadius="xl"
                          border="1px solid"
                          borderColor={n.read ? "gray.100" : "blue.100"}
                          bg={n.read ? "white" : "blue.50"}
                          transition="all 0.2s"
                          cursor="pointer"
                          _hover={{ borderColor: "blue.200" }}
                          onClick={() => {
                            if (!n.read) markReadByIds([n.id])
                          }}>
                          <HStack justify="space-between" align="flex-start" spacing={3}>
                            <Box flex="1">
                              <Text
                                fontSize="sm"
                                fontWeight={n.read ? "600" : "800"}
                                color="gray.700"
                                mb={1}>
                                {n.message}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {formatDateTime(n.createdAt)}
                              </Text>

                              {n.tradeId && (
                                <Box mt={2}>
                                  <ChakraLink
                                    as={Link}
                                    to="/trades"
                                    color="blue.600"
                                    fontSize="xs"
                                    fontWeight="700">
                                    Ver trueque
                                  </ChakraLink>
                                </Box>
                              )}
                            </Box>

                            {!n.read && (
                              <Badge colorScheme="blue" borderRadius="full" fontSize="10px">
                                Nuevo
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </PopoverBody>

                <PopoverFooter
                  borderBottomRadius="2xl"
                  borderTop="1px solid"
                  borderColor="gray.100">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.500">
                      {notifications.length > 0 ? `${notifications.length} en total` : "—"}
                    </Text>
                    <Button size="xs" variant="ghost" onClick={refreshAll}>
                      Refrescar
                    </Button>
                  </HStack>
                </PopoverFooter>
              </PopoverContent>
            </Popover>

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
                _active={{ bg: "gray.100" }}>
                <HStack spacing={3}>
                  <Flex
                    align="center"
                    justify="center"
                    bgGradient="linear(to-br, blue.500, purple.600)"
                    color="white"
                    w={9}
                    h={9}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    shadow="md"
                    border="2px solid white">
                    {getInitials(user?.name)}
                  </Flex>

                  <Box textAlign="left" display={{ base: "none", md: "block" }}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" lineHeight="1">
                      {user?.name?.split(" ")[0]}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Mi Cuenta
                    </Text>
                  </Box>
                  <Icon as={FaChevronDown} fontSize="10px" color="gray.400" ml={1} />
                </HStack>
              </MenuButton>

              <MenuList
                minW="260px"
                bg="white"
                p={2}
                shadow="2xl"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                zIndex="popover">
                <Box px={4} py={3} mb={2}>
                  <Text
                    fontSize="xx-small"
                    color="gray.400"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={1}>
                    Conectado como
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="gray.800" noOfLines={1}>
                    {user?.email}
                  </Text>
                </Box>

                <MenuDivider borderColor="gray.100" mb={2} />

                <MenuItem
                  as={Link}
                  to={user?.id ? `/users/${user.id}` : "/services"}
                  _hover={{ bg: "blue.50", color: "blue.700" }}
                  borderRadius="lg"
                  py={3}
                  transition="all 0.2s">
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg="blue.100"
                      borderRadius="md"
                      align="center"
                      justify="center"
                      color="blue.600">
                      <Icon as={FaUser} boxSize={4} />
                    </Flex>
                    <Text fontSize="sm" fontWeight="medium">
                      Mi Perfil Público
                    </Text>
                  </HStack>
                </MenuItem>

                <MenuItem
                  as={Link}
                  to="/trades"
                  _hover={{ bg: "purple.50", color: "purple.700" }}
                  borderRadius="lg"
                  py={3}
                  transition="all 0.2s">
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg="purple.100"
                      borderRadius="md"
                      align="center"
                      justify="center"
                      color="purple.600">
                      <Icon as={FaExchangeAlt} boxSize={4} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        Mis Trueques
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Bandeja de entrada
                      </Text>
                    </Box>
                  </HStack>
                </MenuItem>

                <MenuDivider borderColor="gray.100" my={2} />
                
                <MenuItem
                  as={Link}
                  to="/profile/settings"
                  _hover={{ bg: "blue.50", color: "blue.700" }}
                  borderRadius="lg"
                  py={3}
                  transition="all 0.2s"
                >
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg="blue.100"
                      borderRadius="md"
                      align="center"
                      justify="center"
                      color="blue.600"
                    >
                      <Icon as={FaUser} boxSize={4} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        Ajustes de Perfil
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Datos y contraseña
                      </Text>
                    </Box>
                  </HStack>
                </MenuItem>
                
                <MenuItem
                  _hover={{ bg: "red.50", color: "red.700" }}
                  borderRadius="lg"
                  onClick={logout}
                  py={3}
                  transition="all 0.2s">
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg="red.100"
                      borderRadius="md"
                      align="center"
                      justify="center"
                      color="red.600">
                      <Icon as={FaSignOutAlt} boxSize={4} />
                    </Flex>
                    <Text fontSize="sm" fontWeight="medium">
                      Cerrar Sesión
                    </Text>
                  </HStack>
                </MenuItem>

                
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}