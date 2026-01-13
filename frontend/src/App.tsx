// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage'; // <--- Importación faltante
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { useEffect } from 'react';

// Componente auxiliar para debug de rutas
const RouteLogger = () => {
  const location = useLocation();
  useEffect(() => {
    console.log(`[Router] Navegando a: ${location.pathname}`);
  }, [location]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <RouteLogger /> {/* <--- Logger global insertado */}
      <Routes>
        <Route path="/" element={<Navigate to="/services" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* RUTAS PROTEGIDAS Y CON LAYOUT COMPARTIDO */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/services" element={<DashboardPage />} />
            
            {/* 👇 SOLUCIÓN: Agregamos la ruta DENTRO del MainLayout */}
            {/* Si esta ruta estaba fuera o no existía, causaba el flash/error */}
            <Route path="/services/:id" element={<ServiceDetailPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;