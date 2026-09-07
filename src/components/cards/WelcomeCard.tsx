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
  gradientBackground = '#0F4C5C',
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        mb: 4,
        p: { xs: 3, md: 3.5 },
        backgroundColor: gradientBackground,
        color: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid #0A343F',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {avatarUrl && (
            <Avatar
              src={avatarUrl}
              alt={title}
              sx={{ width: 56, height: 56, border: '2px solid #E0F2F1' }}
            />
          )}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.015em', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, color: '#E0F2F1', fontWeight: 500, mt: 0.5 }}>
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
              bgcolor: '#C85A32',
              color: '#FFFFFF',
              fontWeight: 700,
              px: 2.5,
              py: 1,
              borderRadius: '6px',
              textTransform: 'none',
              fontSize: '0.85rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#A03F1B' },
            }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Card>
  );
};
