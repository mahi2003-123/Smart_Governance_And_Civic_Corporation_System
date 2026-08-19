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
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F5F2 100%)',
        }}
      >
        <MapOutlinedIcon sx={{ fontSize: 80, color: '#6F4E37', mb: 2 }} />
        <Typography variant="h1" color="primary" fontWeight={800} gutterBottom>
          404
        </Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Civic Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={500} mx="auto" mb={4}>
          The page or civic resource you are searching for does not exist or has been moved to another ward directory.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{ borderRadius: 28, px: 4 }}
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
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 4,
          borderLeft: '6px solid #D32F2F',
        }}
      >
        <SecurityIcon sx={{ fontSize: 80, color: '#D32F2F', mb: 2 }} />
        <Typography variant="h1" color="error" fontWeight={800} gutterBottom>
          403
        </Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Access Restricted
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={500} mx="auto" mb={4}>
          You do not have the required administrative clearance to access this module. Please switch to an authorized role or contact system administration.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')}
          sx={{ borderRadius: 28, px: 4 }}
        >
          Go Back to Safety
        </Button>
      </Card>
    </Container>
  );
};
