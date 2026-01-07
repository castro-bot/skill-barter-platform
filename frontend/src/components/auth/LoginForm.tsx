import { useState } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  VStack, 
  IconButton,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('axel@pucem.edu.ec'); 
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack gap={5} align="stretch">
        
        {/* INPUT CORREO - Estilo limpio y moderno */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
            Correo Institucional
          </Text>
          <Input 
            size="lg"
            type="email" 
            placeholder="estudiante@pucem.edu.ec" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            _focus={{ 
              bg: "white", 
              borderColor: "blue.500", 
              boxShadow: "0 0 0 1px #3182ce" // Efecto de brillo azul sutil
            }}
          />
        </Box>

        {/* INPUT CONTRASEÑA - Estilo limpio con icono integrado */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
            Contraseña
          </Text>
          <Box position="relative">
            <Input 
              size="lg"
              type={showPassword ? 'text' : 'password'} 
              placeholder="********" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              paddingRight="3rem"
              _focus={{ 
                bg: "white", 
                borderColor: "blue.500", 
                boxShadow: "0 0 0 1px #3182ce" 
              }}
            />
            <IconButton
              aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              onClick={() => setShowPassword(!showPassword)}
              variant="ghost"
              size="sm"
              position="absolute"
              right="2"
              top="50%"
              transform="translateY(-50%)"
              zIndex="5"
              color="gray.400"
              _hover={{ color: "blue.500", bg: "transparent" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </Box>
        </Box>

        {/* MENSAJE DE ERROR - Sutil y claro */}
        {error && (
          <Box 
            p={3} 
            bg="red.50" 
            border="1px solid" 
            borderColor="red.100" 
            borderRadius="md"
          >
            <Text color="red.600" fontSize="sm" fontWeight="medium">
              {error}
            </Text>
          </Box>
        )}

        {/* BOTÓN PRINCIPAL - Con mejor presencia y feedback */}
        <Button 
          type="submit" 
          colorPalette="blue"
          size="lg"
          height="3rem" // Un poco más alto para mejor click
          fontSize="md"
          loading={isLoading} 
          width="full"
          mt={2}
          fontWeight="bold"
          borderRadius="md"
          shadow="sm"
          _hover={{ 
            transform: 'translateY(-1px)', 
            shadow: 'md',
            bg: 'blue.600'
          }}
          transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
        >
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </Button>
      </VStack>
    </Box>
  );
};