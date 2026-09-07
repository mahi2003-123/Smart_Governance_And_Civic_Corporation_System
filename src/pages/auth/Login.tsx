import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
  Divider,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import { useNavigate, Link } from 'react-router-dom';
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
      navigate(getDashboardPath(loggedUser.role));
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or user record not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Box sx={{ borderBottom: '1px solid #E5E8E4', py: 2, px: { xs: 2, md: 6 }, backgroundColor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, mx: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: '#0F4C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              SG
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A232A', lineHeight: 1.1 }}>
                SGCS Civic Portal
              </Typography>
              <Typography variant="caption" sx={{ color: '#5A6672', fontSize: '0.75rem', fontWeight: 500 }}>
                Smart Governance & Civic Corporation System
              </Typography>
            </Box>
          </Box>

          <Button
            startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/')}
            sx={{ color: '#5A6672', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#1A232A' } }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>

      {/* Main Content Split Layout */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, maxWidth: 1280, width: '100%', mx: 'auto' }}>
        
        {/* LEFT COLUMN: SGCS Identity & Statement */}
        <Box
          sx={{
            flex: { md: 1 },
            backgroundColor: '#FAF8F5',
            borderRight: { md: '1px solid #E2E6EA' },
            p: { xs: 4, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ maxWidth: 460 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: '4px', backgroundColor: '#E0F2F1', color: '#0F4C5C', mb: 3 }}>
              <AccountBalanceOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Municipal Public Digital Service
              </Typography>
            </Box>

            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, color: '#1A232A', mb: 2, letterSpacing: '-0.015em' }}>
              Public governance designed for human clarity.
            </Typography>

            <Typography variant="body1" sx={{ color: '#5A6672', mb: 4, lineHeight: 1.65 }}>
              A unified civic platform enabling citizens, ward councillors, and municipal field teams to report, triage, and resolve local infrastructure grievances.
            </Typography>

            <Box sx={{ pt: 3, borderTop: '1px solid #E2E6EA' }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <VerifiedUserOutlinedIcon sx={{ color: '#0F4C5C', fontSize: 18, mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#1A232A', fontWeight: 600 }}>
                      Direct Ward Jurisdiction Routing
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5A6672' }}>
                      Complaints automatically reach your assigned municipal ward councillor.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <VerifiedUserOutlinedIcon sx={{ color: '#0F4C5C', fontSize: 18, mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#1A232A', fontWeight: 600 }}>
                      Transparent Resolution Timelines
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5A6672' }}>
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
            
            {/* If user is already authenticated, show choice banner */}
            {isAuthenticated && user && (
              <Box sx={{ mb: 3, p: 2.5, borderRadius: '6px', border: '1px solid #0F4C5C', backgroundColor: '#E0F2F1' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F4C5C', mb: 0.5 }}>
                  Currently Logged In Session
                </Typography>
                <Typography variant="body2" sx={{ color: '#1A232A', mb: 2 }}>
                  Signed in as <strong>{user.fullName}</strong> ({user.role})
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(getDashboardPath(user.role))}
                    sx={{ backgroundColor: '#0F4C5C', color: '#FFFFFF', textTransform: 'none', '&:hover': { backgroundColor: '#0A343F' } }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => logout()}
                    sx={{ borderColor: '#0F4C5C', color: '#0F4C5C', textTransform: 'none', '&:hover': { backgroundColor: '#FFFFFF' } }}
                  >
                    Sign Out & Switch User
                  </Button>
                </Stack>
              </Box>
            )}

            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1A232A', mb: 0.5 }}>
                Portal Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A6672' }}>
                Enter your credentials to access your civic account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '6px', fontSize: '0.85rem' }}>
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
                        <EmailOutlinedIcon sx={{ color: '#5A6672', fontSize: 18 }} />
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
                        <LockOutlinedIcon sx={{ color: '#5A6672', fontSize: 18 }} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#5A6672' }}>
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
                    py: 1.2,
                    borderRadius: '6px',
                    backgroundColor: '#0F4C5C',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    '&:hover': { backgroundColor: '#0A343F' },
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Account'}
                </Button>
              </Stack>
            </Box>

            {/* Quick Fill Box */}
            <Box sx={{ mt: 3.5, pt: 2.5, borderTop: '1px solid #E5E8E4', backgroundColor: '#F8F9F7', p: 2, borderRadius: '8px' }}>
              <Typography variant="caption" sx={{ color: '#202522', fontWeight: 600, display: 'block', mb: 1.5 }}>
                DEMO LOGIN CREDENTIALS
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFillRole('admin@gnail.com', 'admin12345')}
                  sx={{ justifyContent: 'center', color: '#202522', borderColor: '#E5E8E4', textTransform: 'none', fontSize: '0.775rem' }}
                >
                  Super Admin
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFillRole('rajesh_ward4@sgcs.gov.in', 'password123')}
                  sx={{ justifyContent: 'center', color: '#202522', borderColor: '#E5E8E4', textTransform: 'none', fontSize: '0.775rem' }}
                >
                  Councillor
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFillRole('ramesh_worker@sgcs.gov.in', 'password123')}
                  sx={{ justifyContent: 'center', color: '#202522', borderColor: '#E5E8E4', textTransform: 'none', fontSize: '0.775rem' }}
                >
                  Field Worker
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFillRole('citizen@example.com', 'password123')}
                  sx={{ justifyContent: 'center', color: '#202522', borderColor: '#E5E8E4', textTransform: 'none', fontSize: '0.775rem' }}
                >
                  Citizen
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#68706B' }}>
                First-time citizen?{' '}
                <Link to="/register" style={{ color: '#496A57', fontWeight: 600 }}>
                  Register Citizen Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 2, borderTop: '1px solid #E5E8E4', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#68706B' }}>
          Toll-Free Municipal Helpline: 1800-11-2024 • Smart Governance & Civic Corporation System
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
