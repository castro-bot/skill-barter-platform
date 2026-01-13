// frontend/src/components/auth/LoginForm.tsx
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
      <VStack spacing={5} align="stretch"> {/* gap -> spacing */}
        
        {/* INPUT CORREO */}
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
              boxShadow: "0 0 0 1px #3182ce"
            }}
          />
        </Box>

        {/* INPUT CONTRASEÑA */}
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
              icon={showPassword ? <FaEyeSlash /> : <FaEye />} // En V2 se prefiere pasar el icono así o como children
            />
          </Box>
        </Box>

        {/* MENSAJE DE ERROR */}
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

        {/* BOTÓN PRINCIPAL - CORREGIDO */}
        <Button 
          type="submit" 
          colorScheme="blue" // colorPalette -> colorScheme
          size="lg"
          height="3rem"
          fontSize="md"
          isLoading={isLoading} // loading -> isLoading
          loadingText="Ingresando..." // Texto opcional mientras carga
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
          Iniciar Sesión
        </Button>
      </VStack>
    </Box>
  );
};