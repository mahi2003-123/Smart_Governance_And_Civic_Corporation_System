import React from 'react';
import { Box, Typography, Button, Container, Card } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AccessDeniedStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({
  title = 'Access Restricted (403)',
  message = 'You do not have the required permissions or ward clearance to access these records.',
  onRetry,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    switch (user?.role?.toUpperCase()) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'COUNCILLOR':
        navigate('/councillor/dashboard');
        break;
      case 'WORKER':
        navigate('/worker/dashboard');
        break;
      default:
        navigate('/citizen/dashboard');
        break;
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          borderRadius: '8px',
          backgroundColor: '#FAF8F5',
          border: '1px solid #E2E6EA',
          borderLeft: '6px solid #C0392B',
        }}
      >
        <SecurityIcon sx={{ fontSize: 70, color: '#C0392B', mb: 2 }} />
        <Typography variant="h2" sx={{ color: '#C0392B', fontWeight: 800, mb: 1, fontSize: '2.5rem' }}>
          403
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A232A', mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#5A6672', maxWidth: 520, mx: 'auto', mb: 4 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {onRetry && (
            <Button
              variant="outlined"
              size="large"
              onClick={onRetry}
              sx={{ borderRadius: '6px', px: 3, borderColor: '#C0392B', color: '#C0392B', textTransform: 'none', fontWeight: 700 }}
            >
              Try Again
            </Button>
          )}
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleGoBack}
            sx={{ borderRadius: '6px', px: 3, borderColor: '#5A6672', color: '#5A6672', textTransform: 'none', fontWeight: 700 }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeOutlinedIcon />}
            onClick={handleGoHome}
            sx={{ borderRadius: '6px', px: 4, bgcolor: '#1F4D3A', '&:hover': { bgcolor: '#16382A' }, textTransform: 'none', fontWeight: 700 }}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default AccessDeniedState;
