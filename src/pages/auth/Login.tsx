import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Stack,
  Card,
  FormControl,
  InputLabel,
  OutlinedInput,
  Tooltip,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  EmailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  BackArrowIcon,
  SupportIcon,
  CityIcon,
} from '../../components/common/Icons';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@gnail.com');
  const [password, setPassword] = useState('admin12345');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'COUNCILLOR') {
        navigate('/councillor/dashboard');
      } else if (user.role === 'WORKER') {
        navigate('/worker/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email.trim(), password.trim());
      
      // Navigate based on assigned system role
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'COUNCILLOR') {
        navigate('/councillor/dashboard');
      } else if (loggedUser.role === 'WORKER') {
        navigate('/worker/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or user not found in PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillSuperAdmin = () => {
    setEmail('admin@gnail.com');
    setPassword('admin12345');
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Box sx={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', py: 2, px: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                SG
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  CivicSphere SGCS
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                  Smart Governance & Civic Corporation System
                </Typography>
              </Box>
            </Box>

            <Button
              startIcon={<BackArrowIcon size={18} color="#64748B" />}
              onClick={() => navigate('/')}
              sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none', borderRadius: '20px' }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content Area - Centered Card */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 6 }, px: 2 }}>
        <Container maxWidth="xs" sx={{ maxWidth: '480px !important' }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
                SGCS Portal Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Sign in with Super Admin or registered user credentials
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2.5, borderRadius: '12px', fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={2.5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="login-email-label" sx={{ color: '#64748B', fontSize: '0.9rem' }}>Email Address</InputLabel>
                  <OutlinedInput
                    id="login-email-field"
                    label="Email Address"
                    placeholder="e.g. admin@sgcs.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailIcon color="#64748B" size={18} />
                      </InputAdornment>
                    }
                    sx={inputStyles}
                  />
                </FormControl>

                <FormControl fullWidth variant="outlined">
                  <InputLabel id="login-password-label" sx={{ color: '#64748B', fontSize: '0.9rem' }}>Password</InputLabel>
                  <OutlinedInput
                    id="login-password-field"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <LockIcon color="#64748B" size={18} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748B' }}
                        >
                          {showPassword ? <EyeOffIcon size={18} color="#64748B" /> : <EyeIcon size={18} color="#64748B" />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={inputStyles}
                  />
                </FormControl>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.4,
                    borderRadius: '16px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    '&:hover': {
                      backgroundColor: '#1D4ED8',
                    },
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In to System'}
                </Button>
              </Stack>
            </Box>

            {/* Super Admin & Councillor Quick Fill Section */}
            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid #F1F5F9',
                backgroundColor: '#F8FAFC',
                p: 2,
                borderRadius: '16px',
              }}
            >
              <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.02em' }}>
                🔑 DEMO SYSTEM LOGIN CREDENTIALS
              </Typography>

              <Stack spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={handleFillSuperAdmin}
                  startIcon={<CityIcon size={16} color="#10B981" />}
                  sx={{
                    borderRadius: '12px',
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    backgroundColor: '#FFFFFF',
                    '&:hover': { backgroundColor: '#F1F5F9', borderColor: '#2563EB' }
                  }}
                >
                  Auto-Fill Super Admin Credentials
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setEmail('rajesh_ward4@sgcs.gov.in');
                    setPassword('password123');
                    setError('');
                  }}
                  startIcon={<CityIcon size={16} color="#2563EB" />}
                  sx={{
                    borderRadius: '12px',
                    borderColor: '#CBD5E1',
                    color: '#1E40AF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    backgroundColor: '#FFFFFF',
                    '&:hover': { backgroundColor: '#F1F5F9', borderColor: '#2563EB' }
                  }}
                >
                  Auto-Fill Ward 4 Councillor Credentials
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.875rem' }}>
                Citizen registering for first time?{' '}
                <Link to="/register" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                  Register Citizen Account
                </Link>
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1 }}>
                *(Councillors & Field Workers are registered directly by Super Admin)*
              </Typography>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 2, borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#64748B' }}>
          <SupportIcon size={16} color="#64748B" />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Toll-Free Civic Helpline: 1800-11-2024 (24/7 Support)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const inputStyles = {
  borderRadius: '12px',
  backgroundColor: '#FFFFFF',
  fontSize: '0.9rem',
  '& fieldset': { borderColor: '#E2E8F0' },
  '&:hover fieldset': { borderColor: '#CBD5E1' },
  '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
};

export default Login;
