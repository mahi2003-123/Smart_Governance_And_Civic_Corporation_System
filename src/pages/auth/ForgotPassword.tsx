import React, { useState } from 'react';
import { Box, Container, Card, CardContent, Typography, InputAdornment, Alert } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FBFDFB', display: 'flex', alignItems: 'center', py: 6 }}>
      <Container maxWidth="xs">
        <Card sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, boxShadow: '0 16px 40px rgba(31, 77, 58, 0.08)', border: '1px solid #E2EAF0' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
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
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1C2A24' }}>
                Reset Password
              </Typography>
              <Typography variant="body2" sx={{ color: '#5F7367' }}>
                Enter your email address to receive password reset instructions.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {submitted ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Instructions have been sent to <strong>{email}</strong>. Please check your inbox.
                </Alert>
                <CustomButton fullWidth onClick={() => navigate('/reset-password')}>
                  Proceed to Reset Link Demo
                </CustomButton>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <CustomTextField
                  label="Registered Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <CustomButton type="submit" fullWidth size="large" loading={loading} sx={{ mb: 3 }}>
                  Send Recovery Link
                </CustomButton>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    component={RouterLink}
                    to="/login"
                    sx={{ color: '#1F4D3A', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    Back to Sign In
                  </Typography>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
