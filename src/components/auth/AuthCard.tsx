import React from 'react';
import { Box } from '@mui/material';

interface AuthCardProps {
  children: React.ReactNode;
  maxWidth?: number | string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, maxWidth = 460 }) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: maxWidth,
        mx: 'auto',
        p: { xs: 2.5, sm: 4 },
      }}
    >
      {children}
    </Box>
  );
};
