import { createTheme } from '@mui/material';

export const studioTokens = {
  bgCanvas: "#101413",
  bgPanel: "#191c1b",
  bgInput: "#0d100f",
  bgElevated: "#232726",
  bgSubtle: "#2d3130",

  borderDefault: "rgba(255, 255, 255, 0.08)",
  borderHover: "rgba(128, 203, 196, 0.50)",
  borderActive: "#80cbc4",

  primary: "#80cbc4", // M3 Teal
  primaryHover: "#a7ffeb",
  primaryLight: "#a7ffeb",
  primarySubtle: "rgba(128, 203, 196, 0.16)",

  textPrimary: "#e0e3e1",
  textSecondary: "#bfc9c7",
  textMuted: "#899391",

  success: "#a5d6a7",
  successSubtle: "rgba(165, 214, 167, 0.15)",
  error: "#ffb4ab",
  errorSubtle: "rgba(255, 180, 171, 0.15)",
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
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    // Distinct, clearly visible floating dropdown menus & popovers using studioTokens
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundImage: "none !important",
          backgroundColor: `${studioTokens.bgElevated} !important`,
          border: "1px solid rgba(255, 255, 255, 0.14) !important",
          boxShadow: `0 20px 48px rgba(0, 0, 0, 0.9), 0 0 0 1px ${studioTokens.borderDefault} !important`,
          borderRadius: "10px !important",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: `${studioTokens.bgElevated} !important`,
          backgroundImage: "none !important",
          border: "1px solid rgba(255, 255, 255, 0.14) !important",
          boxShadow: `0 20px 48px rgba(0, 0, 0, 0.9), 0 0 0 1px ${studioTokens.borderDefault} !important`,
          borderRadius: "10px !important",
          marginTop: "6px",
        },
        list: {
          padding: "6px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.85rem",
          borderRadius: 6,
          margin: "2px 4px",
          color: studioTokens.textPrimary,
          "&:hover": {
            backgroundColor: studioTokens.bgSubtle,
          },
          "&.Mui-selected": {
            backgroundColor: `${studioTokens.primarySubtle} !important`,
            color: `${studioTokens.primaryLight} !important`,
            fontWeight: 600,
            border: `1px solid ${studioTokens.primarySubtle}`,
            "&:hover": {
              backgroundColor: "rgba(128, 203, 196, 0.25) !important",
            },
          },
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
            borderColor: "rgba(255, 255, 255, 0.25)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: studioTokens.primary,
          },
        },
      },
    },
  },
});
