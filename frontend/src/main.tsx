// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react'; // Quitamos "defaultSystem"
import { AuthProvider } from './context/AuthContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* En V2, ChakraProvider no necesita la prop "value" */}
    <ChakraProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
);