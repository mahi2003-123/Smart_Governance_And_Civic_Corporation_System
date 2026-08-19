import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import { WARDS_LIST } from '../../constants';

interface WardSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  allowAllOption?: boolean;
}

export const WardSelector: React.FC<WardSelectorProps> = ({
  value,
  onChange,
  label = 'Select Ward',
  error = false,
  helperText = '',
  fullWidth = true,
  required = false,
  disabled = false,
  size = 'medium',
  allowAllOption = false,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth={fullWidth} error={error} required={required} size={size}>
      <InputLabel id="ward-selector-label" sx={{ fontWeight: 600 }}>
        {label}
      </InputLabel>
      <Select
        labelId="ward-selector-label"
        id="ward-selector"
        value={value}
        label={label}
        onChange={handleChange}
        disabled={disabled}
        sx={{
          borderRadius: '12px',
          fontWeight: 600,
          backgroundColor: '#FFFFFF',
        }}
      >
        {allowAllOption && (
          <MenuItem value="All Wards" sx={{ fontWeight: 600 }}>
            <em>All Wards</em>
          </MenuItem>
        )}
        {WARDS_LIST.map((ward) => (
          <MenuItem key={ward} value={ward} sx={{ fontWeight: 500 }}>
            {ward}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default WardSelector;
