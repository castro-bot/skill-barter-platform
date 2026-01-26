// frontend/src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { ChakraProvider } from "@chakra-ui/react"
import App from "./App"
import theme from "./theme"

import { AuthProvider } from "./context/AuthContext"
import { NotificationsProvider } from "./context/NotificationsContext"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
)