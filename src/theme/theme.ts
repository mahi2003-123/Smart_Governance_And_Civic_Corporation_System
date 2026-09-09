import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getCustomTheme = (mode: 'light' | 'dark') => {
  // SGCS Municipal Corporation System - Deep Forest Green & Terracotta Palette
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: '#2D5A46',        // SGCS Deep Forest Green
        dark: '#1F3E31',         // Dark Forest
        light: '#427A60',        // Medium Sage Green
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#E67E22',        // Warm Terracotta / Amber Accent
        light: '#F39C12',
        dark: '#D35400',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#FBFDFB',      // Crisp Clean Base
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1C2A24',      // Deep Charcoal
        secondary: '#5F7367',    // Muted Slate Green
      },
      divider: '#E2EAF0',
      success: {
        main: '#2D5A46',
        light: '#E8F3EE',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#E67E22',
        light: '#FDF2E9',
        contrastText: '#1C2A24',
      },
      error: {
        main: '#E74C3C',
        light: '#FDEDEC',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#2980B9',
        light: '#EBF5FB',
        contrastText: '#FFFFFF',
      },
      action: {
        hover: '#F2F7F4',
        selected: '#E8F3EE',
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      h1: {
        fontWeight: 900,
        fontSize: '3.2rem',
        lineHeight: 1.12,
        letterSpacing: '-0.03em',
        color: '#1C2A24',
      },
      h2: {
        fontWeight: 800,
        fontSize: '2.2rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        color: '#1C2A24',
      },
      h3: {
        fontWeight: 800,
        fontSize: '1.6rem',
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
        color: '#1C2A24',
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.25rem',
        lineHeight: 1.3,
        color: '#1C2A24',
      },
      h5: {
        fontWeight: 700,
        fontSize: '1.08rem',
        lineHeight: 1.35,
        color: '#1C2A24',
      },
      h6: {
        fontWeight: 700,
        fontSize: '0.95rem',
        lineHeight: 1.4,
        color: '#1C2A24',
      },
      subtitle1: {
        fontWeight: 700,
        fontSize: '0.95rem',
        color: '#1C2A24',
      },
      subtitle2: {
        fontWeight: 600,
        fontSize: '0.85rem',
        color: '#5F7367',
      },
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
        color: '#1C2A24',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.55,
        color: '#5F7367',
      },
      caption: {
        fontSize: '0.775rem',
        lineHeight: 1.4,
        color: '#5F7367',
      },
      button: {
        fontWeight: 700,
        fontSize: '0.875rem',
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#FBFDFB',
            color: '#1C2A24',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2EAF0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#2D5A46',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2EAF0',
            boxShadow: 'none',
            borderRadius: 14,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 22px',
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            backgroundColor: '#2D5A46',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#1F3E31',
              boxShadow: '0 4px 14px rgba(45, 90, 70, 0.3)',
            },
          },
          outlined: {
            borderColor: '#D1E6DC',
            color: '#1C2A24',
            backgroundColor: '#FFFFFF',
            '&:hover': {
              borderColor: '#2D5A46',
              backgroundColor: '#E8F3EE',
              color: '#2D5A46',
            },
          },
          text: {
            color: '#2D5A46',
            '&:hover': {
              backgroundColor: '#E8F3EE',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            fontSize: '0.9rem',
            '& fieldset': {
              borderColor: '#CBD5E1',
            },
            '&:hover fieldset': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2D5A46',
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#5F7367',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#2D5A46',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 700,
            fontSize: '0.775rem',
            height: '26px',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& th': {
              backgroundColor: '#F2F7F4',
              color: '#5F7367',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderBottom: '1px solid #E2EAF0',
              padding: '14px 18px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #E2EAF0',
            padding: '14px 18px',
            color: '#1C2A24',
            fontSize: '0.875rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#F2F7F4',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: '#E2EAF0',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
