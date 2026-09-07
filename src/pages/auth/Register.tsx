import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { WardSelector } from '../../components/common/WardSelector';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Ward 1 - Central Town');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !address || !password || !confirmPassword) {
      setError('Please complete all mandatory registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entry.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the SGCS Terms of Public Service.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ward,
        role: 'CITIZEN',
        password: password.trim(),
      });
      setSuccessDialogOpen(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #E2E6EA', py: 2, px: { xs: 2, md: 6 }, backgroundColor: '#FFFFFF' }}>
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
                SGCS Citizen Portal
              </Typography>
              <Typography variant="caption" sx={{ color: '#5A6672', fontSize: '0.75rem', fontWeight: 500 }}>
                Municipal Government Registration
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

      {/* Main Split Layout */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, maxWidth: 1280, width: '100%', mx: 'auto' }}>
        
        {/* LEFT COLUMN: SGCS Identity & Statement */}
        <Box
          sx={{
            flex: { md: 5 },
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
                Official Citizen Registration
              </Typography>
            </Box>

            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, color: '#1A232A', mb: 2, letterSpacing: '-0.015em' }}>
              Register for direct civic representation.
            </Typography>

            <Typography variant="body1" sx={{ color: '#5A6672', mb: 4, lineHeight: 1.65 }}>
              Create an official citizen account to submit local infrastructure grievances, monitor repair progress, and vote on municipal ward project proposals.
            </Typography>

            <Box sx={{ pt: 3, borderTop: '1px solid #E2E6EA' }}>
              <Typography variant="caption" sx={{ color: '#5A6672', display: 'block', mb: 1 }}>
                * Note: Ward Councillor and Field Worker accounts are issued directly by Super Admin.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT COLUMN: Clean White Form */}
        <Box
          sx={{
            flex: { md: 7 },
            p: { xs: 3, sm: 6, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box sx={{ maxWidth: 540, mx: 'auto', width: '100%' }}>
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1A232A', mb: 0.5 }}>
                Create Citizen Account
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A6672' }}>
                Fill in your personal details to link your municipal ward
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '6px', fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={2.5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="reg-fn-label">Full Name (As per Govt ID)</InputLabel>
                  <OutlinedInput
                    id="register-fullname-field"
                    label="Full Name (As per Govt ID)"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonOutlinedIcon sx={{ color: '#5A6672', fontSize: 18 }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reg-email-label">Email Address</InputLabel>
                    <OutlinedInput
                      id="register-email-field"
                      label="Email Address"
                      type="email"
                      placeholder="citizen@example.com"
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
                    <InputLabel id="reg-phone-label">Mobile Phone (+91)</InputLabel>
                    <OutlinedInput
                      id="register-phone-field"
                      label="Mobile Phone (+91)"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon sx={{ color: '#5A6672', fontSize: 18 }} />
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Box>

                <FormControl fullWidth variant="outlined">
                  <InputLabel id="reg-addr-label">Residential Address</InputLabel>
                  <OutlinedInput
                    id="register-address-field"
                    label="Residential Address"
                    placeholder="Flat No, Street, Neighborhood"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <HomeOutlinedIcon sx={{ color: '#5A6672', fontSize: 18 }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <WardSelector
                  value={ward}
                  onChange={(val) => setWard(val)}
                  label="Assigned Municipal Ward"
                  required
                  helperText="Municipal ward assignment determines local councillor routing"
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reg-pass-label">Password</InputLabel>
                    <OutlinedInput
                      id="register-password-field"
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

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reg-confpass-label">Confirm Password</InputLabel>
                    <OutlinedInput
                      id="register-confirmpassword-field"
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: '#5A6672', fontSize: 18 }} />
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      id="register-agree-checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      sx={{ color: '#0F4C5C', '&.Mui-checked': { color: '#0F4C5C' } }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: '#5A6672' }}>
                      I confirm that the provided information is accurate and agree to the SGCS{' '}
                      <span style={{ color: '#0F4C5C', fontWeight: 600 }}>Terms of Public Service</span>.
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.3,
                    borderRadius: '6px',
                    backgroundColor: '#0F4C5C',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    '&:hover': { backgroundColor: '#0A343F' },
                  }}
                >
                  {loading ? 'Registering Account...' : 'Complete Account Registration'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#5A6672' }}>
                    Already registered?{' '}
                    <Link to="/login" style={{ color: '#0F4C5C', fontWeight: 700 }}>
                      Sign in to Portal
                    </Link>
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '8px', p: 1, maxWidth: 440 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1A232A', pt: 3, textAlign: 'center' }}>
          <CheckCircleOutlinedIcon sx={{ fontSize: 44, color: '#2D6A4F', mb: 1, display: 'block', mx: 'auto' }} />
          Registration Completed
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#5A6672', textAlign: 'center', lineHeight: 1.6 }}>
            Your citizen account has been successfully created. You may now log in to access your municipal ward portal.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate('/login');
            }}
            sx={{
              borderRadius: '6px',
              backgroundColor: '#0F4C5C',
              px: 4,
              '&:hover': { backgroundColor: '#0A343F' },
            }}
          >
            Proceed to Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;
