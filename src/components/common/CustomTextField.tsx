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
        width: '100%',
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          transition: 'all 0.2s ease-in-out',
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#496A57',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#496A57',
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root': {
          fontWeight: 500,
        },
        ...sx,
      }}
      {...props}
    />
  );
};
