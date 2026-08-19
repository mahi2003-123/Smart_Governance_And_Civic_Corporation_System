import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddTaskIcon from '@mui/icons-material/AddTask';
import HistoryIcon from '@mui/icons-material/History';
import ForumIcon from '@mui/icons-material/Forum';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BuildIcon from '@mui/icons-material/Build';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import ShieldIcon from '@mui/icons-material/Shield';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavMenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = (): NavMenuItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'CITIZEN':
        return [
          { label: 'Citizen Dashboard', path: '/citizen/dashboard', icon: <DashboardIcon /> },
          { label: 'Submit Complaint', path: '/citizen/complaints', icon: <AddTaskIcon /> },
          { label: 'Complaint History', path: '/citizen/history', icon: <HistoryIcon /> },
          { label: 'Community Proposals', path: '/citizen/proposals', icon: <ForumIcon /> },
          { label: 'Ward Notices', path: '/citizen/notices', icon: <CampaignIcon /> },
          { label: 'My Profile', path: '/citizen/profile', icon: <PersonIcon /> },
        ];
      case 'COUNCILLOR':
        return [
          { label: 'Councillor Dashboard', path: '/councillor/dashboard', icon: <DashboardIcon /> },
          { label: 'Manage Complaints', path: '/councillor/complaints', icon: <AssignmentIcon /> },
          { label: 'Proposal Review', path: '/councillor/proposals', icon: <RateReviewIcon /> },
          { label: 'Ward Announcements', path: '/councillor/announcements', icon: <CampaignIcon /> },
          { label: 'Ward Reports', path: '/councillor/reports', icon: <AssessmentIcon /> },
        ];
      case 'WORKER':
        return [
          { label: 'Worker Dashboard', path: '/worker/dashboard', icon: <DashboardIcon /> },
          { label: 'Assigned Tasks', path: '/worker/tasks', icon: <BuildIcon /> },
          { label: 'Completed Tasks', path: '/worker/completed', icon: <TaskAltIcon /> },
        ];
      case 'ADMIN':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
          { label: 'User Management', path: '/admin/users', icon: <PeopleIcon /> },
          { label: 'Ward Management', path: '/admin/wards', icon: <MapIcon /> },
          { label: 'Complaint Monitoring', path: '/admin/complaints', icon: <ShieldIcon /> },
          { label: 'System Reports', path: '/admin/reports', icon: <AssessmentIcon /> },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          borderRadius: '0 24px 24px 0',
          bgcolor: 'background.paper',
          p: 2,
        },
      }}
    >
      {/* Drawer Header */}
      <Box p={2} mb={1}>
        <Typography variant="h6" fontWeight={800} color="primary" gutterBottom sx={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          CivicSphere SGCS
        </Typography>
        {user && (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={ROLE_LABELS[user.role]}
              size="small"
              sx={{ bgcolor: '#F6DECD', color: '#4F4034', fontWeight: 700 }}
            />
            {user.ward && (
              <Typography variant="caption" color="text.secondary" noWrap maxWidth={140}>
                {user.ward}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Navigation Links */}
      <List disablePadding>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  px: 2,
                  bgcolor: isSelected ? '#4F4034' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'text.primary',
                  '&:hover': {
                    bgcolor: isSelected ? '#382B21' : 'action.hover',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isSelected ? '#FFFFFF' : '#6D5B4A',
                    minWidth: 40,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};
