import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface CustomTextFieldProps extends Omit<TextFieldProps, 'SelectProps'> {
  SelectProps?: any;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({ sx, ...props }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          backgroundColor: '#FFFFFF',
          transition: 'all 0.2s ease-in-out',
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0284C7',
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root': {
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontWeight: 600,
        },
        ...sx,
      }}
      {...props}
    />
  );
};
