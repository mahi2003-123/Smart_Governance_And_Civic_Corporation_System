import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  InputBase,
  Paper,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../hooks/useAuth';
import { useColorMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { ROLE_LABELS } from '../../constants';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchRole } = useAuth();
  const { mode, toggleTheme } = useColorMode();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const notifications = [
    { id: '1', title: 'Pothole Complaint #SGCS-8941 Updated', time: '10m ago', unread: true },
    { id: '2', title: 'New Ward Notice: Water Pipeline Maintenance', time: '1h ago', unread: true },
    { id: '3', title: 'Community Proposal #002 Approved by Board', time: '1d ago', unread: false },
  ];

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setRoleMenuAnchor(null);
    switch (role) {
      case 'CITIZEN':
        navigate('/citizen/dashboard');
        break;
      case 'COUNCILLOR':
        navigate('/councillor/dashboard');
        break;
      case 'WORKER':
        navigate('/worker/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 }, minHeight: 70 }}>
          {/* Left: Mobile Sidebar Toggle & Branding */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <IconButton onClick={onToggleSidebar} edge="start" color="inherit">
              <MenuIcon />
            </IconButton>
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  bgcolor: '#4F4034',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(79, 64, 52, 0.25)',
                }}
              >
                <LocationCityIcon />
              </Box>
              <Box display={{ xs: 'none', sm: 'block' }}>
                <Typography variant="h6" fontWeight={800} lineHeight={1.1} color="text.primary" sx={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  CivicSphere SGCS
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.03em">
                  SMART GOVERNANCE PORTAL
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Center: Search Bar */}
          <Paper
            component="form"
            sx={{
              p: '2px 12px',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              width: 360,
              borderRadius: 28,
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#FAF6F3',
              border: '1px solid #E7E1DE',
              boxShadow: 'none',
              '&:hover': {
                border: '1px solid #A7927E',
              },
            }}
          >
            <IconButton sx={{ p: '6px' }} aria-label="search">
              <SearchIcon sx={{ color: '#4F4034' }} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem', fontFamily: '"Hanken Grotesk", sans-serif' }}
              placeholder="Search complaints, notices, wards..."
              inputProps={{ 'aria-label': 'search portal' }}
            />
          </Paper>

          {/* Right Controls */}
          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
            {/* Quick Demo Persona Switcher Pill */}
            {user && (
              <Tooltip title="Click to instantly switch demo role">
                <Chip
                  icon={<SwapHorizIcon fontSize="small" style={{ color: '#FFFFFF' }} />}
                  label={ROLE_LABELS[user.role]}
                  onClick={(e) => setRoleMenuAnchor(e.currentTarget)}
                  sx={{
                    fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: '#4F4034',
                    color: '#FFFFFF',
                    display: { xs: 'none', sm: 'inline-flex' },
                    py: 2,
                    px: 0.5,
                    '&:hover': {
                      bgcolor: '#382B21',
                    },
                  }}
                />
              </Tooltip>
            )}

            {/* Dark Mode Toggle */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <LightModeIcon sx={{ color: '#FDE68A' }} /> : <DarkModeIcon sx={{ color: '#4F4034' }} />}
              </IconButton>
            </Tooltip>

            {/* Notification Bell */}
            <Tooltip title="Civic Notifications">
              <IconButton onClick={() => setNotifDrawerOpen(true)} color="inherit">
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon sx={{ color: '#4F4034' }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Menu Avatar */}
            {user ? (
              <>
                <IconButton onClick={handleProfileClick} size="small">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.fullName}
                    sx={{ width: 40, height: 40, border: '2px solid #4F4034' }}
                  >
                    {user.fullName.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{ sx: { borderRadius: 3, minWidth: 220, mt: 1 } }}
                >
                  <Box px={2} py={1.5}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate('/citizen/profile');
                    }}
                  >
                    <PersonIcon fontSize="small" sx={{ mr: 1.5, color: '#4F4034' }} /> Profile Settings
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      logout();
                      navigate('/login');
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/login')}
                sx={{ borderRadius: 28 }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Role Switcher Menu */}
      <Menu
        anchorEl={roleMenuAnchor}
        open={Boolean(roleMenuAnchor)}
        onClose={() => setRoleMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 3, width: 220 } }}
      >
        <Box px={2} py={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            SWITCH DEMO PERSONA
          </Typography>
        </Box>
        <Divider />
        {(['CITIZEN', 'COUNCILLOR', 'WORKER', 'ADMIN'] as UserRole[]).map((r) => (
          <MenuItem key={r} onClick={() => handleRoleSelect(r)} selected={user?.role === r}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Typography variant="body2" fontWeight={user?.role === r ? 700 : 500}>
                {ROLE_LABELS[r]}
              </Typography>
              {user?.role === r && <CheckCircleIcon fontSize="small" color="primary" />}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Notification Drawer */}
      <Drawer anchor="right" open={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)}>
        <Box width={{ xs: 300, sm: 360 }} p={3}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Civic Alerts & Notices
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Real-time updates regarding complaints and ward notices.
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List disablePadding>
            {notifications.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    borderRadius: 2,
                    bgcolor: item.unread ? 'action.hover' : 'transparent',
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={item.unread ? 700 : 500}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {item.time}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
