import React from 'react';
import { Card, Box, Typography, Button, Avatar } from '@mui/material';

interface WelcomeCardProps {
  title: string;
  subtitle: string;
  avatarUrl?: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  gradientBackground?: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  title,
  subtitle,
  avatarUrl,
  actionText,
  actionIcon,
  onAction,
  gradientBackground = 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        mb: 4,
        p: { xs: 3, md: 4 },
        background: gradientBackground,
        color: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {avatarUrl && (
            <Avatar
              src={avatarUrl}
              alt={title}
              sx={{ width: 64, height: 64, border: '2px solid #BFDBFE' }}
            />
          )}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, color: '#DBEAFE', fontWeight: 500, mt: 0.5 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {actionText && onAction && (
          <Button
            variant="contained"
            size="medium"
            startIcon={actionIcon}
            onClick={onAction}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#1E40AF',
              fontWeight: 800,
              px: 3,
              py: 1.2,
              borderRadius: '16px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#EFF6FF' },
            }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Card>
  );
};
