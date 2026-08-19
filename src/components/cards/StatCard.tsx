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
  iconBgColor = '#EFF6FF',
  iconColor = '#2563EB',
  borderLeftColor = '#2563EB',
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        borderLeft: `5px solid ${borderLeftColor}`,
        backgroundColor: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.875rem' }}>
          {title}
        </Typography>
        <Avatar sx={{ bgcolor: iconBgColor, color: iconColor, width: 44, height: 44, borderRadius: '12px' }}>
          {icon}
        </Avatar>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};
