import React, { useState } from 'react';
import { Box, Container, Card, CardContent, Typography, TextField, Stack, Alert } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../../components/common/CustomButton';

export const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['5', '9', '2', '4', '8', '1']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
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
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#E8F3EE',
                  color: '#1F4D3A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <MarkEmailReadIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#1C2A24' }}>
                Verify Email Address
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: '#5F7367' }}>
                We sent a 6-digit verification security code to your registered email address.
              </Typography>
            </Box>

            {verified ? (
              <Box textAlign="center">
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Email verified successfully! Welcome to SGCS Civic Platform.
                </Alert>
                <CustomButton fullWidth onClick={() => navigate('/citizen/dashboard')}>
                  Go to Citizen Dashboard
                </CustomButton>
              </Box>
            ) : (
              <form onSubmit={handleVerify}>
                <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
                  {otp.map((digit, i) => (
                    <TextField
                      key={i}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      inputProps={{
                        maxLength: 1,
                        style: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, padding: '12px' },
                      }}
                      sx={{ width: 44 }}
                    />
                  ))}
                </Stack>

                <CustomButton type="submit" fullWidth size="large" loading={loading} sx={{ mb: 2 }}>
                  Verify Code
                </CustomButton>

                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" sx={{ color: '#5F7367' }}>
                    Didn't receive code?{' '}
                    <Typography
                      component="span"
                      sx={{ color: '#1F4D3A', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => alert('Verification code resent!')}
                    >
                      Resend Code
                    </Typography>
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
