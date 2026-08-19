import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Avatar,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../hooks/useAuth';
import { WardSelector } from '../../components/common/WardSelector';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || 'Rahul Sharma');
  const [email, setEmail] = useState(user?.email || 'citizen@sgcs.gov.in');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user?.address || 'Flat 402, Green Valley Apartments, Main Street');
  const [ward, setWard] = useState(user?.ward || 'Ward 1 - Central Town');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all profile fields.');
      return;
    }

    if (!ward) {
      setError('Please select your municipal ward.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (updateUser) {
        updateUser({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          ward,
        });
      }
      setSuccess(true);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
          My Profile & Ward Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Manage your personal details and municipal ward association.
        </Typography>
      </Box>

      {success && (
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          onClose={() => setSuccess(false)}
          sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}
        >
          Profile details updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '16px' }}>
          {error}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* User Identity Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '20px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              backgroundColor: '#2563EB',
              fontSize: '1.5rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            {fullName.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
              Registered Citizen • {ward}
            </Typography>
          </Box>
        </Paper>

        <Box component="form" onSubmit={handleSaveProfile}>
          <Stack spacing={3}>
            {/* Full Name & Phone */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                fullWidth
                id="profile-fullname-field"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#64748B', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                id="profile-phone-field"
                label="Mobile Phone (+91)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#64748B', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldStyles}
              />
            </Box>

            {/* Email Address (ReadOnly) */}
            <TextField
              fullWidth
              disabled
              id="profile-email-field"
              label="Email Address (Registered)"
              value={email}
              helperText="Email is bound to your citizen account credentials"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={textFieldStyles}
            />

            {/* Address */}
            <TextField
              fullWidth
              id="profile-address-field"
              label="Residential Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon sx={{ color: '#64748B', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={textFieldStyles}
            />

            {/* Manual Ward Selection */}
            <WardSelector
              value={ward}
              onChange={(val) => setWard(val)}
              label="Assigned Municipal Ward"
              required
              helperText="Manual ward selection determines councillor routing and notices"
            />

            <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                py: 1.5,
                borderRadius: '16px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': {
                  backgroundColor: '#1D4ED8',
                },
              }}
            >
              {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
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
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748B',
    fontSize: '0.9rem',
    '&.Mui-focused': {
      color: '#2563EB',
      fontWeight: 600,
    },
  },
};

export default Profile;
