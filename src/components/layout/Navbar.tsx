import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationPopover } from '../citizen/NotificationPopover';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  // Derive human readable page title & breadcrumbs from path
  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/citizen/dashboard')) return 'Citizen Dashboard';
    if (pathname.includes('/citizen/complaints/submit')) return 'Report Civic Grievance';
    if (pathname.includes('/citizen/complaints/') && pathname !== '/citizen/complaints') return 'Complaint Details';
    if (pathname.includes('/citizen/complaints')) return 'My Complaints';
    if (pathname.includes('/citizen/track')) return 'Track Complaint';
    if (pathname.includes('/citizen/proposals')) return 'Community Proposals';
    if (pathname.includes('/citizen/notices')) return 'Ward Notices';
    if (pathname.includes('/citizen/profile')) return 'Account Profile';
    
    if (pathname.includes('/councillor/dashboard')) return 'Councillor Dashboard';
    if (pathname.includes('/councillor/complaints')) return 'Manage Ward Complaints';
    if (pathname.includes('/councillor/proposals')) return 'Review Proposals';
    if (pathname.includes('/councillor/announcements')) return 'Ward Bulletins';
    if (pathname.includes('/councillor/reports')) return 'Ward Analytics';
    
    if (pathname.includes('/worker/dashboard')) return 'Field Worker Dashboard';
    if (pathname.includes('/worker/tasks')) return 'Assigned Work Tasks';
    if (pathname.includes('/worker/completed')) return 'Completed Work Tasks';
    
    if (pathname.includes('/admin/dashboard')) return 'Super Admin Dashboard';
    if (pathname.includes('/admin/users')) return 'User Administration';
    if (pathname.includes('/admin/wards')) return 'Ward Management';
    if (pathname.includes('/admin/complaints')) return 'All Complaints System Monitoring';
    if (pathname.includes('/admin/reports')) return 'System Analytics & Reports';
    
    return 'SGCS Public Portal';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <Box
      component="header"
      sx={{
        height: 60,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E8E4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left: Mobile Toggle & Page Title / Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton
          onClick={onMobileMenuToggle}
          edge="start"
          sx={{ display: { xs: 'flex', md: 'none' }, color: '#202522' }}
        >
          <MenuIcon />
        </IconButton>

        <Box>
          <Breadcrumbs separator="/" sx={{ '& .MuiBreadcrumbs-separator': { color: '#E5E8E4', fontSize: '0.8rem' } }}>
            <MuiLink
              underline="none"
              color="inherit"
              onClick={() => navigate(user ? `/${user.role.toLowerCase()}/dashboard` : '/')}
              sx={{ color: '#68706B', fontSize: '0.775rem', cursor: 'pointer', '&:hover': { color: '#496A57' } }}
            >
              SGCS Portal
            </MuiLink>
            <Typography variant="caption" sx={{ color: '#202522', fontWeight: 500, fontSize: '0.775rem' }}>
              {pageTitle}
            </Typography>
          </Breadcrumbs>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#202522',
              fontSize: '1rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {pageTitle}
          </Typography>
        </Box>
      </Box>

      {/* Right: Notifications & Profile Trigger */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isAuthenticated && user && (
          <>
            <NotificationPopover />

            <Box
              onClick={handleOpenUserMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                pl: 1,
                pr: 1.5,
                borderRadius: '6px',
                border: '1px solid #E5E8E4',
                backgroundColor: '#FFFFFF',
                transition: 'all 0.15s ease',
                '&:hover': { backgroundColor: '#F3F5F2', borderColor: '#496A57' },
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: '#496A57',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: '#202522',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '0.85rem',
                }}
              >
                {user.fullName || 'User'}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    mt: 1,
                    borderRadius: '8px',
                    border: '1px solid #E5E8E4',
                    minWidth: 200,
                    p: 0.5,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #E5E8E4', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.85rem' }}>
                  {user.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block', fontSize: '0.75rem' }}>
                  {user.email}
                </Typography>
              </Box>

              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  navigate('/citizen/profile');
                }}
                sx={{ py: 1, gap: 1.5, color: '#202522', fontSize: '0.85rem' }}
              >
                <PersonOutlinedIcon sx={{ fontSize: 18, color: '#68706B' }} /> Account Settings
              </MenuItem>

              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1, gap: 1.5, color: '#B45D59', fontSize: '0.85rem', fontWeight: 500 }}
              >
                <LogoutOutlinedIcon sx={{ fontSize: 18, color: '#B45D59' }} /> Sign Out
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Navbar;
