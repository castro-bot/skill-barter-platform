// src/layouts/MainLayout.tsx
import { Box } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import { Navbar } from "../components/layout/Navbar"
import { NotificationsProvider } from "../context/NotificationsContext"

export const MainLayout = () => {
  return (
    <NotificationsProvider>
      <Box minH="100vh" bg="gray.50">
        {/* Barra Superior */}
        <Navbar />

        {/* Contenido de la página (Dashboard, Perfil, etc.) */}
        <Box as="main" py={8}>
          <Outlet />
        </Box>
      </Box>
    </NotificationsProvider>
  )
}