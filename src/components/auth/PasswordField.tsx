import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, TextFieldProps } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

type PasswordFieldProps = Omit<TextFieldProps, 'type'> & {
  label?: string;
  placeholder?: string;
};

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label = 'Password',
  placeholder = 'Enter your password',
  value,
  onChange,
  error,
  helperText,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      type={showPassword ? 'text' : 'password'}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon sx={{ color: '#64748B', fontSize: 19 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="small"
                sx={{ color: '#64748B' }}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          fontSize: '0.925rem',
          '& fieldset': {
            borderColor: '#E2E8F0',
            transition: 'all 0.2s ease',
          },
          '&:hover fieldset': {
            borderColor: '#BAE6FD',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0284C7',
            borderWidth: '1.5px',
            boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.12)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#64748B',
          fontSize: '0.925rem',
          '&.Mui-focused': {
            color: '#0284C7',
            fontWeight: 600,
          },
        },
        ...rest.sx,
      }}
      {...rest}
    />
  );
};
