import React from 'react';
import { Card, Box, Typography, Avatar } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  borderLeftColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = '#E8EFE9',
  iconColor = '#304B3A',
  borderLeftColor = '#496A57',
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '8px',
        border: '1px solid #E5E8E4',
        borderLeft: `4px solid ${borderLeftColor}`,
        backgroundColor: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: '#496A57',
          backgroundColor: '#F8F9F7',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#68706B', fontWeight: 500, fontSize: '0.85rem' }}>
          {title}
        </Typography>
        <Avatar sx={{ bgcolor: iconBgColor, color: iconColor, width: 38, height: 38, borderRadius: '6px' }}>
          {icon}
        </Avatar>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', letterSpacing: '-0.015em', lineHeight: 1.1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 400, mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};
