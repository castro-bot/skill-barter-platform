import { useState } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  VStack,
  IconButton 
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      await register({ name, email, password });
      navigate('/services'); 
    } catch (err) {
      console.error(err);
      setError('Error al registrarse. Intenta con otro correo.');
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack gap={5} align="stretch">
        
        {/* INPUT NOMBRE */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
            Nombre Completo
          </Text>
          <Input 
            size="lg"
            placeholder="Ej. Juan Pérez" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            _focus={{ bg: "white", borderColor: "green.500", boxShadow: "0 0 0 1px #38a169" }}
          />
        </Box>

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
            _focus={{ bg: "white", borderColor: "green.500", boxShadow: "0 0 0 1px #38a169" }}
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
              _focus={{ bg: "white", borderColor: "green.500", boxShadow: "0 0 0 1px #38a169" }}
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
              _hover={{ color: "green.500", bg: "transparent" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Box p={3} bg="red.50" border="1px solid" borderColor="red.100" borderRadius="md">
            <Text color="red.600" fontSize="sm">{error}</Text>
          </Box>
        )}

        <Button 
          type="submit" 
          colorPalette="green" 
          size="lg"
          height="3rem"
          loading={isLoading} 
          width="full" 
          mt={2}
          fontWeight="bold"
          borderRadius="md"
          shadow="sm"
          _hover={{ transform: 'translateY(-1px)', shadow: 'md', bg: 'green.600' }}
          transition="all 0.2s"
        >
          {isLoading ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </VStack>
    </Box>
  );
};