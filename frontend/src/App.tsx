// frontend/src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom"
import { useEffect } from "react"

import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ServiceDetailPage } from "./pages/ServiceDetailPage"
import { TradesPage } from "./pages/TradesPage"
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage"
import { UserPublicProfilePage } from "./pages/UserPublicProfilePage"

import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { MainLayout } from "./layouts/MainLayout"

/**
 * Logger simple de navegación (solo DEV)
 */
const RouteLogger = () => {
  const location = useLocation()

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[Router] Navegando a: ${location.pathname}`)
    }
  }, [location])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <RouteLogger />

      <Routes>
        {/* REDIRECCIÓN RAÍZ */}
        <Route path="/" element={<Navigate to="/services" replace />} />

        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* RUTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* DASHBOARD / MERCADO */}
            <Route path="/services" element={<DashboardPage />} />

            {/*
              IMPORTANTE:
              /services/new NO es una página real.
              Se maneja por MODAL desde DashboardPage.
              Por eso redirigimos inmediatamente al mercado.
            */}
            <Route
              path="/services/new"
              element={<Navigate to="/services" replace />}
            />

            {/* DETALLE REAL DEL SERVICIO */}
            <Route path="/services/:id" element={<ServiceDetailPage />} />

            {/* INTERCAMBIOS */}
            <Route path="/trades" element={<TradesPage />} />

            {/* PERFIL */}
            <Route path="/profile/settings" element={<ProfileSettingsPage />} />
            <Route path="/users/:id" element={<UserPublicProfilePage />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App