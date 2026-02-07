import { useState } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  VStack,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../utils/error';

export const RegisterForm = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const inputBg = useColorModeValue("gray.50", "whiteAlpha.100")
  const inputBorder = useColorModeValue("gray.200", "whiteAlpha.200")
  const focusBg = useColorModeValue("white", "gray.800")
  const focusShadow = useColorModeValue("0 0 0 1px var(--sb-ring)", "0 0 0 1px var(--sb-ring)")
  
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
      setError(getApiErrorMessage(err, 'Error al registrarse. Intenta con otro correo.'));
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
            bg={inputBg}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="md"
            _focus={{ bg: focusBg, borderColor: "brand.500", boxShadow: focusShadow }}
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
            bg={inputBg}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="md"
            _focus={{ bg: focusBg, borderColor: "brand.500", boxShadow: focusShadow }}
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
              bg={inputBg}
              border="1px solid"
              borderColor={inputBorder}
              borderRadius="md"
              paddingRight="3rem"
              _focus={{ bg: focusBg, borderColor: "brand.500", boxShadow: focusShadow }}
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
              _hover={{ color: "brand.500", bg: "transparent" }}
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
          colorScheme="brand"
          size="lg"
          height="3rem"
          isLoading={isLoading}
          loadingText="Creando cuenta..."
          width="full"
          mt={2}
          fontWeight="bold"
          borderRadius="md"
          shadow="sm"
          _hover={{ transform: 'translateY(-1px)', shadow: 'md', bg: 'brand.600' }}
          transition="all 0.2s"
        >
          Registrarse
        </Button>
      </VStack>
    </Box>
  );
};
