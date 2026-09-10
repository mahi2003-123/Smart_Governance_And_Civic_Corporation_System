import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  assignedWorkerName?: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, assignedWorkerName }) => {
  const getBadgeStyle = (stat: string) => {
    const formatted = stat ? stat.toUpperCase() : 'PENDING';
    const cleanWorkerName = assignedWorkerName ? assignedWorkerName.replace(/\(.*?\)/g, '').trim() : '';
    
    // If assigned worker is present or status is ASSIGNED
    if (formatted === 'ASSIGNED' || (cleanWorkerName && (formatted === 'IN_PROGRESS' || formatted === 'PENDING'))) {
      return {
        label: cleanWorkerName ? `Assigned to ${cleanWorkerName}` : 'Assigned to Worker',
        bg: '#EBF5FF',
        color: '#1E40AF',
        dot: '#2563EB',
      };
    }

    switch (formatted) {
      case 'RESOLVED':
      case 'APPROVED':
      case 'CLOSED':
        return {
          label: 'Resolved',
          bg: '#E8EFE9',
          color: '#304B3A',
          dot: '#527A5E',
        };
      case 'IN_PROGRESS':
        return {
          label: cleanWorkerName ? `Assigned to ${cleanWorkerName}` : 'In Progress',
          bg: '#FBF4E8',
          color: '#8A6424',
          dot: '#B58A45',
        };
      case 'PENDING_APPROVAL':
        return {
          label: 'Pending Councillor Review',
          bg: '#FEF3C7',
          color: '#92400E',
          dot: '#D97706',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          bg: '#F3F5F2',
          color: '#496A57',
          dot: '#496A57',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          bg: '#FDF2F2',
          color: '#B45D59',
          dot: '#B45D59',
        };
      case 'PENDING':
      case 'SUBMITTED':
      default:
        return {
          label: cleanWorkerName ? `Assigned to ${cleanWorkerName}` : 'Submitted',
          bg: cleanWorkerName ? '#EBF5FF' : '#F8F9F7',
          color: cleanWorkerName ? '#1E40AF' : '#68706B',
          dot: cleanWorkerName ? '#2563EB' : '#8E9691',
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.35,
        borderRadius: '4px',
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '0.775rem',
        fontWeight: 500,
        lineHeight: 1,
        border: '1px solid #E5E8E4',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: style.dot,
        }}
      />
      <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
        {style.label}
      </Typography>
    </Box>
  );
};

export default StatusBadge;
