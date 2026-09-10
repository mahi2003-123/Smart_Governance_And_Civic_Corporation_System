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
  FormHelperText,
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
import AddIcon from '@mui/icons-material/Add';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Validation regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/; // 10-digit mobile number starting with 6, 7, 8, or 9
  const nameRegex = /^[a-zA-Z\s.]{2,50}$/;

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    } else if (!nameRegex.test(fullName.trim())) {
      errors.fullName = 'Please enter a valid name (alphabets only, min 2 chars).';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. user@example.com).';
    }

    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    const numberToCheck = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;
    if (!phone.trim()) {
      errors.phone = 'Mobile phone number is required.';
    } else if (!phoneRegex.test(numberToCheck)) {
      errors.phone = 'Phone number must be a 10-digit number starting with 6, 7, 8, or 9.';
    }

    if (!address.trim()) {
      errors.address = 'Residential address is required.';
    } else if (address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters long.';
    }

    if (!ward) {
      errors.ward = 'Please select your assigned municipal ward.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service to register.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateFields()) {
      setError('Please resolve all validation errors highlighted below before proceeding.');
      return;
    }

    setLoading(true);

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
      setError(err.message || 'Registration failed. Network error or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FBFDFB', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
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
                SGCS Citizen Portal
              </Typography>
              <Typography variant="caption" sx={{ color: '#5F7367', fontSize: '0.75rem', fontWeight: 500 }}>
                Smart Governance & Civic Registration
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

      {/* Main Split Layout */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, maxWidth: 1280, width: '100%', mx: 'auto' }}>
        
        {/* LEFT COLUMN: SGCS Identity */}
        <Box
          sx={{
            flex: { md: 5 },
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
                Citizen Account Registration
              </Typography>
            </Box>

            <Typography variant="h2" component="h1" sx={{ fontWeight: 900, color: '#1C2A24', mb: 2, letterSpacing: '-0.025em' }}>
              Register for direct civic representation.
            </Typography>

            <Typography variant="body1" sx={{ color: '#5F7367', mb: 4, lineHeight: 1.65 }}>
              Create a citizen account to submit local infrastructure grievances, monitor repair progress, and vote on municipal ward project proposals.
            </Typography>

            <Box sx={{ pt: 3, borderTop: '1px solid #E2EAF0' }}>
              <Typography variant="caption" sx={{ color: '#5F7367', display: 'block' }}>
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
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#1C2A24', mb: 0.5 }}>
                Create Citizen Account
              </Typography>
              <Typography variant="body2" sx={{ color: '#5F7367' }}>
                Fill in your personal details to link your municipal ward
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '12px', fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={2.5}>
                <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.fullName)}>
                  <InputLabel id="reg-fn-label">Full Name *</InputLabel>
                  <OutlinedInput
                    id="register-fullname-field"
                    label="Full Name *"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonOutlinedIcon sx={{ color: fieldErrors.fullName ? '#d32f2f' : '#5F7367', fontSize: 18 }} />
                      </InputAdornment>
                    }
                  />
                  {fieldErrors.fullName && <FormHelperText error>{fieldErrors.fullName}</FormHelperText>}
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.email)}>
                    <InputLabel id="reg-email-label">Email Address *</InputLabel>
                    <OutlinedInput
                      id="register-email-field"
                      label="Email Address *"
                      type="email"
                      placeholder="citizen@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: fieldErrors.email ? '#d32f2f' : '#5F7367', fontSize: 18 }} />
                        </InputAdornment>
                      }
                    />
                    {fieldErrors.email && <FormHelperText error>{fieldErrors.email}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.phone)}>
                    <InputLabel id="reg-phone-label">Mobile Phone *</InputLabel>
                    <OutlinedInput
                      id="register-phone-field"
                      label="Mobile Phone *"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon sx={{ color: fieldErrors.phone ? '#d32f2f' : '#5F7367', fontSize: 18 }} />
                        </InputAdornment>
                      }
                    />
                    {fieldErrors.phone && <FormHelperText error>{fieldErrors.phone}</FormHelperText>}
                  </FormControl>
                </Box>

                <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.address)}>
                  <InputLabel id="reg-addr-label">Residential Address *</InputLabel>
                  <OutlinedInput
                    id="register-address-field"
                    label="Residential Address *"
                    placeholder="Flat No, Street, Neighborhood"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
                    }}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <HomeOutlinedIcon sx={{ color: fieldErrors.address ? '#d32f2f' : '#5F7367', fontSize: 18 }} />
                      </InputAdornment>
                    }
                  />
                  {fieldErrors.address && <FormHelperText error>{fieldErrors.address}</FormHelperText>}
                </FormControl>

                <WardSelector
                  value={ward}
                  onChange={(val) => {
                    setWard(val);
                    if (fieldErrors.ward) setFieldErrors((prev) => ({ ...prev, ward: '' }));
                  }}
                  label="Assigned Municipal Ward *"
                  required
                  helperText={fieldErrors.ward || 'Municipal ward assignment determines local councillor routing'}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.password)}>
                    <InputLabel id="reg-pass-label">Password *</InputLabel>
                    <OutlinedInput
                      id="register-password-field"
                      label="Password *"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: fieldErrors.password ? '#d32f2f' : '#5F7367', fontSize: 18 }} />
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
                    {fieldErrors.password && <FormHelperText error>{fieldErrors.password}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.confirmPassword)}>
                    <InputLabel id="reg-confpass-label">Confirm Password *</InputLabel>
                    <OutlinedInput
                      id="register-confirmpassword-field"
                      label="Confirm Password *"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: fieldErrors.confirmPassword ? '#d32f2f' : '#5F7367', fontSize: 18 }} />
                        </InputAdornment>
                      }
                    />
                    {fieldErrors.confirmPassword && <FormHelperText error>{fieldErrors.confirmPassword}</FormHelperText>}
                  </FormControl>
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="register-agree-checkbox"
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          if (fieldErrors.agreeTerms) setFieldErrors((prev) => ({ ...prev, agreeTerms: '' }));
                        }}
                        sx={{ color: fieldErrors.agreeTerms ? '#d32f2f' : '#1F4D3A', '&.Mui-checked': { color: '#1F4D3A' } }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: fieldErrors.agreeTerms ? '#d32f2f' : '#5F7367' }}>
                        I confirm that the provided details are accurate and agree to the SGCS{' '}
                        <span style={{ color: '#1F4D3A', fontWeight: 700 }}>Terms of Service</span>.
                      </Typography>
                    }
                  />
                  {fieldErrors.agreeTerms && <FormHelperText error sx={{ ml: 4 }}>{fieldErrors.agreeTerms}</FormHelperText>}
                </Box>

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
                  {loading ? 'Registering Account...' : 'Complete Account Registration'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#5F7367' }}>
                    Already registered?{' '}
                    <Link to="/login" style={{ color: '#1F4D3A', fontWeight: 700, textDecoration: 'none' }}>
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
            sx: { borderRadius: '20px', p: 1, maxWidth: 440 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#1C2A24', pt: 3, textAlign: 'center' }}>
          <CheckCircleOutlinedIcon sx={{ fontSize: 44, color: '#1F4D3A', mb: 1, display: 'block', mx: 'auto' }} />
          Registration Completed
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#5F7367', textAlign: 'center', lineHeight: 1.6 }}>
            Your citizen account has been successfully created in the SGCS database. You may now log in to access your municipal ward portal.
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
              borderRadius: '50px',
              backgroundColor: '#1F4D3A',
              color: '#FFFFFF',
              px: 4,
              '&:hover': { backgroundColor: '#16382A' },
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
