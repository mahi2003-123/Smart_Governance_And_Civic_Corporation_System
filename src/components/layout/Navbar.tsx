import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Container,
  Tooltip,
  Paper,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  DashboardIcon,
  ReportProblemIcon,
  HistoryIcon,
  CampaignIcon,
  HowToVoteIcon,
  PersonIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  ShieldIcon,
  SearchSvgIcon,
  PlusSvgIcon,
} from '../common/Icons';
import { NotificationPopover } from '../citizen/NotificationPopover';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'CITIZEN':
        return [
          { label: 'Dashboard', path: '/citizen/dashboard', icon: <DashboardIcon size={16} /> },
          { label: 'Report Issue', path: '/citizen/complaints/submit', icon: <ReportProblemIcon size={16} /> },
          { label: 'Track Issue', path: '/citizen/track', icon: <SearchSvgIcon size={16} /> },
          { label: 'My Complaints', path: '/citizen/complaints', icon: <HistoryIcon size={16} /> },
          { label: 'Proposals', path: '/citizen/proposals', icon: <HowToVoteIcon size={16} /> },
          { label: 'Ward Notices', path: '/citizen/notices', icon: <CampaignIcon size={16} /> },
        ];
      case 'COUNCILLOR':
        return [
          { label: 'Dashboard', path: '/councillor/dashboard', icon: <DashboardIcon size={16} /> },
          { label: 'Manage Complaints', path: '/councillor/complaints', icon: <ReportProblemIcon size={16} /> },
          { label: 'Review Proposals', path: '/councillor/proposals', icon: <HowToVoteIcon size={16} /> },
          { label: 'Announcements', path: '/councillor/announcements', icon: <CampaignIcon size={16} /> },
        ];
      case 'WORKER':
        return [
          { label: 'Dashboard', path: '/worker/dashboard', icon: <DashboardIcon size={16} /> },
          { label: 'Assigned Tasks', path: '/worker/tasks', icon: <ReportProblemIcon size={16} /> },
          { label: 'Completed Tasks', path: '/worker/completed', icon: <HistoryIcon size={16} /> },
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon size={16} /> },
          { label: 'User Management', path: '/admin/users', icon: <PersonIcon size={16} /> },
          { label: 'Ward Management', path: '/admin/wards', icon: <ShieldIcon size={16} /> },
          { label: 'All Complaints', path: '/admin/complaints', icon: <ReportProblemIcon size={16} /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#FEF2F2', color: '#EF4444', label: 'Admin' };
      case 'COUNCILLOR':
        return { bg: '#F0F9FF', color: '#0EA5E9', label: 'Councillor' };
      case 'WORKER':
        return { bg: '#ECFDF5', color: '#10B981', label: 'Staff' };
      default:
        return { bg: '#EFF6FF', color: '#2563EB', label: 'Citizen' };
    }
  };

  const roleInfo = getRoleColor(user?.role);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
        color: '#0F172A',
        py: 0.5,
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 68, minHeight: '68px !important' }}>
          {/* Next-Gen Brand Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => navigate(user ? `/${user.role.toLowerCase()}/dashboard` : '/')}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.15rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              SG
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>
                CivicSphere <span style={{ color: '#2563EB' }}>SGCS</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                Smart Governance Portal
              </Typography>
            </Box>
          </Box>

          {/* New-Generation Full Uncollapsed Menu Bar */}
          {isAuthenticated && (
            <Paper
              elevation={0}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                p: 0.75,
                borderRadius: '24px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    startIcon={link.icon}
                    sx={{
                      px: 2,
                      py: 0.85,
                      borderRadius: '18px',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.84rem',
                      textTransform: 'none',
                      color: isActive ? '#FFFFFF' : '#475569',
                      background: isActive
                        ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                        : 'transparent',
                      boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.28)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: isActive ? '#1D4ED8' : '#EFF6FF',
                        color: isActive ? '#FFFFFF' : '#2563EB',
                        transform: isActive ? 'none' : 'translateY(-1px)',
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Paper>
          )}

          {/* User Profile / Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAuthenticated && user ? (
              <>
                {/* Submit Issue Direct Action Pill (Visible on Large Desktop) */}
                {user.role === 'CITIZEN' && (
                  <Tooltip title="Quickly Report a Civic Issue">
                    <Button
                      variant="contained"
                      onClick={() => navigate('/citizen/complaints/submit')}
                      startIcon={<PlusSvgIcon size={16} color="#FFFFFF" />}
                      sx={{
                        display: { xs: 'none', xl: 'flex' },
                        borderRadius: '20px',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textTransform: 'none',
                        px: 2.2,
                        py: 0.8,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                        '&:hover': { backgroundColor: '#1D4ED8' },
                      }}
                    >
                      New Issue
                    </Button>
                  </Tooltip>
                )}

                {/* Notification Bell */}
                <NotificationPopover />

                {/* Role Chip */}
                <Chip
                  label={roleInfo.label}
                  size="small"
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    backgroundColor: roleInfo.bg,
                    color: roleInfo.color,
                    fontWeight: 800,
                    borderRadius: '10px',
                    px: 0.5,
                    fontSize: '0.75rem',
                  }}
                />

                {/* User Avatar Menu Trigger */}
                <Box
                  onClick={handleOpenUserMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    cursor: 'pointer',
                    p: 0.6,
                    pr: 1.5,
                    borderRadius: '30px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    '&:hover': { borderColor: '#2563EB', backgroundColor: '#F8FAFC' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                    }}
                  >
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#0F172A',
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
                        mt: 1.5,
                        borderRadius: '20px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                        minWidth: 220,
                        p: 0.5,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                      {user.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block', mt: 0.5 }}>
                      {user.ward || 'Ward 1 - Central Town'}
                    </Typography>
                  </Box>

                  {user.role === 'CITIZEN' && (
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu();
                        navigate('/citizen/profile');
                      }}
                      sx={{ py: 1.2, gap: 1.5, color: '#0F172A', fontWeight: 600, borderRadius: '12px' }}
                    >
                      <PersonIcon size={18} color="#64748B" /> My Profile & Ward
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.2, gap: 1.5, color: '#EF4444', fontWeight: 700, borderRadius: '12px' }}
                  >
                    <LogoutIcon size={18} color="#EF4444" /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: '20px',
                    borderColor: '#E2E8F0',
                    color: '#0F172A',
                    fontWeight: 700,
                    px: 3,
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderRadius: '20px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    px: 3,
                  }}
                >
                  Register
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button (Mobile view only) */}
            {isAuthenticated && (
              <IconButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ display: { xs: 'flex', md: 'none' }, color: '#0F172A' }}
              >
                {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
              </IconButton>
            )}
          </Box>
        </Toolbar>

        {/* Mobile Navigation Menu Dropdown */}
        {isAuthenticated && mobileMenuOpen && (
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              gap: 1,
              py: 2,
              borderTop: '1px solid #E2E8F0',
            }}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Button
                  key={link.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(link.path);
                  }}
                  startIcon={link.icon}
                  sx={{
                    px: 2,
                    py: 1.2,
                    borderRadius: '14px',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#FFFFFF' : '#475569',
                    backgroundColor: isActive ? '#2563EB' : 'transparent',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Navbar;
