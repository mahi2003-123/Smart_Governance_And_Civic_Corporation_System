import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout, user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDashboardPath = (role?: string) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'COUNCILLOR': return '/councillor/dashboard';
      case 'WORKER': return '/worker/dashboard';
      default: return '/citizen/dashboard';
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email address and password.');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email.trim(), password.trim());
      navigate(getDashboardPath(loggedUser.role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or user record not found.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FBFDFB', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Header */}
      <Box sx={{ borderBottom: '1px solid #E2EAF0', py: 2, px: { xs: 2, md: 6 }, backgroundColor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, mx: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                backgroundColor: '#1F4D3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(31, 77, 58, 0.25)',
              }}
            >
              <AddIcon sx={{ fontSize: 22, fontWeight: 900 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1C2A24', lineHeight: 1.1 }}>
                SGCS Civic Portal
              </Typography>
              <Typography variant="caption" sx={{ color: '#5F7367', fontSize: '0.75rem', fontWeight: 500 }}>
                Smart Governance & Civic Corporation System
              </Typography>
            </Box>
          </Box>

          <Button
            startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/')}
            sx={{ color: '#5F7367', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#1F4D3A' } }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>

      {/* Main Content Split Layout */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, maxWidth: 1280, width: '100%', mx: 'auto' }}>
        
        {/* LEFT COLUMN: SGCS Statement */}
        <Box
          sx={{
            flex: { md: 1 },
            backgroundColor: '#F2F7F4',
            borderRight: { md: '1px solid #E2EAF0' },
            p: { xs: 4, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ maxWidth: 460 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: '20px', backgroundColor: '#E8F3EE', color: '#1F4D3A', mb: 3 }}>
              <AccountBalanceOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Municipal Digital Platform
              </Typography>
            </Box>

            <Typography variant="h2" component="h1" sx={{ fontWeight: 900, color: '#1C2A24', mb: 2, letterSpacing: '-0.025em' }}>
              Public governance designed for human clarity.
            </Typography>

            <Typography variant="body1" sx={{ color: '#5F7367', mb: 4, lineHeight: 1.65 }}>
              A unified civic platform enabling citizens, ward councillors, and municipal field teams to report, triage, and resolve local infrastructure grievances.
            </Typography>

            <Box sx={{ pt: 3, borderTop: '1px solid #E2EAF0' }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <VerifiedUserOutlinedIcon sx={{ color: '#1F4D3A', fontSize: 18, mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#1C2A24', fontWeight: 700 }}>
                      Direct Ward Jurisdiction Routing
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5F7367' }}>
                      Complaints automatically reach your assigned municipal ward councillor.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <VerifiedUserOutlinedIcon sx={{ color: '#1F4D3A', fontSize: 18, mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#1C2A24', fontWeight: 700 }}>
                      Transparent Resolution Timelines
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5F7367' }}>
                      Track worker assignments, status updates, and repair evidence in real time.
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* RIGHT COLUMN: Clean White Login Form */}
        <Box
          sx={{
            flex: { md: 1 },
            p: { xs: 3, sm: 6, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box sx={{ maxWidth: 420, mx: 'auto', width: '100%' }}>
            
            {/* If user is already authenticated */}
            {isAuthenticated && user && (
              <Box sx={{ mb: 3, p: 2.5, borderRadius: '16px', border: '1px solid #E2EAF0', backgroundColor: '#FBFDFB' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1F4D3A', mb: 0.5 }}>
                  Currently Logged In Session
                </Typography>
                <Typography variant="body2" sx={{ color: '#1C2A24', mb: 2 }}>
                  Signed in as <strong>{user.fullName}</strong> ({user.role})
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(getDashboardPath(user.role))}
                    sx={{
                      backgroundColor: '#1F4D3A',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#16382A' },
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => logout()}
                    sx={{ borderColor: '#1F4D3A', color: '#1F4D3A', textTransform: 'none', '&:hover': { backgroundColor: '#E8F3EE' } }}
                  >
                    Sign Out & Switch User
                  </Button>
                </Stack>
              </Box>
            )}

            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#1C2A24', mb: 0.5 }}>
                Portal Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: '#5F7367' }}>
                Enter your credentials to access your civic account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '12px', fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={2.5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="login-email-label">Email Address</InputLabel>
                  <OutlinedInput
                    id="login-email-input"
                    label="Email Address"
                    placeholder="Enter registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#5F7367', fontSize: 18 }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <FormControl fullWidth variant="outlined">
                  <InputLabel id="login-password-label">Password</InputLabel>
                  <OutlinedInput
                    id="login-password-input"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#5F7367', fontSize: 18 }} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#5F7367' }}>
                          {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.4,
                    borderRadius: '50px',
                    backgroundColor: '#1F4D3A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: '0 6px 18px rgba(31, 77, 58, 0.25)',
                    '&:hover': {
                      backgroundColor: '#16382A',
                      boxShadow: '0 8px 22px rgba(31, 77, 58, 0.35)',
                    },
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Account'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#5F7367' }}>
                First-time citizen?{' '}
                <Link to="/register" style={{ color: '#1F4D3A', fontWeight: 700, textDecoration: 'none' }}>
                  Register Citizen Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 2, borderTop: '1px solid #E2EAF0', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#5F7367' }}>
          Smart Governance & Civic Corporation System (SGCS) Platform
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
