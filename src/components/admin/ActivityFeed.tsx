import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { SystemActivityLog } from '../../types';

interface ActivityFeedProps {
  activities: SystemActivityLog[];
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, limit }) => {
  const items = limit ? activities.slice(0, limit) : activities;

  if (items.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: '#68706B', py: 2 }}>
        No recent system activity logs available.
      </Typography>
    );
  }

  return (
    <Stack spacing={0} sx={{ borderLeft: '1px solid #E5E8E4', ml: 1, pl: 2.5 }}>
      {items.map((act) => (
        <Box
          key={act.id}
          sx={{
            py: 1.5,
            position: 'relative',
            borderBottom: '1px solid #F3F5F2',
            '&:last-child': { borderBottom: 'none' },
          }}
        >
          {/* Bullet dot */}
          <Box
            sx={{
              position: 'absolute',
              left: -25,
              top: 20,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#496A57',
              border: '2px solid #FFFFFF',
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
              {act.action}
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.75rem' }}>
              {act.timestamp}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={act.module}
              size="small"
              sx={{
                fontSize: '0.675rem',
                fontWeight: 600,
                height: '20px',
                backgroundColor: '#F3F5F2',
                color: '#68706B',
                borderRadius: '4px',
              }}
            />
            <Typography variant="caption" sx={{ color: '#68706B' }}>
              {act.user} ({act.role}) — {act.details}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default ActivityFeed;
