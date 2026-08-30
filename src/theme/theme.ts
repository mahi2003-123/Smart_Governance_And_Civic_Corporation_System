import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getCustomTheme = (mode: 'light' | 'dark') => {
  // Pure white civic portal theme
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: '#496A57',
        dark: '#304B3A',
        light: '#6B8E7B',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#68706B',
        light: '#8E9691',
        dark: '#49504C',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#202522',
        secondary: '#68706B',
      },
      divider: '#E5E8E4',
      success: {
        main: '#527A5E',
        light: '#E8EFE9',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#B58A45',
        light: '#FBF4E8',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#B45D59',
        light: '#FDF2F2',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#496A57',
        light: '#E8EFE9',
        contrastText: '#FFFFFF',
      },
      action: {
        hover: '#F3F5F2',
        selected: '#E8EFE9',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: '"Inter", "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '2.1rem',
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
        color: '#202522',
      },
      h2: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        color: '#202522',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.4rem',
        lineHeight: 1.35,
        color: '#202522',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.2rem',
        lineHeight: 1.4,
        color: '#202522',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.05rem',
        lineHeight: 1.45,
        color: '#202522',
      },
      h6: {
        fontWeight: 600,
        fontSize: '0.95rem',
        lineHeight: 1.45,
        color: '#202522',
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '0.95rem',
        color: '#202522',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        color: '#68706B',
      },
      body1: {
        fontSize: '0.925rem',
        lineHeight: 1.6,
        color: '#202522',
      },
      body2: {
        fontSize: '0.85rem',
        lineHeight: 1.55,
        color: '#68706B',
      },
      caption: {
        fontSize: '0.775rem',
        lineHeight: 1.4,
        color: '#68706B',
      },
      button: {
        fontWeight: 500,
        fontSize: '0.875rem',
        textTransform: 'none',
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
            borderRadius: 10,
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            boxShadow: 'none',
            border: '1px solid #E5E8E4',
            transition: 'border-color 0.15s ease, background-color 0.15s ease',
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
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 500,
            fontSize: '0.875rem',
            boxShadow: 'none',
            transition: 'all 0.15s ease',
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
              backgroundColor: '#F3F5F2',
            },
          },
          text: {
            color: '#496A57',
            '&:hover': {
              backgroundColor: '#F3F5F2',
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
              borderColor: '#E5E8E4',
            },
            '&:hover fieldset': {
              borderColor: '#68706B',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#496A57',
              borderWidth: '1px',
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
            borderRadius: 6,
            fontWeight: 500,
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
              fontWeight: 600,
              fontSize: '0.775rem',
              letterSpacing: '0.04em',
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
              backgroundColor: '#F3F5F2',
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
