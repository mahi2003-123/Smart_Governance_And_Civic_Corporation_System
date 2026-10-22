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
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import {
  requestFirebaseNotificationPermission,
  registerTokenWithBackend,
  onMessageListener,
  isFirebaseConfigured
} from '../../utils/firebase';

export const NotificationPopover: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pushPermission, setPushPermission] = useState<string>('default');
  const [pushLoading, setPushLoading] = useState<boolean>(false);
  const [pushSuccess, setPushSuccess] = useState<boolean>(false);

  const fetchNotifs = async () => {
    try {
      const data = await notificationService.getNotifications(user?.ward, user?.id, user?.role);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission('unsupported');
    }

    const unsub = onMessageListener((_payload: any) => {
      fetchNotifs();
    });

    return () => {
      if (unsub) unsub();
    };
  }, [user?.ward, user?.id, user?.role]);

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      const token = await requestFirebaseNotificationPermission();
      if (token) {
        const ok = await registerTokenWithBackend(token);
        if (ok) {
          setPushSuccess(true);
          setPushPermission('granted');
          setTimeout(() => setPushSuccess(false), 5000);
        }
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setPushPermission(Notification.permission);
          if (Notification.permission === 'denied') {
            alert('Notification permission is blocked in your browser settings. Please enable notifications for this site to receive alerts.');
          } else if (!isFirebaseConfigured()) {
            alert('Push notifications require Firebase configuration (VITE_FIREBASE_API_KEY). Ensure environment variables are configured.');
          }
        }
      }
    } catch (err) {
      console.error('Error enabling push notifications:', err);
    } finally {
      setPushLoading(false);
    }
  };

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
            {pushPermission === 'granted' && (
              <Chip
                label="Push On"
                size="small"
                sx={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700, height: 20, fontSize: '0.65rem' }}
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

        {/* Push Notification Opt-in / Status Banner */}
        {pushSuccess ? (
          <Box sx={{ px: 2, py: 1, backgroundColor: '#DCFCE7', borderBottom: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon sx={{ color: '#16A34A', fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', fontSize: '0.72rem' }}>
              ✓ Web push alerts active for this device!
            </Typography>
          </Box>
        ) : pushPermission !== 'granted' && pushPermission !== 'unsupported' ? (
          <Box
            sx={{
              px: 2,
              py: 1,
              backgroundColor: '#F0FDF4',
              borderBottom: '1px solid #DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveIcon sx={{ color: '#16A34A', fontSize: 18 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', display: 'block', lineHeight: 1.2, fontSize: '0.75rem' }}>
                  Enable Push Alerts
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', fontSize: '0.67rem', display: 'block' }}>
                  Receive civic updates in background
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              variant="contained"
              disabled={pushLoading}
              onClick={handleEnablePush}
              sx={{
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                textTransform: 'none',
                fontSize: '0.7rem',
                fontWeight: 700,
                py: 0.2,
                px: 1.2,
                minWidth: 'auto',
                borderRadius: '6px',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#15803D', boxShadow: 'none' },
              }}
            >
              {pushLoading ? 'Enabling...' : 'Enable'}
            </Button>
          </Box>
        ) : null}

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
