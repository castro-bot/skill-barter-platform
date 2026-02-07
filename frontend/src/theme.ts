// frontend/src/theme.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false
}

const theme = extendTheme({
  config,
  fonts: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Source Sans 3', sans-serif"
  },
  colors: {
    brand: {
      50: "#ecf8f6",
      100: "#d2efea",
      200: "#a7ded6",
      300: "#7fc9c0",
      400: "#45b0a7",
      500: "#2f968e",
      600: "#237771",
      700: "#1d605b",
      800: "#184b47",
      900: "#0f2e2b"
    },
    sand: {
      50: "#fdf6ec",
      100: "#f6ead6",
      200: "#ebd5b0",
      300: "#d9b986",
      400: "#c49a5e",
      500: "#a97a3d",
      600: "#885f2d",
      700: "#6d4b25",
      800: "#543a1d",
      900: "#3c2915"
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "xl",
        letterSpacing: "0.2px"
      },
      variants: {
        solid: {
          boxShadow: "0 10px 20px rgba(47, 150, 142, 0.2)"
        },
        outline: {
          borderWidth: "1px"
        }
      }
    },
    Badge: {
      baseStyle: {
        textTransform: "uppercase",
        letterSpacing: "0.6px"
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "2xl",
          borderWidth: "1px",
          borderColor: "borderSubtle",
          bg: "surface",
          boxShadow: "sm",
          _hover: {
            boxShadow: "md",
            transform: "translateY(-2px)"
          },
          transition: "all 0.2s ease-in-out"
        }
      }
    },
    Tabs: {
      variants: {
        softRounded: {
          tab: {
            _selected: {
              bg: "brand.100",
              color: "brand.800"
            }
          }
        }
      }
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "2xl",
          bg: "surface",
          borderColor: "borderSubtle"
        }
      }
    }
  },
  semanticTokens: {
    colors: {
      surface: { default: "white", _dark: "gray.800" },
      surfaceMuted: { default: "gray.50", _dark: "gray.900" },
      borderSubtle: { default: "gray.100", _dark: "whiteAlpha.200" },
      textMuted: { default: "gray.600", _dark: "gray.300" }
    }
  },
  styles: {
    global: {
      body: {
        bg: "var(--sb-bg)",
        color: "var(--sb-ink)"
      }
    }
  }
})

export default theme
