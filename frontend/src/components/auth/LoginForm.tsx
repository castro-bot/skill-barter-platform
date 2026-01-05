import { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  
  // Estados locales para los inputs
  const [email, setEmail] = useState('axel@pucem.edu.ec'); 
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await login({ email, password });
      // La redirección la maneja el LoginPage o el Router automáticamente
    } catch (err) {
      // CORRECCIÓN: Usamos la variable para depuración y evitar el error del linter
      console.error(err);
      setError('Error al iniciar sesión. Intenta de nuevo.');
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack gap={4} align="stretch">
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
          colorPalette="blue" 
          loading={isLoading} 
          width="full"
          mt={2}
        >
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </Button>
      </VStack>
    </Box>
  );
};