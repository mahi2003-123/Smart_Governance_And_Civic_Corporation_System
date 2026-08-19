import React from 'react';
import { Chip } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const getBadgeStyle = (stat: string) => {
    const formatted = stat ? stat.toUpperCase() : 'PENDING';
    switch (formatted) {
      case 'RESOLVED':
      case 'APPROVED':
      case 'CLOSED':
        return {
          label: 'Resolved',
          bg: '#EDF7ED',
          color: '#1E4620',
        };
      case 'IN_PROGRESS':
      case 'UNDER_REVIEW':
        return {
          label: formatted === 'IN_PROGRESS' ? 'In Progress' : 'Under Review',
          bg: '#E8F4FD',
          color: '#1D6FBA',
        };
      case 'ACTIVE':
        return {
          label: 'Active',
          bg: '#EFF6FF',
          color: '#2563EB',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          bg: '#FEE2E2',
          color: '#991B1B',
        };
      case 'PENDING':
      case 'SUBMITTED':
      default:
        return {
          label: 'Pending',
          bg: '#FFF4E5',
          color: '#B76E00',
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <Chip
      label={style.label}
      size={size}
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 700,
        borderRadius: '8px',
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
      }}
    />
  );
};

export default StatusBadge;
