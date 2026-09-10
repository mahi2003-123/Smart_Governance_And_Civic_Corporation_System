import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  loading = false,
  disabled,
  sx,
  variant = 'contained',
  color = 'primary',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      disabled={disabled || loading}
      sx={{
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'none',
        px: 3,
        py: 1.1,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={22} color="inherit" /> : children}
    </Button>
  );
};
