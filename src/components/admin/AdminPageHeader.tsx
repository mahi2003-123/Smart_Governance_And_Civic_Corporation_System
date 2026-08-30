import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
  secondaryAction?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  actionLabel,
  actionIcon,
  onActionClick,
  secondaryAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 4,
        pb: 2,
        borderBottom: '1px solid #E5E8E4',
      }}
    >
      <Box>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.6rem', sm: '1.85rem' },
            color: '#202522',
            letterSpacing: '-0.015em',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#68706B', maxWidth: 680 }}>
          {description}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {secondaryAction}
        {actionLabel && (
          <Button
            variant="contained"
            startIcon={actionIcon}
            onClick={onActionClick}
            sx={{
              backgroundColor: '#496A57',
              color: '#FFFFFF',
              fontWeight: 500,
              px: 2.5,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: '#304B3A',
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AdminPageHeader;
