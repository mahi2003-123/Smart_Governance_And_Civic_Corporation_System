import React from 'react';
import { Box } from '@mui/material';

interface AuthBackgroundProps {
  children: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        overflowX: 'hidden',
      }}
    >
      {children}
    </Box>
  );
};
