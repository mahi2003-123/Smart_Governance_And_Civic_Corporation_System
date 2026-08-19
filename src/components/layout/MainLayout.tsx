import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top PayFlow style Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          py: { xs: 3, md: 5 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="lg" disableGutters>
          {children}
        </Container>
      </Box>

      {/* Minimal Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 4,
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} SGCS — Smart Governance and Civic Corporation System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
