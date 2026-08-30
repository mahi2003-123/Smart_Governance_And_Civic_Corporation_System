import React from 'react';
import { Box, TextField, MenuItem, InputAdornment } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', md: 'center' },
        mb: 3,
        p: 2,
        backgroundColor: '#F8F9F7',
        borderRadius: '8px',
        border: '1px solid #E5E8E4',
      }}
    >
      {onSearchChange && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flex: 1,
            minWidth: { xs: '100%', md: 240 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '0.85rem',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ fontSize: 18, color: '#68706B' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {filters.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {filters.map((filter) => (
            <TextField
              key={filter.id}
              select
              size="small"
              label={filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              sx={{
                minWidth: 140,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                },
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            >
              {filter.options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.85rem' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FilterBar;
