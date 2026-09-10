import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DraftsIcon from '@mui/icons-material/Drafts';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { notificationService } from '../../services/notificationService';
import { Complaint, ComplaintStatus } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HeaderBreadcrumb } from '../../components/layout/HeaderBreadcrumb';
import { WelcomeCard } from '../../components/cards/WelcomeCard';
import { StatCard } from '../../components/cards/StatCard';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';

const DELAY_REASONS = [
  'Material & Spare Parts Delay',
  'Severe Weather / Heavy Rain',
  'Equipment Breakdown / Tool Requirement',
  'Site Access Blocked / Traffic Diversion',
  'Additional Engineering Team Required',
  'Hazardous Conditions / Electrical Risk',
  'Custom Field Reason'
];

export const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState<Complaint[]>([]);
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Read status tracking
  const [readTaskIds, setReadTaskIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sgcs_read_tasks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Resolution modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Explicit Refs for File Inputs to guarantee file picker triggers across all browsers
  const beforeInputRef = React.useRef<HTMLInputElement | null>(null);
  const afterInputRef = React.useRef<HTMLInputElement | null>(null);
  const delayInputRef = React.useRef<HTMLInputElement | null>(null);

  // Delay modal state
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState(DELAY_REASONS[0]);
  const [customDelayReason, setCustomDelayReason] = useState('');
  const [delayNotes, setDelayNotes] = useState('');
  const [delayPhoto, setDelayPhoto] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const allData = await complaintService.getComplaints();
      
      // STRICT FILTERING: Only show tasks specifically assigned to THIS logged in worker
      const myTasks = allData.filter((c) => {
        if (!user) return false;

        // 1. Match exact worker ID or email
        if (c.assignedWorkerId && (
          c.assignedWorkerId === user.id ||
          c.assignedWorkerId === user.email ||
          user.id.includes(c.assignedWorkerId) ||
          c.assignedWorkerId.includes(user.id)
        )) {
          return true;
        }

        // 2. Match worker Name (handles formats like "Suryan (Field Technician)" vs "Suryan")
        if (c.assignedWorkerName && user.fullName) {
          const cleanAssignedName = c.assignedWorkerName.toLowerCase().replace(/\(.*?\)/g, '').trim();
          const cleanUserName = user.fullName.toLowerCase().trim();
          if (cleanAssignedName.length > 1 && (cleanAssignedName.includes(cleanUserName) || cleanUserName.includes(cleanAssignedName))) {
            return true;
          }
        }

        return false;
      });

      setAssignedTasks(myTasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const toggleMarkAsRead = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadTaskIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(taskId)) {
        updated.delete(taskId);
      } else {
        updated.add(taskId);
      }
      try {
        localStorage.setItem('sgcs_read_tasks', JSON.stringify(Array.from(updated)));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const markAsRead = (taskId: string) => {
    setReadTaskIds((prev) => {
      if (prev.has(taskId)) return prev;
      const updated = new Set(prev);
      updated.add(taskId);
      try {
        localStorage.setItem('sgcs_read_tasks', JSON.stringify(Array.from(updated)));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const isOverdue = (task: Complaint) => {
    if (task.status === 'RESOLVED' || task.status === 'PENDING_APPROVAL' || task.status === 'REJECTED') return false;
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isDueToday = (task: Complaint) => {
    if (task.status === 'RESOLVED' || task.status === 'PENDING_APPROVAL' || task.status === 'REJECTED') return false;
    if (!task.dueDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  };

  const isUpcoming = (task: Complaint) => {
    if (task.status === 'RESOLVED' || task.status === 'PENDING_APPROVAL' || task.status === 'REJECTED') return false;
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due > today;
  };

  const overdueTasks = assignedTasks.filter(isOverdue);
  const todaysTasks = assignedTasks.filter((t) => (isDueToday(t) || t.status === 'IN_PROGRESS') && !isOverdue(t));
  const upcomingTasks = assignedTasks.filter(isUpcoming);
  const pendingApprovalTasks = assignedTasks.filter((t) => t.status === 'PENDING_APPROVAL');
  const completedTasks = assignedTasks.filter((t) => t.status === 'RESOLVED');

  const handleStartWork = async (task: Complaint, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await complaintService.updateComplaintStatus(
        task.id,
        'IN_PROGRESS' as ComplaintStatus,
        user?.fullName || 'Worker',
        'WORKER',
        'Field technician arrived on-site and initiated repair work.'
      );
      setAssignedTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      if (selectedTask?.id === updated.id) {
        setSelectedTask(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCompleteSubmit = async () => {
    if (!selectedTask || !user) return;

    // MANDATORY VALIDATION: Resolved / After Photo must be provided
    if (!afterPhoto || !afterPhoto.trim()) {
      alert('A valid Resolved Photo / After Photo is MANDATORY to mark a task as completed.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await complaintService.completeTask(
        selectedTask.id,
        notes || 'Work completed according to municipal engineering standards.',
        afterPhoto,
        beforePhoto || undefined
      );

      // Generate notification for citizen and councillor
      await notificationService.addNotification({
        title: 'Work Order Completed (Pending Councillor Approval)',
        message: `${user.fullName} completed work on ${selectedTask.trackingNumber} ("${selectedTask.title}") and submitted proof for Councillor verification.`,
        type: 'COMPLAINT',
        linkUrl: `/citizen/complaints/${selectedTask.id}`
      });

      setAssignedTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setCompleteModalOpen(false);
      setDetailsModalOpen(false);
      setSelectedTask(null);
      setNotes('');
      setBeforePhoto(null);
      setAfterPhoto(null);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to complete task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelaySubmit = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      const finalReason = delayReason === 'Custom Field Reason' ? (customDelayReason || 'Field Obstacle') : delayReason;
      const updated = await complaintService.updateComplaintStatus(
        selectedTask.id,
        'PENDING' as ComplaintStatus,
        user?.fullName || 'Worker',
        'WORKER',
        `Delayed: ${finalReason}. ${delayNotes}`
      );
      setAssignedTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...updated, delayReason: finalReason, delayNotes } : t)));
      setDelayModalOpen(false);
      setDetailsModalOpen(false);
      setSelectedTask(null);
      setDelayNotes('');
      setCustomDelayReason('');
      setDelayPhoto(null);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to report delay');
    } finally {
      setSubmitting(false);
    }
  };

  const openTaskDetails = (task: Complaint) => {
    setSelectedTask(task);
    markAsRead(task.id);
    setDetailsModalOpen(true);
  };

  const displayedTasks =
    tabValue === 0
      ? todaysTasks
      : tabValue === 1
      ? overdueTasks
      : tabValue === 2
      ? upcomingTasks
      : tabValue === 3
      ? pendingApprovalTasks
      : completedTasks;

  return (
    <Box sx={{ pb: 6 }}>
      <HeaderBreadcrumb
        title="My Daily Task Console"
        subtitle="View tasks strictly assigned to you, inspect full complaint details, mark as read, report delays, and complete repair work."
        breadcrumbs={[
          { label: 'Worker Portal' },
          { label: 'Assigned Work Orders' },
        ]}
      />

      <WelcomeCard
        title={user?.fullName || 'Local Field Technician'}
        subtitle={`Technician • ${user?.ward || 'Central Municipal Ward'}`}
        avatarUrl={user?.avatarUrl}
        actionText={`My Active Tasks (${todaysTasks.length + overdueTasks.length})`}
        actionIcon={<BuildIcon />}
        onAction={() => setTabValue(0)}
        gradientBackground="#1F4D3A"
      />

      {overdueTasks.length > 0 && (
        <Alert
          severity="error"
          icon={<WarningAmberIcon fontSize="inherit" />}
          sx={{
            mb: 3,
            borderRadius: '8px',
            border: '1px solid #F87171',
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            fontWeight: 600,
            '& .MuiAlert-icon': { color: '#DC2626' }
          }}
        >
          ATTENTION: You have {overdueTasks.length} OVERDUE work order(s) assigned to your profile!
        </Alert>
      )}

      {/* Metrics Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          title="Today's Assigned Tasks"
          value={todaysTasks.length}
          subtitle="Assigned specifically to you"
          icon={<CalendarTodayIcon />}
          iconBgColor="#E8EFE9"
          iconColor="#304B3A"
          borderLeftColor="#496A57"
        />

        <StatCard
          title="Overdue Work Orders"
          value={overdueTasks.length}
          subtitle="Past due deadline"
          icon={<WarningAmberIcon />}
          iconBgColor="#FEE2E2"
          iconColor="#DC2626"
          borderLeftColor="#DC2626"
        />

        <StatCard
          title="Upcoming Schedule"
          value={upcomingTasks.length}
          subtitle="Future assigned tasks"
          icon={<AccessTimeIcon />}
          iconBgColor="#F8F9F7"
          iconColor="#68706B"
          borderLeftColor="#68706B"
        />

        <StatCard
          title="Completed & Verified"
          value={completedTasks.length}
          subtitle="Resolved work orders"
          icon={<TaskAltIcon />}
          iconBgColor="#E8EFE9"
          iconColor="#304B3A"
          borderLeftColor="#496A57"
        />
      </Box>

      {/* Tabs Filter Header */}
      <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #E5E8E4', mb: 3, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: 48,
              color: '#68706B',
              '&.Mui-selected': { color: '#304B3A' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#496A57', height: 3 },
          }}
        >
          <Tab label={`Today's Tasks (${todaysTasks.length})`} />
          <Tab label={`Overdue (${overdueTasks.length})`} sx={{ color: overdueTasks.length > 0 ? '#DC2626 !important' : undefined }} />
          <Tab label={`Upcoming (${upcomingTasks.length})`} />
          <Tab label={`Pending Approval (${pendingApprovalTasks.length})`} sx={{ color: pendingApprovalTasks.length > 0 ? '#D97706 !important' : undefined }} />
          <Tab label={`Completed & Approved (${completedTasks.length})`} />
        </Tabs>
      </Paper>

      {/* Task List Grid */}
      {displayedTasks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, borderRadius: '8px', border: '1px solid #E5E8E4', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
            No Assigned Tasks In This Queue
          </Typography>
          <Typography variant="body2" sx={{ color: '#68706B' }}>
            Only work orders assigned specifically to your account appear here.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2.5,
          }}
        >
          {displayedTasks.map((task) => {
            const taskIsOverdue = isOverdue(task);
            const taskIsInProgress = task.status === 'IN_PROGRESS';
            const taskIsResolved = task.status === 'RESOLVED';
            const isRead = readTaskIds.has(task.id);

            return (
              <Card
                key={task.id}
                elevation={0}
                onClick={() => openTaskDetails(task)}
                sx={{
                  p: 3,
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E8E4',
                  borderLeft: taskIsOverdue
                    ? '5px solid #DC2626'
                    : taskIsInProgress
                    ? '5px solid #EAB308'
                    : taskIsResolved
                    ? '5px solid #16A34A'
                    : '5px solid #496A57',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: '#496A57', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={task.trackingNumber} size="small" sx={{ fontWeight: 700, backgroundColor: '#E8EFE9', color: '#304B3A' }} />
                      {taskIsOverdue && (
                        <Chip label="OVERDUE" size="small" sx={{ fontWeight: 800, backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '0.675rem' }} />
                      )}
                      {isRead ? (
                        <Chip label="Read" size="small" icon={<MarkEmailReadIcon style={{ fontSize: 14 }} />} sx={{ fontWeight: 600, backgroundColor: '#F3F5F2', color: '#68706B', fontSize: '0.675rem' }} />
                      ) : (
                        <Chip label="Unread" size="small" icon={<DraftsIcon style={{ fontSize: 14 }} />} sx={{ fontWeight: 700, backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '0.675rem' }} />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: PRIORITY_COLORS[task.priority]?.bg || '#F8F9F7',
                          color: PRIORITY_COLORS[task.priority]?.text || '#68706B',
                        }}
                      />
                      <Chip
                        label={task.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: STATUS_COLORS[task.status]?.bg || '#F8F9F7',
                          color: STATUS_COLORS[task.status]?.text || '#68706B',
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                    {task.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#68706B', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.description}
                  </Typography>

                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8F9F7', borderRadius: '6px', border: '1px solid #E5E8E4', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                      <LocationOnIcon fontSize="small" sx={{ color: '#496A57' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#202522' }}>
                        {task.locationAddress} ({task.ward})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" sx={{ color: '#496A57', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#496A57' }}>
                          <a href={`tel:${task.citizenPhone}`} onClick={(e) => e.stopPropagation()} style={{ color: '#496A57', textDecoration: 'none' }}>
                            {task.citizenName} ({task.citizenPhone})
                          </a>
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: taskIsOverdue ? '#DC2626' : '#68706B' }}>
                        Due: {task.dueDate ? task.dueDate.split('T')[0] : 'Today'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* Card Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #E5E8E4', gap: 1 }}>
                  {!taskIsResolved ? (
                    <>
                      {task.status === 'PENDING' ? (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={(e) => handleStartWork(task, e)}
                          sx={{
                            borderRadius: '6px',
                            borderColor: '#496A57',
                            color: '#304B3A',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            '&:hover': { borderColor: '#304B3A', bgcolor: '#E8EFE9' },
                          }}
                        >
                          Start Task
                        </Button>
                      ) : (
                        <Chip
                          label="In Progress"
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: '#FEF08A', color: '#854D0E' }}
                        />
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          startIcon={<ReportProblemIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                            setDelayModalOpen(true);
                          }}
                          sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          Delay
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                            setCompleteModalOpen(true);
                          }}
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#496A57',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            '&:hover': { backgroundColor: '#304B3A' },
                          }}
                        >
                          Complete
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Verified & Completed" size="small" sx={{ fontWeight: 700, bgcolor: '#DCFCE7', color: '#166534' }} />
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskDetails(task);
                        }}
                        sx={{ color: '#496A57', fontWeight: 600, textTransform: 'none' }}
                      >
                        View Details
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Comprehensive Task Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}
      >
        {selectedTask && (
          <>
            <DialogTitle sx={{ fontWeight: 700, color: '#202522', fontSize: '1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Work Order Details: {selectedTask.trackingNumber}</span>
                {readTaskIds.has(selectedTask.id) && (
                  <Chip label="Read & Acknowledged" size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.675rem' }} />
                )}
              </Box>
              <Button
                size="small"
                variant={readTaskIds.has(selectedTask.id) ? 'outlined' : 'contained'}
                color={readTaskIds.has(selectedTask.id) ? 'inherit' : 'primary'}
                onClick={() => toggleMarkAsRead(selectedTask.id)}
                startIcon={readTaskIds.has(selectedTask.id) ? <DraftsIcon /> : <MarkEmailReadIcon />}
                sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem' }}
              >
                {readTaskIds.has(selectedTask.id) ? 'Mark as Unread' : 'Mark as Read'}
              </Button>
            </DialogTitle>

            <DialogContent dividers sx={{ borderTop: '1px solid #E5E8E4', borderBottom: '1px solid #E5E8E4' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    TASK TITLE & CATEGORY
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                    {selectedTask.title}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={selectedTask.category} size="small" sx={{ fontWeight: 600, backgroundColor: '#E8EFE9', color: '#304B3A' }} />
                    <Chip label={selectedTask.priority} size="small" sx={{ fontWeight: 600, backgroundColor: PRIORITY_COLORS[selectedTask.priority]?.bg, color: PRIORITY_COLORS[selectedTask.priority]?.text }} />
                    <Chip label={selectedTask.status.replace('_', ' ')} size="small" sx={{ fontWeight: 600, backgroundColor: STATUS_COLORS[selectedTask.status]?.bg, color: STATUS_COLORS[selectedTask.status]?.text }} />
                  </Box>

                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    LOCATION & WARD
                  </Typography>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8F9F7', borderRadius: '6px', border: '1px solid #E5E8E4', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ color: '#496A57', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {selectedTask.locationAddress} • {selectedTask.ward}
                      </Typography>
                    </Box>
                  </Paper>

                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    RESIDENT CONTACT
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ color: '#68706B', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {selectedTask.citizenName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ color: '#496A57', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#496A57' }}>
                        <a href={`tel:${selectedTask.citizenPhone}`} style={{ color: '#496A57', textDecoration: 'none' }}>
                          {selectedTask.citizenPhone}
                        </a>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    FULL GRIEVANCE DESCRIPTION
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9F7', borderRadius: '6px', border: '1px solid #E5E8E4', mb: 2, minHeight: 100 }}>
                    <Typography variant="body2" sx={{ color: '#202522', lineHeight: 1.6 }}>
                      {selectedTask.description}
                    </Typography>
                  </Paper>

                  {selectedTask.images && selectedTask.images.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 700, display: 'block', mb: 1 }}>
                        SITE ATTACHMENTS
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedTask.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Site attachment" style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid #E5E8E4' }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {selectedTask.delayReason && (
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '6px', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        LOGGED DELAY OBSTACLE:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#78350F', fontWeight: 600 }}>
                        {selectedTask.delayReason}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#E5E8E4' }} />

              {/* Action Buttons Bar Inside Modal */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#202522' }}>
                  Execute Work Order Action:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {selectedTask.status === 'PENDING' && (
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleStartWork(selectedTask)}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: '#496A57', color: '#304B3A' }}
                    >
                      Start Task / Arrived On-Site
                    </Button>
                  )}

                  {selectedTask.status !== 'RESOLVED' && (
                    <>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<ReportProblemIcon />}
                        onClick={() => {
                          setDetailsModalOpen(false);
                          setDelayModalOpen(true);
                        }}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                      >
                        Report Delay
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => {
                          setDetailsModalOpen(false);
                          setCompleteModalOpen(true);
                        }}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, backgroundColor: '#496A57', '&:hover': { backgroundColor: '#304B3A' } }}
                      >
                        Complete Task & Submit Proof
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setDetailsModalOpen(false)} sx={{ borderRadius: '8px', color: '#68706B', fontWeight: 600, textTransform: 'none' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Task Completion Modal */}
      <Dialog
        open={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}
      >
        {selectedTask && (
          <>
            <DialogTitle sx={{ fontWeight: 700, color: '#202522', fontSize: '1.15rem' }}>
              Complete Repair Order: {selectedTask.trackingNumber}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                {selectedTask.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', mb: 3 }}>
                Location: {selectedTask.locationAddress} ({selectedTask.ward})
              </Typography>

              {!afterPhoto && (
                <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '8px', fontWeight: 600 }}>
                  ⚠️ MANDATORY REQUIREMENT: You MUST upload a valid "Resolved Photo / After Photo" before marking this task as completed.
                </Alert>
              )}

              {/* Hidden File Inputs */}
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, setBeforePhoto)}
              />
              <input
                ref={afterInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, setAfterPhoto)}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#68706B', display: 'block', mb: 1 }}>
                    BEFORE PHOTO (OPTIONAL)
                  </Typography>
                  {beforePhoto ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <img src={beforePhoto} alt="Before" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 6 }} />
                      <Button size="small" color="error" onClick={() => setBeforePhoto(null)} sx={{ textTransform: 'none', mt: 0.5 }}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Paper
                      onClick={() => beforeInputRef.current?.click()}
                      sx={{
                        p: 2,
                        border: '2px dashed #E5E8E4',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: '#F8F9F7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        '&:hover': { bgcolor: '#F0F4F1' }
                      }}
                    >
                      <CloudUploadIcon sx={{ color: '#496A57', fontSize: 28 }} />
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#202522' }}>
                        Upload Before Photo
                      </Typography>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.2 }}>
                        Select File
                      </Button>
                    </Paper>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#16A34A', display: 'block', mb: 1 }}>
                    RESOLVED / AFTER PHOTO (MANDATORY *)
                  </Typography>
                  {afterPhoto ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <img src={afterPhoto} alt="After" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 6, border: '2px solid #16A34A' }} />
                      <Button size="small" color="error" onClick={() => setAfterPhoto(null)} sx={{ textTransform: 'none', mt: 0.5 }}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Paper
                      onClick={() => afterInputRef.current?.click()}
                      sx={{
                        p: 2,
                        border: '2px dashed #16A34A',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: '#F0FDF4',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        '&:hover': { bgcolor: '#DCFCE7' }
                      }}
                    >
                      <CloudUploadIcon sx={{ color: '#16A34A', fontSize: 28 }} />
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#166534' }}>
                        Upload Resolved Photo *
                      </Typography>
                      <Button size="small" variant="contained" sx={{ bgcolor: '#16A34A', color: '#FFF', textTransform: 'none', fontSize: '0.75rem', py: 0.2 }}>
                        Choose Photo
                      </Button>
                    </Paper>
                  )}
                </Box>
              </Box>

              <CustomTextField
                label="Worker Completion Remarks & Any Engineering Notes"
                placeholder="Type any repair remarks, asphalt/mix tonnage, or pipe fittings installed..."
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setCompleteModalOpen(false)} sx={{ color: '#68706B', fontWeight: 600, textTransform: 'none' }}>
                Cancel
              </Button>
              <CustomButton
                loading={submitting}
                disabled={submitting || !afterPhoto}
                onClick={handleCompleteSubmit}
                startIcon={<CheckCircleIcon />}
                sx={{ backgroundColor: '#496A57', '&:hover': { backgroundColor: '#304B3A' } }}
              >
                Submit for Councillor Approval
              </CustomButton>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Report Delay Modal */}
      <Dialog
        open={delayModalOpen}
        onClose={() => setDelayModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}
      >
        {selectedTask && (
          <>
            <DialogTitle sx={{ fontWeight: 700, color: '#991B1B', fontSize: '1.15rem' }}>
              Report Field Task Delay: {selectedTask.trackingNumber}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 2 }}>
                {selectedTask.title}
              </Typography>

              <FormControl fullWidth sx={{ mb: 2.5 }}>
                <InputLabel sx={{ fontWeight: 600 }}>Primary Delay Reason Category</InputLabel>
                <Select
                  value={delayReason}
                  label="Primary Delay Reason Category"
                  onChange={(e) => setDelayReason(e.target.value)}
                  sx={{ borderRadius: '8px' }}
                >
                  {DELAY_REASONS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {delayReason === 'Custom Field Reason' && (
                <Box sx={{ mb: 2.5 }}>
                  <CustomTextField
                    label="Type Your Specific Custom Reason"
                    placeholder="Enter custom delay reason (e.g., Heavy traffic gridlock, Gas line leak risk)..."
                    value={customDelayReason}
                    onChange={(e) => setCustomDelayReason(e.target.value)}
                  />
                </Box>
              )}

              <CustomTextField
                label="Detailed Delay Explanation & Required Support"
                placeholder="Type any reason or notes explaining why repair work is held up..."
                multiline
                rows={3}
                value={delayNotes}
                onChange={(e) => setDelayNotes(e.target.value)}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#202522', display: 'block', mb: 1 }}>
                  ATTACH SITE OBSTACLE PHOTO (OPTIONAL)
                </Typography>
                <input
                  ref={delayInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, setDelayPhoto)}
                />
                {delayPhoto ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <img src={delayPhoto} alt="Delay obstacle" style={{ maxHeight: 140, borderRadius: 6 }} />
                    <Button size="small" color="error" onClick={() => setDelayPhoto(null)} sx={{ textTransform: 'none', display: 'block', mx: 'auto', mt: 0.5 }}>
                      Remove Photo
                    </Button>
                  </Box>
                ) : (
                  <Paper
                    onClick={() => delayInputRef.current?.click()}
                    sx={{
                      p: 2,
                      border: '2px dashed #E5E8E4',
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: '#F8F9F7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    <CloudUploadIcon sx={{ color: '#92400E', fontSize: 24 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#92400E' }}>
                      Click to Attach Obstacle Photo
                    </Typography>
                  </Paper>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setDelayModalOpen(false)} sx={{ color: '#68706B', fontWeight: 600, textTransform: 'none' }}>
                Cancel
              </Button>
              <CustomButton
                loading={submitting}
                color="warning"
                onClick={handleDelaySubmit}
                startIcon={<ReportProblemIcon />}
              >
                Log Task Delay Record
              </CustomButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default WorkerDashboard;
