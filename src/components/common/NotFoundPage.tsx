import React from 'react';
import { Box, Typography, Button, Container, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useAuth } from '../../hooks/useAuth';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  const handleGoHome = () => {
    if (!user) {
      navigate('/');
      return;
    }
    switch (user.role?.toUpperCase()) {
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

  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Card
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '8px',
          backgroundColor: '#FBFDFB',
          border: '1px solid #E2EAF0',
        }}
      >
        <MapOutlinedIcon sx={{ fontSize: 80, color: '#1F4D3A', mb: 2 }} />
        <Typography variant="h1" sx={{ color: '#1F4D3A', fontWeight: 800, mb: 1 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C2A24', mb: 2 }}>
          Civic Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: '#5F7367', maxWidth: 500, mx: 'auto', mb: 4 }}>
          The page or civic resource you are searching for does not exist or has been moved to another ward directory.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleGoBack}
            sx={{ borderRadius: '6px', px: 3, borderColor: '#1F4D3A', color: '#1F4D3A', textTransform: 'none', fontWeight: 700 }}
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
            {user ? 'Return to Dashboard' : 'Return to Portal Home'}
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  const handleGoHome = () => {
    if (!user) {
      navigate('/');
      return;
    }
    switch (user.role?.toUpperCase()) {
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

  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Card
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '6px',
          backgroundColor: '#FAF8F5',
          border: '1px solid #E2E6EA',
          borderLeft: '6px solid #C0392B',
        }}
      >
        <SecurityIcon sx={{ fontSize: 80, color: '#C0392B', mb: 2 }} />
        <Typography variant="h1" sx={{ color: '#C0392B', fontWeight: 800, mb: 1 }}>
          403
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A232A', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#5A6672', maxWidth: 500, mx: 'auto', mb: 4 }}>
          You do not have the required administrative clearance to access this module. Please switch to an authorized role or return to safety.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleGoBack}
            sx={{ borderRadius: '6px', px: 3, borderColor: '#C0392B', color: '#C0392B', textTransform: 'none', fontWeight: 700 }}
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
            {user ? 'Return to Dashboard' : 'Return to Portal Home'}
          </Button>
        </Box>
      </Card>
    </Container>
  );
};
