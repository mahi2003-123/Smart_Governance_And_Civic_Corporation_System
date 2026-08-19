import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are currently no items to display in this view.',
  actionText,
  onAction,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      px={2}
      textAlign="center"
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'secondary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <InboxOutlinedIcon sx={{ fontSize: 36, color: '#6F4E37' }} />
      </Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={400} mb={actionText ? 3 : 0}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ borderRadius: 28 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  description = 'An error occurred while communicating with the civic servers. Please try again.',
  onRetry,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      px={2}
      textAlign="center"
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <ErrorOutlinedIcon sx={{ fontSize: 36, color: '#D32F2F' }} />
      </Box>
      <Typography variant="h6" fontWeight={700} color="error" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={400} mb={onRetry ? 3 : 0}>
        {description}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry} sx={{ borderRadius: 28 }}>
          Try Again
        </Button>
      )}
    </Box>
  );
};
