import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip,
  Badge,
  Tooltip,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';

export const NotificationPopover: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifs = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifs();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const handleItemClick = async (notif: NotificationItem) => {
    await notificationService.markAsRead(notif.id);
    handleClose();
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'COMPLAINT':
        return <ReportProblemIcon fontSize="small" sx={{ color: '#2563EB' }} />;
      case 'NOTICE':
        return <CampaignIcon fontSize="small" sx={{ color: '#0EA5E9' }} />;
      case 'PROPOSAL':
        return <HowToVoteIcon fontSize="small" sx={{ color: '#8B5CF6' }} />;
      case 'FEEDBACK':
        return <FeedbackIcon fontSize="small" sx={{ color: '#10B981' }} />;
      default:
        return <NotificationsOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />;
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          id="citizen-notification-bell"
          onClick={handleClick}
          sx={{
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            p: 1,
            '&:hover': { backgroundColor: '#EFF6FF', color: '#2563EB' },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" overlap="circular">
            <NotificationsOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 480,
              borderRadius: '20px',
              mt: 1.5,
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        {/* Popover Header */}
        <Box sx={{ p: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} New`}
                size="small"
                sx={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontWeight: 800, height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon fontSize="small" />}
              onClick={handleMarkAllRead}
              sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'none', fontSize: '0.75rem' }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider sx={{ borderColor: '#F1F5F9' }} />

        {/* Notifications List */}
        <List sx={{ p: 0, overflowY: 'auto', maxHeight: 380 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                No notifications right now.
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  button
                  onClick={() => handleItemClick(notif)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    backgroundColor: notif.read ? '#FFFFFF' : '#EFF6FF',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: '#F1F5F9' },
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ pt: 0.3, mr: 1.5 }}>{getNotifIcon(notif.type)}</Box>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: notif.read ? 600 : 800, color: '#0F172A', fontSize: '0.85rem' }}>
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.2 }}>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.4 }}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 500, mt: 0.5, display: 'block' }}>
                          {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationPopover;
