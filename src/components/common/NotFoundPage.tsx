import React from 'react';
import { Box, Typography, Button, Container, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

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
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{ borderRadius: '6px', px: 4, bgcolor: '#1F4D3A', '&:hover': { bgcolor: '#16382A' }, textTransform: 'none', fontWeight: 700 }}
        >
          Return to Portal Home
        </Button>
      </Card>
    </Container>
  );
};

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

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
          Access Restricted
        </Typography>
        <Typography variant="body1" sx={{ color: '#5A6672', maxWidth: 500, mx: 'auto', mb: 4 }}>
          You do not have the required administrative clearance to access this module. Please switch to an authorized role or contact system administration.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{ borderRadius: '6px', px: 4, bgcolor: '#1F4D3A', '&:hover': { bgcolor: '#16382A' }, textTransform: 'none', fontWeight: 700 }}
        >
          Go Back to Safety
        </Button>
      </Card>
    </Container>
  );
};
