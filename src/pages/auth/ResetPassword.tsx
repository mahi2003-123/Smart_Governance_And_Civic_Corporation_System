import React, { useState } from 'react';
import { Box, Container, Card, CardContent, Typography, InputAdornment, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { useNavigate } from 'react-router-dom';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 600);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FBFDFB', display: 'flex', alignItems: 'center', py: 6 }}>
      <Container maxWidth="xs">
        <Card sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, boxShadow: '0 16px 40px rgba(31, 77, 58, 0.08)', border: '1px solid #E2EAF0' }}>
          <CardContent sx={{ p: 0 }}>
            <Box textAlign="center" mb={3}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  bgcolor: '#E8F3EE',
                  color: '#1F4D3A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <LocationCityIcon />
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#1C2A24' }}>
                Set New Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: '#5F7367' }}>
                Choose a strong security password for your SGCS account.
              </Typography>
            </Box>

            {success ? (
              <Box textAlign="center">
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Your password has been successfully updated!
                </Alert>
                <CustomButton fullWidth onClick={() => navigate('/login')}>
                  Back to Sign In
                </CustomButton>
              </Box>
            ) : (
              <form onSubmit={handleReset}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}
                <CustomTextField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#1F4D3A' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <CustomTextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#1F4D3A' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <CustomButton type="submit" fullWidth size="large" loading={loading} sx={{ mt: 1 }}>
                  Update Password
                </CustomButton>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
