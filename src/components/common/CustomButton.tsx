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
        borderRadius: 28,
        fontWeight: 600,
        px: 3,
        py: 1.2,
        boxShadow: variant === 'contained' && color === 'primary' ? '0 6px 16px rgba(111, 78, 55, 0.25)' : 'none',
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={22} color="inherit" /> : children}
    </Button>
  );
};
