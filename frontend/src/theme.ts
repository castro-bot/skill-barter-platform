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
      50: "#eef2fb",
      100: "#d9e3f5",
      200: "#b6c7ea",
      300: "#8ea6dc",
      400: "#6d85ca",
      500: "#5672a9",
      600: "#465f8f",
      700: "#394d74",
      800: "#2b3b59",
      900: "#1f2b40"
    },
    sand: {
      50: "#f4f8fd",
      100: "#e3edf9",
      200: "#c8dcf2",
      300: "#aac8e9",
      400: "#90b2dd",
      500: "#7a9ccf",
      600: "#6786b6",
      700: "#556f96",
      800: "#425572",
      900: "#2f3d51"
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
