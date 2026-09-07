import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getCustomTheme = (mode: 'light' | 'dark') => {
  // Civic & Institutional Design System — Deep Teal & Warm Terracotta
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: '#0F4C5C',
        dark: '#0A343F',
        light: '#266B7B',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#C85A32',
        light: '#E27D56',
        dark: '#A03F1B',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#FAF8F5',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1A232A',
        secondary: '#5A6672',
      },
      divider: '#E2E6EA',
      success: {
        main: '#2D6A4F',
        light: '#E8F5E9',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#D97706',
        light: '#FFF8E1',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#C0392B',
        light: '#FFEBEE',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#0F4C5C',
        light: '#E0F2F1',
        contrastText: '#FFFFFF',
      },
      action: {
        hover: '#F4F1EA',
        selected: '#EBF1F2',
      },
    },
    shape: {
      borderRadius: 6,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.25rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        color: '#1A232A',
      },
      h2: {
        fontWeight: 700,
        fontSize: '1.75rem',
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
        color: '#1A232A',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.4rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        color: '#1A232A',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.2rem',
        lineHeight: 1.35,
        color: '#1A232A',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.05rem',
        lineHeight: 1.4,
        color: '#1A232A',
      },
      h6: {
        fontWeight: 600,
        fontSize: '0.95rem',
        lineHeight: 1.4,
        color: '#1A232A',
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: '0.975rem',
        color: '#1A232A',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        color: '#5A6672',
      },
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
        color: '#1A232A',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.55,
        color: '#5A6672',
      },
      caption: {
        fontSize: '0.775rem',
        lineHeight: 1.4,
        color: '#5A6672',
      },
      button: {
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#FAF8F5',
            color: '#1A232A',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(15, 76, 92, 0.05)',
            border: '1px solid #E2E6EA',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              borderColor: '#CBD5E1',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E6EA',
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'none',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            backgroundColor: '#0F4C5C',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#0A343F',
              boxShadow: '0 2px 4px rgba(15, 76, 92, 0.2)',
            },
          },
          outlined: {
            borderColor: '#E2E6EA',
            color: '#1A232A',
            backgroundColor: '#FFFFFF',
            '&:hover': {
              borderColor: '#0F4C5C',
              backgroundColor: '#F4F1EA',
            },
          },
          text: {
            color: '#0F4C5C',
            '&:hover': {
              backgroundColor: '#F4F1EA',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundColor: '#FFFFFF',
            fontSize: '0.9rem',
            '& fieldset': {
              borderColor: '#E2E6EA',
            },
            '&:hover fieldset': {
              borderColor: '#5A6672',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0F4C5C',
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#5A6672',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#0F4C5C',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontWeight: 600,
            fontSize: '0.775rem',
            height: '24px',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& th': {
              backgroundColor: '#F4F1EA',
              color: '#5A6672',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderBottom: '1px solid #E2E6EA',
              padding: '12px 16px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #E2E6EA',
            padding: '14px 16px',
            color: '#1A232A',
            fontSize: '0.875rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#FAF8F5',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: '#E2E6EA',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
