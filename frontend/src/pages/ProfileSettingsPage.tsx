// frontend/src/pages/ProfileSettingsPage.tsx
import { useEffect, useState } from "react"
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  HStack,
  useColorModeValue
} from "@chakra-ui/react"
import type { AxiosError } from "axios"
import client from "../api/client"
import { useAuth } from "../context/AuthContext"

type MeResponse = {
  id: string
  name: string
  email: string
}

type ApiErrorBody = {
  message?: string
  error?: string
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorBody>
  const fromApi = axiosErr?.response?.data?.message || axiosErr?.response?.data?.error
  if (typeof fromApi === "string" && fromApi.trim().length > 0) return fromApi
  if (err instanceof Error && err.message.trim().length > 0) return err.message
  return fallback
}

export const ProfileSettingsPage = () => {
  const toast = useToast()
  const { user } = useAuth()
  const pageBg = useColorModeValue("transparent", "transparent")
  const cardBg = useColorModeValue("surface", "surface")
  const borderTone = useColorModeValue("gray.100", "whiteAlpha.200")
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const titleColor = useColorModeValue("gray.800", "gray.100")
  const inputBg = useColorModeValue("white", "gray.800")
  const inputDisabledBg = useColorModeValue("gray.50", "whiteAlpha.100")

  const [isBootLoading, setIsBootLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Perfil
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Password
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const loadMe = async () => {
    setIsBootLoading(true)
    setError(null)
    try {
      const { data } = await client.get<MeResponse>("/auth/me")
      setName(data.name ?? "")
      setEmail(data.email ?? "")
    } catch (e: unknown) {
      setError(getErrorMessage(e, "No se pudo cargar tu perfil."))
    } finally {
      setIsBootLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setIsBootLoading(false)
      return
    }
    loadMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleSaveProfile = async () => {
    setError(null)
    setIsSavingProfile(true)
    try {
      await client.put("/auth/me", { name })

      toast({
        title: "Perfil actualizado",
        description: "Tus datos se guardaron correctamente.",
        status: "success",
        duration: 2500,
        isClosable: true
      })

      await loadMe()
    } catch (e: unknown) {
      setError(getErrorMessage(e, "No se pudo actualizar el perfil."))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    setError(null)

    if (!currentPassword || !newPassword) {
      setError("Completa tu contraseña actual y la nueva contraseña.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("La confirmación no coincide con la nueva contraseña.")
      return
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.")
      return
    }

    setIsSavingPassword(true)
    try {
      await client.put("/auth/me/password", { currentPassword, newPassword })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña fue cambiada correctamente.",
        status: "success",
        duration: 2500,
        isClosable: true
      })
    } catch (e: unknown) {
      setError(getErrorMessage(e, "No se pudo cambiar la contraseña. Verifica tu contraseña actual."))
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <Box bg={pageBg} minH="calc(100vh - 64px)">
      <Container maxW="container.md" py={10}>
        <Heading size="lg" color={titleColor} mb={2}>
          Ajustes de Perfil
        </Heading>
        <Text color={textMuted} mb={8}>
          Actualiza tu información y tu contraseña.
        </Text>

        {error && (
          <Alert status="error" borderRadius="xl" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <VStack spacing={6} align="stretch">
          {/* PERFIL */}
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderTone}
            borderRadius="2xl"
            p={6}
            shadow="sm"
          >
            <Heading size="md" color={titleColor} mb={4}>
              Información
            </Heading>

            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  bg={inputBg}
                  isDisabled={isBootLoading}
                />
              </FormControl>

              <FormControl isDisabled>
                <FormLabel>Email</FormLabel>
                <Input value={email} placeholder="Tu email" bg={inputDisabledBg} />
              </FormControl>

              <HStack justify="flex-end" pt={2}>
                <Button
                  colorScheme="brand"
                  borderRadius="xl"
                  onClick={handleSaveProfile}
                  isLoading={isSavingProfile}
                  isDisabled={isBootLoading}
                >
                  Guardar cambios
                </Button>
              </HStack>
            </VStack>
          </Box>

          <Divider />

          {/* PASSWORD */}
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderTone}
            borderRadius="2xl"
            p={6}
            shadow="sm"
          >
            <Heading size="md" color={titleColor} mb={4}>
              Cambiar contraseña
            </Heading>

            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Contraseña actual</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="********"
                  bg={inputBg}
                  isDisabled={isBootLoading}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Nueva contraseña</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  bg={inputBg}
                  isDisabled={isBootLoading}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="********"
                  bg={inputBg}
                  isDisabled={isBootLoading}
                />
              </FormControl>

              <HStack justify="flex-end" pt={2}>
                <Button
                  variant="outline"
                  borderRadius="xl"
                  onClick={handleChangePassword}
                  isLoading={isSavingPassword}
                  isDisabled={isBootLoading}
                >
                  Cambiar contraseña
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
