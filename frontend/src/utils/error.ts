import type { AxiosError } from "axios"

type ApiErrorBody = {
  message?: string
  error?: string
}

const API_ERROR_TRANSLATIONS: Record<string, string> = {
  // Auth
  "Invalid credentials": "Credenciales inválidas",
  "Email already in use": "El correo ya está en uso",
  "Email and password are required": "El correo y la contraseña son obligatorios",
  "Refresh token is required": "Se requiere el token de sesión",
  "Refresh token not found": "No se encontró el token de sesión",
  "Unauthorized: Invalid refresh token": "Sesión no autorizada. Token inválido",
  "Invalid refresh token": "Token de sesión inválido",
  "Authentication required": "Debes iniciar sesión para continuar",
  "Invalid or expired token": "Tu sesión es inválida o expiró",
  "Current password is incorrect": "La contraseña actual es incorrecta",
  "Current password and new password are required":
    "La contraseña actual y la nueva contraseña son obligatorias",
  "currentPassword and newPassword are required":
    "La contraseña actual y la nueva contraseña son obligatorias",
  "New password must be at least 6 characters":
    "La nueva contraseña debe tener al menos 6 caracteres",
  "User not found": "Usuario no encontrado",
  "Usuario no encontrado": "Usuario no encontrado",
  "No valid fields to update": "No hay campos válidos para actualizar",
  "Name must be at least 2 characters": "El nombre debe tener al menos 2 caracteres",
  "Invalid email format": "Formato de correo inválido",

  // Services
  "Service not found": "Servicio no encontrado",
  "Not authorized": "No autorizado",
  "Not authorized to update this service": "No tienes permiso para actualizar este servicio",
  "Not authorized to delete this service": "No tienes permiso para eliminar este servicio",
  "Title, description, and category are required":
    "Título, descripción y categoría son obligatorios",
  "User ID is required": "Se requiere el ID de usuario",

  // Generic
  "Internal server error": "Error interno del servidor"
}

const translateApiMessage = (message: string): string => {
  const normalized = message.trim()
  if (!normalized) return message
  return API_ERROR_TRANSLATIONS[normalized] ?? normalized
}

export const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const axiosErr = err as AxiosError<ApiErrorBody>
    const status = axiosErr.response?.status
    const data = axiosErr.response?.data

    if (axiosErr.code === "ERR_NETWORK" || !axiosErr.response) {
      return "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose."
    }

    if (status && status >= 500) {
      return "Ocurrió un error interno del servidor. Intenta nuevamente en unos segundos."
    }

    if (data?.message) return translateApiMessage(data.message)
    if (data?.error) return translateApiMessage(data.error)
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    if (err.message === "Network Error") {
      return "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose."
    }
    return translateApiMessage(err.message)
  }

  return fallback
}
