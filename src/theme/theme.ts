import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getCustomTheme = (mode: 'light' | 'dark') => {
  // Official Editorial Civic-Tech Design System
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: '#496A57',       // Primary Civic Green
        dark: '#304B3A',        // Dark Green
        light: '#688A77',       // Lighter Green Accent
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#304B3A',       // Dark Green Accent
        light: '#496A57',
        dark: '#1E3125',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#FFFFFF',     // Crisp White Base
        paper: '#FFFFFF',
      },
      text: {
        primary: '#202522',     // Primary Text
        secondary: '#68706B',   // Secondary Text
      },
      divider: '#E5E8E4',       // Subtle Border
      success: {
        main: '#304B3A',
        light: '#E8EFE9',       // Soft Green
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#B87A29',
        light: '#FFFBF0',
        contrastText: '#202522',
      },
      error: {
        main: '#B93829',
        light: '#FDF2F0',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#496A57',
        light: '#E8EFE9',
        contrastText: '#FFFFFF',
      },
      action: {
        hover: '#F8F9F7',       // Secondary Neutral Hover
        selected: '#E8EFE9',
      },
    },
    shape: {
      borderRadius: 6,
    },
    typography: {
      fontFamily: '"Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.18,
        letterSpacing: '-0.025em',
        color: '#202522',
      },
      h2: {
        fontWeight: 700,
        fontSize: '1.85rem',
        lineHeight: 1.25,
        letterSpacing: '-0.02em',
        color: '#202522',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.4rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        color: '#202522',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.2rem',
        lineHeight: 1.35,
        color: '#202522',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.05rem',
        lineHeight: 1.4,
        color: '#202522',
      },
      h6: {
        fontWeight: 600,
        fontSize: '0.95rem',
        lineHeight: 1.4,
        color: '#202522',
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: '0.975rem',
        color: '#202522',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        color: '#68706B',
      },
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
        color: '#202522',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.55,
        color: '#68706B',
      },
      caption: {
        fontSize: '0.775rem',
        lineHeight: 1.4,
        color: '#68706B',
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
            backgroundColor: '#FFFFFF',
            color: '#202522',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            boxShadow: 'none',
            border: '1px solid #E5E8E4',
            transition: 'border-color 0.15s ease-in-out',
            '&:hover': {
              borderColor: '#C5C9C4',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E8E4',
            boxShadow: 'none',
            borderRadius: 6,
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
            backgroundColor: '#496A57',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#304B3A',
              boxShadow: 'none',
            },
          },
          outlined: {
            borderColor: '#E5E8E4',
            color: '#202522',
            backgroundColor: '#FFFFFF',
            '&:hover': {
              borderColor: '#496A57',
              backgroundColor: '#F8F9F7',
            },
          },
          text: {
            color: '#496A57',
            '&:hover': {
              backgroundColor: '#F8F9F7',
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
              borderColor: '#E5E8E4',
            },
            '&:hover fieldset': {
              borderColor: '#68706B',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#496A57',
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#68706B',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#496A57',
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
              backgroundColor: '#F8F9F7',
              color: '#68706B',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderBottom: '1px solid #E5E8E4',
              padding: '12px 16px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #E5E8E4',
            padding: '14px 16px',
            color: '#202522',
            fontSize: '0.875rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#F8F9F7',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: '#E5E8E4',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
