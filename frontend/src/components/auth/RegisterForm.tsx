import { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Estados locales para capturar los datos
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recargar la página
    setError('');

    // Validación simple
    if (!name || !email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      // Llamamos a la función register del contexto
      await register({ name, email, password });
      // Si todo sale bien, redirigimos al dashboard
      navigate('/services'); 
    } catch (err) {
      // CORRECCIÓN: Usamos la variable err imprimiéndola en consola
      console.error(err);
      setError('Error al registrarse. Intenta con otro correo.');
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack gap={4} align="stretch">
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Nombre Completo</Text>
          <Input 
            placeholder="Ej. Juan Pérez" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Correo Institucional</Text>
          <Input 
            type="email" 
            placeholder="estudiante@pucem.edu.ec" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Contraseña</Text>
          <Input 
            type="password" 
            placeholder="********" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </Box>

        {error && (
          <Text color="red.500" fontSize="sm" textAlign="center">
            {error}
          </Text>
        )}

        <Button 
          type="submit" 
          colorPalette="green" 
          loading={isLoading} 
          width="full" 
          mt={2}
        >
          {isLoading ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </VStack>
    </Box>
  );
};