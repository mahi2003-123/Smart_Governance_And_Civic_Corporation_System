import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Avatar,
  Divider,
  InputAdornment,
  Chip,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useAuth } from '../../hooks/useAuth';
import { WardSelector } from '../../components/common/WardSelector';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || 'Rahul Sharma');
  const [email] = useState(user?.email || 'citizen@sgcs.gov.in');
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
    <Box sx={{ maxWidth: 760, mx: 'auto', pb: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1, letterSpacing: '-0.015em' }}>
          Government Service Account Profile
        </Typography>
        <Typography variant="body1" sx={{ color: '#68706B' }}>
          Official citizen registration record and municipal ward jurisdiction settings.
        </Typography>
      </Box>

      {success && (
        <Alert
          icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
          severity="success"
          onClose={() => setSuccess(false)}
          sx={{ mb: 4, borderRadius: '6px' }}
        >
          Citizen profile details updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 4, borderRadius: '6px' }}>
          {error}
        </Alert>
      )}

      {/* Main Profile Form structured with sections & dividers */}
      <Box component="form" onSubmit={handleSaveProfile} sx={{ border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF', p: { xs: 3, sm: 5 } }}>
        
        {/* Profile Identity Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pb: 4, mb: 4, borderBottom: '1px solid #E5E8E4' }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: '#496A57',
              color: '#FFFFFF',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {fullName.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', mb: 0.5, fontSize: '1.25rem' }}>
              {fullName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label="Registered Citizen" size="small" sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', height: 20 }} />
              <Typography variant="caption" sx={{ color: '#68706B' }}>
                {ward}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack spacing={4}>
          {/* Section 1: Personal Information */}
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
              1. PERSONAL INFORMATION
            </Typography>
            <Divider sx={{ mb: 2.5, borderColor: '#E5E8E4' }} />

            <TextField
              fullWidth
              id="profile-fullname-field"
              label="Full Name (Official Record)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ color: '#68706B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Section 2: Ward & Address */}
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
              2. WARD JURISDICTION & RESIDENCE
            </Typography>
            <Divider sx={{ mb: 2.5, borderColor: '#E5E8E4' }} />

            <Stack spacing={2.5}>
              <WardSelector
                value={ward}
                onChange={(val) => setWard(val)}
                label="Assigned Municipal Ward"
                required
                helperText="Ward selection determines councillor routing and notices"
              />

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
                        <HomeOutlinedIcon sx={{ color: '#68706B', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Section 3: Contact & Credentials */}
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
              3. CONTACT & CREDENTIALS
            </Typography>
            <Divider sx={{ mb: 2.5, borderColor: '#E5E8E4' }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                fullWidth
                disabled
                id="profile-email-field"
                label="Registered Email Address"
                value={email}
                helperText="Email is bound to citizen credentials"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#8E9691', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
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
                        <PhoneOutlinedIcon sx={{ color: '#68706B', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </Box>

          {/* Save Action */}
          <Box sx={{ pt: 2, borderTop: '1px solid #E5E8E4', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              startIcon={<SaveOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                py: 1.2,
                px: 4,
                borderRadius: '8px',
                backgroundColor: '#496A57',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '0.9rem',
                '&:hover': { backgroundColor: '#304B3A' },
              }}
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Profile;
