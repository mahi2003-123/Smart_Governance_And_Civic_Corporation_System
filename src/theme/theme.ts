import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getCustomTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#2563EB', // Royal Blue
        dark: '#1D4ED8',
        light: '#3B82F6',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#0284C7',
        light: '#0EA5E9',
        dark: '#0369A1',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#0F172A',
        secondary: isDark ? '#64748B' : '#475569',
      },
      divider: isDark ? 'rgba(243, 244, 246, 0.12)' : '#E2E8F0',
      success: {
        main: '#10B981',
        light: '#34D399',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
      },
      info: {
        main: '#2563EB',
        light: '#3B82F6',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      h1: {
        fontWeight: 800,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        color: isDark ? '#F8FAFC' : '#0F172A',
      },
      h2: {
        fontWeight: 800,
        fontSize: '2rem',
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
        color: isDark ? '#F8FAFC' : '#0F172A',
      },
      h3: {
        fontWeight: 700,
        fontSize: '1.6rem',
        lineHeight: 1.3,
        color: isDark ? '#F8FAFC' : '#0F172A',
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.35rem',
        lineHeight: 1.35,
        color: isDark ? '#F8FAFC' : '#0F172A',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.15rem',
        lineHeight: 1.4,
        color: isDark ? '#F8FAFC' : '#0F172A',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.4,
        color: isDark ? '#F8FAFC' : '#0F172A',
      },
      button: {
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            color: isDark ? '#F8FAFC' : '#0F172A',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${isDark ? 'rgba(243, 244, 246, 0.12)' : '#E2E8F0'}`,
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? 'rgba(243, 244, 246, 0.12)' : '#E2E8F0'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: '10px 22px',
            fontWeight: 700,
            fontSize: '0.925rem',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#1D4ED8',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            },
          },
          outlined: {
            borderColor: '#E2E8F0',
            color: '#0F172A',
            backgroundColor: '#FFFFFF',
            '&:hover': {
              borderColor: '#BFDBFE',
              backgroundColor: '#EFF6FF',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.8rem',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
