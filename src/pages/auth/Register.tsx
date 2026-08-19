import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  MenuItem,
  Stack,
  FormControlLabel,
  Checkbox,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { WardSelector } from '../../components/common/WardSelector';

import {
  EmailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  BackArrowIcon,
  CheckIcon,
  CityIcon,
  PersonIcon,
  PhoneIcon,
  HomeIcon,
  SupportIcon,
} from '../../components/common/Icons';

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

  const wards = [
    'Ward 1 - Central Town',
    'Ward 2 - Riverside North',
    'Ward 3 - Heritage Hill',
    'Ward 4 - Metro Suburbs',
    'Ward 5 - Industrial Park',
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !address || !password || !confirmPassword) {
      setError('Please fill in all mandatory registration fields.');
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
      setError('Please agree to the SGCS Terms of Civic Service.');
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
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
                  Citizen Portal • Government of State
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

      {/* Main Content Area - Clean Centered Registration Card */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 6 }, px: 2 }}>
        <Container maxWidth="sm" sx={{ maxWidth: '640px !important' }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
                Create Citizen Account
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Register to file grievances, track pothole fixes, and vote on ward proposals
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '12px', fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={2.5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="reg-fn-label" sx={{ color: '#64748B' }}>Full Name (As per Govt ID)</InputLabel>
                  <OutlinedInput
                    id="register-fullname-field"
                    label="Full Name (As per Govt ID)"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="#64748B" size={18} />
                      </InputAdornment>
                    }
                    sx={inputStyles}
                  />
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reg-email-label" sx={{ color: '#64748B' }}>Email Address</InputLabel>
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
                          <EmailIcon color="#64748B" size={18} />
                        </InputAdornment>
                      }
                      sx={inputStyles}
                    />
                  </FormControl>

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reg-phone-label" sx={{ color: '#64748B' }}>Mobile Phone (+91)</InputLabel>
                    <OutlinedInput
                      id="register-phone-field"
                      label="Mobile Phone (+91)"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <PhoneIcon color="#64748B" size={18} />
                        </InputAdornment>
                      }
                      sx={inputStyles}
                    />
                  </FormControl>
                </Box>

                <FormControl fullWidth variant="outlined">
                  <InputLabel id="reg-addr-label" sx={{ color: '#64748B' }}>Residential Address</InputLabel>
                  <OutlinedInput
                    id="register-address-field"
                    label="Residential Address"
                    placeholder="Flat No, Street, Neighborhood"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <HomeIcon color="#64748B" size={18} />
                      </InputAdornment>
                    }
                    sx={inputStyles}
                  />
                </FormControl>

                <WardSelector
                  value={ward}
                  onChange={(val) => setWard(val)}
                  label="Assigned Municipal Ward"
                  required
                  helperText="Manual ward selection required for civic routing"
                />


                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reg-pass-label" sx={{ color: '#64748B' }}>Password</InputLabel>
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

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reg-confpass-label" sx={{ color: '#64748B' }}>Confirm Password</InputLabel>
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
                          <LockIcon color="#64748B" size={18} />
                        </InputAdornment>
                      }
                      sx={inputStyles}
                    />
                  </FormControl>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      id="register-agree-checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      sx={{ color: '#2563EB', '&.Mui-checked': { color: '#2563EB' } }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      I confirm that the information provided is accurate and agree to the SGCS{' '}
                      <span style={{ color: '#2563EB', fontWeight: 700 }}>Terms of Civic Service</span> &{' '}
                      <span style={{ color: '#2563EB', fontWeight: 700 }}>Privacy Policy</span>.
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '16px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
                    '&:hover': {
                      backgroundColor: '#1D4ED8',
                    },
                  }}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Already registered?{' '}
                    <Link to="/login" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                      Sign in to Portal
                    </Link>
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Clean Bottom Footer */}
      <Box sx={{ py: 2, borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#64748B' }}>
          <SupportIcon size={16} color="#64748B" />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Municipal Registration Support: support@sgcs.gov.in (24/7 Helpline: 1800-11-2024)
          </Typography>
        </Box>
      </Box>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: 'rgba(15, 23, 42, 0.4)' },
          },
        }}
      >
        <DialogTitle sx={{ pt: 3, textAlign: 'center' }}>
          <CheckIcon size={56} color="#10B981" style={{ marginBottom: 8 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Registration Successful!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, textAlign: 'center' }}>
            Your citizen account has been successfully created. You can now log in to access your ward dashboard.
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
              borderRadius: '20px',
              backgroundColor: '#2563EB',
              px: 4,
              py: 1,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1D4ED8' },
            }}
          >
            Continue to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const inputStyles = {
  borderRadius: '12px',
  backgroundColor: '#FFFFFF',
  fontSize: '0.9rem',
  '& fieldset': {
    borderColor: '#E2E8F0',
  },
  '&:hover fieldset': {
    borderColor: '#CBD5E1',
  },
  '&.Mui-focused fieldset': {
    borderColor: '#2563EB',
    borderWidth: '1.5px',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
  },
};

export default Register;
