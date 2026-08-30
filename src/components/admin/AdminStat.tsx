import React from 'react';
import { Box, Typography } from '@mui/material';

interface AdminStatProps {
  label: string;
  value: number | string;
  supportingText?: string;
  highlightColor?: string;
  onClick?: () => void;
  showRightBorder?: boolean;
}

export const AdminStat: React.FC<AdminStatProps> = ({
  label,
  value,
  supportingText,
  highlightColor = '#202522',
  onClick,
  showRightBorder = true,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        borderRight: showRightBorder ? { sm: '1px solid #E5E8E4' } : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease',
        '&:hover': onClick ? { backgroundColor: '#F8F9F7' } : undefined,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 600,
          color: highlightColor,
          lineHeight: 1.1,
          mb: 0.5,
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
        }}
      >
        {typeof value === 'number' ? String(value).padStart(2, '0') : value}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522', display: 'block', mb: 0.2 }}>
        {label}
      </Typography>
      {supportingText && (
        <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.75rem', display: 'block' }}>
          {supportingText}
        </Typography>
      )}
    </Box>
  );
};

export default AdminStat;
