// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ServiceDetailPage } from "./pages/ServiceDetailPage"
import { TradesPage } from "./pages/TradesPage"
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage"
import { UserPublicProfilePage } from "./pages/UserPublicProfilePage" // ✅ NUEVO
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { MainLayout } from "./layouts/MainLayout"
import { useEffect } from "react"

const RouteLogger = () => {
  const location = useLocation()
  useEffect(() => {
    console.log(`[Router] Navegando a: ${location.pathname}`)
  }, [location])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <RouteLogger />
      <Routes>
        <Route path="/" element={<Navigate to="/services" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* RUTAS PROTEGIDAS Y CON LAYOUT COMPARTIDO */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/services" element={<DashboardPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/trades" element={<TradesPage />} />

            <Route path="/profile/settings" element={<ProfileSettingsPage />} />

            {/* ✅ PERFIL PÚBLICO */}
            <Route path="/users/:id" element={<UserPublicProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App