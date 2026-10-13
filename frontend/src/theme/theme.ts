import { createTheme } from '@mui/material';

export const studioTokens = {
  bgCanvas: "#090c10", // Deepest background
  bgPanel: "#0d1117", // Panels, cards & drawer surface (clean obsidian)
  bgInput: "#131822", // Inputs, dropzones & console
  bgElevated: "#1a2232", // Active selections & highlights
  bgSubtle: "#161c28", // Hover states & secondary tags

  // Borders & Outlines
  borderDefault: "rgba(255, 255, 255, 0.08)",
  borderHover: "rgba(59, 130, 246, 0.50)",
  borderActive: "#2563eb",

  // Primary Accent (Vibrant Studio Blue)
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  primaryLight: "#60a5fa",
  primarySubtle: "rgba(37, 99, 235, 0.15)",

  // Typography
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",

  // Semantic Status
  success: "#10b981",
  successSubtle: "rgba(16, 185, 129, 0.15)",
  error: "#ef4444",
  errorSubtle: "rgba(239, 68, 68, 0.15)",
};

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: studioTokens.primary,
      light: studioTokens.primaryLight,
      dark: studioTokens.primaryHover,
    },
    secondary: {
      main: studioTokens.textSecondary,
    },
    background: {
      default: studioTokens.bgCanvas,
      paper: studioTokens.bgPanel,
    },
    text: {
      primary: studioTokens.textPrimary,
      secondary: studioTokens.textSecondary,
    },
    divider: studioTokens.borderDefault,
    success: {
      main: studioTokens.success,
    },
    error: {
      main: studioTokens.error,
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: studioTokens.bgCanvas,
          color: studioTokens.textPrimary,
        },
      },
    },
    // CRITICAL: Disable MUI's default white milky elevation overlay on dark mode surfaces!
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none !important",
          backgroundColor: studioTokens.bgPanel,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none !important",
          backgroundColor: studioTokens.bgPanel,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none !important",
          backgroundColor: studioTokens.bgPanel,
          border: `1px solid ${studioTokens.borderDefault}`,
          borderRadius: 10,
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: studioTokens.bgInput,
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: studioTokens.borderDefault,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.20)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: studioTokens.primary,
          },
        },
      },
    },
  },
});
