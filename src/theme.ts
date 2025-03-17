
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Define the color mode configuration
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

// Extend the theme with custom colors, fonts, etc.
const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#e6f2ff",
      100: "#cce0ff",
      200: "#99c2ff",
      300: "#66a3ff",
      400: "#3385ff",
      500: "#0066ff",
      600: "#0052cc",
      700: "#003d99",
      800: "#002966",
      900: "#001433",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "medium",
      },
      defaultProps: {
        colorScheme: "brand",
      },
    },
  },
});

export default theme;
