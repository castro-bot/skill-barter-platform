// frontend/src/components/layout/Navbar.tsx
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
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
  Link as ChakraLink,
  useColorMode,
  useColorModeValue
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { FaSignOutAlt, FaUser, FaChevronDown, FaExchangeAlt, FaBell, FaMoon, FaSun } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { useNotifications } from "../../context/NotificationsContext"

export const Navbar = () => {
  const { user, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const navBg = useColorModeValue("rgba(255, 255, 255, 0.85)", "rgba(15, 23, 23, 0.85)")
  const navBorder = useColorModeValue("gray.100", "whiteAlpha.200")
  const menuBg = useColorModeValue("white", "gray.800")
  const menuBorder = useColorModeValue("gray.100", "whiteAlpha.200")
  const hoverSoft = useColorModeValue("gray.50", "whiteAlpha.100")
  const iconSoft = useColorModeValue("gray.400", "gray.300")
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const textStrong = useColorModeValue("gray.800", "gray.100")
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
      bg={navBg}
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor={navBorder}
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
                bgGradient="linear(to-r, brand.600, sand.500)"
                bgClip="text"
                transition="all 0.3s"
                _groupHover={{
                  bgGradient: "linear(to-r, brand.500, sand.400)",
                  transform: "scale(1.02)"
                }}>
                SkillBarter
              </Heading>
              <Box
                bgGradient="linear(to-r, brand.500, sand.400)"
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
            <IconButton
              aria-label={colorMode === "light" ? "Activar modo oscuro" : "Activar modo claro"}
              icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
              variant="ghost"
              size="sm"
              borderRadius="full"
              color={iconSoft}
              _hover={{ color: "brand.500", bg: "brand.50" }}
              onClick={toggleColorMode}
            />
            {/* NOTIFICACIONES */}
            <Popover placement="bottom-end" onOpen={handleOpenNotifications}>
              <PopoverTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                  position="relative"
                  color={iconSoft}
                  _hover={{ color: "brand.500", bg: "brand.50" }}
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
                borderColor={menuBorder}
                bg={menuBg}
                shadow="2xl">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader borderTopRadius="2xl" fontWeight="800" color={textStrong}>
                  Notificaciones
                </PopoverHeader>

                <PopoverBody>
                  {isLoading ? (
                    <Flex py={6} justify="center" align="center" gap={3}>
                      <Spinner size="sm" />
                      <Text fontSize="sm" color={textMuted}>
                        Cargando...
                      </Text>
                    </Flex>
                  ) : error ? (
                    <Box py={3}>
                      <Text fontSize="sm" color="red.600" fontWeight="600" mb={2}>
                        No se pudieron cargar las notificaciones
                      </Text>
                      <Text fontSize="xs" color={textMuted}>
                        {error}
                      </Text>
                    </Box>
                  ) : notifications.length === 0 ? (
                    <Box py={6} textAlign="center">
                      <Text fontSize="sm" color={textMuted}>
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
                          borderColor={n.read ? menuBorder : "brand.100"}
                          bg={n.read ? menuBg : "brand.50"}
                          transition="all 0.2s"
                          cursor="pointer"
                          _hover={{ borderColor: "brand.200" }}
                          onClick={() => {
                            if (!n.read) markReadByIds([n.id])
                          }}>
                          <HStack justify="space-between" align="flex-start" spacing={3}>
                            <Box flex="1">
                              <Text
                                fontSize="sm"
                                fontWeight={n.read ? "600" : "800"}
                                color={textStrong}
                                mb={1}>
                                {n.message}
                              </Text>
                              <Text fontSize="xs" color={textMuted}>
                                {formatDateTime(n.createdAt)}
                              </Text>

                              {n.tradeId && (
                                <Box mt={2}>
                                  <ChakraLink
                                    as={Link}
                                    to="/trades"
                                    color="brand.600"
                                    fontSize="xs"
                                    fontWeight="700">
                                    Ver trueque
                                  </ChakraLink>
                                </Box>
                              )}
                            </Box>

                            {!n.read && (
                              <Badge colorScheme="brand" borderRadius="full" fontSize="10px">
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
                  borderColor={menuBorder}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color={textMuted}>
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
                _hover={{ bg: hoverSoft }}
                _active={{ bg: hoverSoft }}>
                <HStack spacing={3}>
                  <Flex
                    align="center"
                    justify="center"
                    bgGradient="linear(to-br, brand.600, sand.500)"
                    color="white"
                    w={9}
                    h={9}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    shadow="md"
                    border="2px solid white">
                    <Icon as={FaUser} boxSize={4} />
                  </Flex>

                  <Box textAlign="left" display={{ base: "none", md: "block" }}>
                    <Text fontSize="sm" fontWeight="bold" color={textStrong} lineHeight="1">
                      {user?.name?.split(" ")[0]}
                    </Text>
                    <Text fontSize="xs" color={textMuted} fontWeight="medium">
                      Mi Cuenta
                    </Text>
                  </Box>
                  <Icon as={FaChevronDown} fontSize="10px" color="gray.400" ml={1} />
                </HStack>
              </MenuButton>

              <MenuList
                minW="260px"
                bg={menuBg}
                p={2}
                shadow="2xl"
                borderRadius="2xl"
                border="1px solid"
                borderColor={menuBorder}
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

                <MenuDivider borderColor={menuBorder} mb={2} />

                <MenuItem
                  as={Link}
                  to={user?.id ? `/users/${user.id}` : "/services"}
                  _hover={{ bg: "brand.50", color: "brand.700" }}
                  borderRadius="lg"
                  py={3}
                  transition="all 0.2s">
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg="brand.100"
                      borderRadius="md"
                      align="center"
                      justify="center"
                      color="brand.600">
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
                  _hover={{ bg: "sand.50", color: "sand.700" }}
                  borderRadius="lg"
                  py={3}
                  transition="all 0.2s">
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg="sand.100"
                      borderRadius="md"
                      align="center"
                      justify="center"
                      color="sand.600">
                      <Icon as={FaExchangeAlt} boxSize={4} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        Mis Trueques
                      </Text>
                      <Text fontSize="xs" color={textMuted}>
                        Bandeja de entrada
                      </Text>
                    </Box>
                  </HStack>
                </MenuItem>

                <MenuDivider borderColor={menuBorder} my={2} />
                
                <MenuItem
                  as={Link}
                  to="/profile/settings"
                  _hover={{ bg: "brand.50", color: "brand.700" }}
                  borderRadius="lg"
                  py={3}
                  transition="all 0.2s"
                >
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg="brand.100"
                      borderRadius="md"
                      align="center"
                      justify="center"
                      color="brand.600"
                    >
                      <Icon as={FaUser} boxSize={4} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        Ajustes de Perfil
                      </Text>
                      <Text fontSize="xs" color={textMuted}>
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
