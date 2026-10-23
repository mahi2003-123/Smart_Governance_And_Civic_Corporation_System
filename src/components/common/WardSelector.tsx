import React, { useEffect, useState, useCallback } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  CircularProgress,
  Button,
  Box,
} from '@mui/material';
import { wardService } from '../../services/wardService';
import { Ward } from '../../types';

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
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadWards = useCallback(async (force = false) => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await wardService.getWards(force);
      setWards(data);
    } catch (err: any) {
      setWards([]);
      setFetchError('Failed to load wards from municipal server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWards();
  }, [loadWards]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth={fullWidth} error={error || Boolean(fetchError)} required={required} size={size}>
      <InputLabel id="ward-selector-label" sx={{ fontWeight: 600 }}>
        {label}
      </InputLabel>
      <Select
        labelId="ward-selector-label"
        id="ward-selector"
        value={value}
        label={label}
        onChange={handleChange}
        disabled={disabled || loading}
        sx={{
          borderRadius: '12px',
          fontWeight: 600,
          backgroundColor: '#FFFFFF',
        }}
        endAdornment={
          loading ? (
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ color: '#1F4D3A' }} />
            </Box>
          ) : null
        }
      >
        {allowAllOption && (
          <MenuItem value="All Wards" sx={{ fontWeight: 600 }}>
            <em>All Wards</em>
          </MenuItem>
        )}
        {wards.map((ward) => {
          const wardDisplayName = ward.name.toLowerCase().startsWith('ward')
            ? ward.name
            : `Ward ${ward.wardNumber} - ${ward.name}`;
          return (
            <MenuItem key={ward.id || ward.wardNumber} value={wardDisplayName} sx={{ fontWeight: 500 }}>
              {wardDisplayName}
            </MenuItem>
          );
        })}
      </Select>
      {fetchError ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <FormHelperText error sx={{ m: 0 }}>
            {fetchError}
          </FormHelperText>
          <Button
            size="small"
            onClick={() => loadWards(true)}
            sx={{ fontSize: '0.72rem', textTransform: 'none', py: 0, px: 1, minWidth: 'auto', color: '#1F4D3A' }}
          >
            Retry
          </Button>
        </Box>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

export default WardSelector;
