import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Chip,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavMenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavSection {
  title?: string;
  items: NavMenuItem[];
}

export const SidebarContent: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavSections = (): NavSection[] => {
    if (!user) return [];

    if (user.role === 'ADMIN') {
      return [
        {
          items: [
            { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 19 }} /> },
          ],
        },
        {
          title: 'MANAGEMENT',
          items: [
            { label: 'Users', path: '/admin/users', icon: <PeopleOutlinedIcon sx={{ fontSize: 19 }} /> },
            { label: 'Councillors', path: '/admin/councillors', icon: <SupervisorAccountOutlinedIcon sx={{ fontSize: 19 }} /> },
            { label: 'Local Workers', path: '/admin/workers', icon: <BadgeOutlinedIcon sx={{ fontSize: 19 }} /> },
            { label: 'Wards', path: '/admin/wards', icon: <MapOutlinedIcon sx={{ fontSize: 19 }} /> },
          ],
        },
        {
          title: 'CIVIC OPERATIONS',
          items: [
            { label: 'Complaints', path: '/admin/complaints', icon: <ShieldOutlinedIcon sx={{ fontSize: 19 }} /> },
            { label: 'Proposals', path: '/admin/proposals', icon: <ForumOutlinedIcon sx={{ fontSize: 19 }} /> },
            { label: 'Notices', path: '/admin/notices', icon: <CampaignOutlinedIcon sx={{ fontSize: 19 }} /> },
          ],
        },
        {
          title: 'MONITORING',
          items: [
            { label: 'System Activity', path: '/admin/activity', icon: <FormatListNumberedOutlinedIcon sx={{ fontSize: 19 }} /> },
            { label: 'Reports', path: '/admin/reports', icon: <AssessmentOutlinedIcon sx={{ fontSize: 19 }} /> },
          ],
        },
        {
          title: 'SYSTEM',
          items: [
            { label: 'Notifications', path: '/admin/notifications', icon: <NotificationsOutlinedIcon sx={{ fontSize: 19 }} /> },
            { label: 'Settings', path: '/admin/settings', icon: <SettingsOutlinedIcon sx={{ fontSize: 19 }} /> },
          ],
        },
        {
          items: [
            { label: 'Admin Profile', path: '/admin/profile', icon: <PersonOutlinedIcon sx={{ fontSize: 19 }} /> },
          ],
        },
      ];
    }

    // Default for CITIZEN, COUNCILLOR, WORKER
    let items: NavMenuItem[] = [];
    switch (user.role) {
      case 'CITIZEN':
        items = [
          { label: 'Dashboard', path: '/citizen/dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Report Grievance', path: '/citizen/complaints/submit', icon: <AddTaskOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Track Complaint', path: '/citizen/track', icon: <SearchOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'My Complaints', path: '/citizen/complaints', icon: <HistoryOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Community Proposals', path: '/citizen/proposals', icon: <ForumOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Ward Notices', path: '/citizen/notices', icon: <CampaignOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Account Profile', path: '/citizen/profile', icon: <PersonOutlinedIcon sx={{ fontSize: 19 }} /> },
        ];
        break;
      case 'COUNCILLOR':
        items = [
          { label: 'Dashboard', path: '/councillor/dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Manage Complaints', path: '/councillor/complaints', icon: <AssignmentOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Proposal Review', path: '/councillor/proposals', icon: <RateReviewOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Ward Notices', path: '/councillor/announcements', icon: <CampaignOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Ward Reports', path: '/councillor/reports', icon: <AssessmentOutlinedIcon sx={{ fontSize: 19 }} /> },
        ];
        break;
      case 'WORKER':
        items = [
          { label: 'Dashboard', path: '/worker/dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Assigned Tasks', path: '/worker/tasks', icon: <BuildOutlinedIcon sx={{ fontSize: 19 }} /> },
          { label: 'Completed Tasks', path: '/worker/completed', icon: <TaskAltOutlinedIcon sx={{ fontSize: 19 }} /> },
        ];
        break;
    }
    return [{ items }];
  };

  const navSections = getNavSections();

  const handleNav = (path: string) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  const roleLabelMap: Record<string, string> = {
    CITIZEN: 'Citizen',
    COUNCILLOR: 'Ward Councillor',
    WORKER: 'Field Worker',
    ADMIN: 'Super Admin',
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E8E4',
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ cursor: 'pointer', mb: 1.5 }} onClick={() => handleNav(user ? `/${user.role.toLowerCase()}/dashboard` : '/')}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#202522',
              letterSpacing: '-0.01em',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#496A57',
                display: 'inline-block',
              }}
            />
            SGCS Civic System
          </Typography>
          <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.75rem', display: 'block', pl: 2 }}>
            Public Governance Portal
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, pt: 1.5, borderTop: '1px solid #E5E8E4' }}>
            <Chip
              label={roleLabelMap[user.role] || user.role}
              size="small"
              sx={{
                backgroundColor: '#E8EFE9',
                color: '#304B3A',
                fontWeight: 500,
                fontSize: '0.725rem',
                height: '22px',
                borderRadius: '4px',
              }}
            />
            {user.ward && (
              <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.75rem' }} noWrap>
                {user.ward.split('-')[0]}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flex: 1, py: 1, overflowY: 'auto' }}>
        {navSections.map((sec, secIdx) => (
          <Box key={sec.title || secIdx} sx={{ mb: sec.title ? 1.5 : 0 }}>
            {sec.title && (
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: '0.08em',
                  color: '#68706B',
                  fontWeight: 600,
                  fontSize: '0.675rem',
                  px: 3,
                  pt: 1.5,
                  pb: 0.5,
                  display: 'block',
                }}
              >
                {sec.title}
              </Typography>
            )}
            <List disablePadding>
              {sec.items.map((item) => {
                const isSelected = location.pathname === item.path;

                return (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleNav(item.path)}
                      sx={{
                        py: 0.9,
                        px: 3,
                        mb: 0.2,
                        position: 'relative',
                        backgroundColor: isSelected ? '#E8EFE9' : 'transparent',
                        color: isSelected ? '#304B3A' : '#68706B',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: isSelected ? '#E8EFE9' : '#F3F5F2',
                          color: '#202522',
                        },
                        '&::before': isSelected
                          ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '15%',
                              height: '70%',
                              width: '3px',
                              backgroundColor: '#496A57',
                              borderRadius: '0 2px 2px 0',
                            }
                          : undefined,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 30,
                          color: isSelected ? '#496A57' : '#68706B',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isSelected ? 600 : 400,
                              fontSize: '0.825rem',
                              color: isSelected ? '#304B3A' : 'inherit',
                            }}
                          >
                            {item.label}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer Info */}
      <Box sx={{ p: 2.5, borderTop: '1px solid #E5E8E4', textAlign: 'left' }}>
        <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.725rem', display: 'block' }}>
          Municipal Helpline: 1800-11-2024
        </Typography>
        <Typography variant="caption" sx={{ color: '#8E9691', fontSize: '0.7rem', display: 'block', mt: 0.3 }}>
          © {new Date().getFullYear()} State Civic Services
        </Typography>
      </Box>
    </Box>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box', borderRight: '1px solid #E5E8E4' },
        }}
      >
        <SidebarContent onItemClick={onMobileClose} />
      </Drawer>

      {/* Desktop Permanent Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 250,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 250, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
          <SidebarContent />
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
