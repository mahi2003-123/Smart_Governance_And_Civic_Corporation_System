import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface HeaderBreadcrumbProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  actionButtons?: React.ReactNode;
}

export const HeaderBreadcrumb: React.FC<HeaderBreadcrumbProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actionButtons,
}) => {
  const navigate = useNavigate();

  return (
    <Box mb={4}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
        aria-label="breadcrumb"
        sx={{ mb: 1.5 }}
      >
        <Link
          underline="hover"
          color="text.secondary"
          sx={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
          onClick={() => navigate('/')}
        >
          Home
        </Link>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast || !item.path ? (
            <Typography key={index} color="primary" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              underline="hover"
              color="text.secondary"
              sx={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
              onClick={() => navigate(item.path!)}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>

      {/* Header & Actions Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {actionButtons && <Box display="flex" gap={1.5} alignItems="center">{actionButtons}</Box>}
      </Box>
    </Box>
  );
};
