import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage'; // Podemos mantener el nombre del archivo por ahora
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial: Si entran a la raíz, van a services (o login si no están auth) */}
        <Route path="/" element={<Navigate to="/services" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* RUTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* AQUÍ EL CAMBIO CLAVE: De /dashboard a /services */}
            <Route path="/services" element={<DashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;