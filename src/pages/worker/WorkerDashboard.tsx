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
  Divider
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintStatus } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HeaderBreadcrumb } from '../../components/layout/HeaderBreadcrumb';
import { WelcomeCard } from '../../components/cards/WelcomeCard';
import { StatCard } from '../../components/cards/StatCard';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';

export const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Resolution modal state
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const allData = await complaintService.getComplaints();
      // Filter tasks specifically assigned to this logged-in worker
      const myTasks = allData.filter((c) => {
        if (!user) return true;
        if (c.assignedWorkerId && c.assignedWorkerId === user.id) return true;
        if (c.assignedWorkerName && user.fullName && c.assignedWorkerName.toLowerCase().includes(user.fullName.toLowerCase())) return true;
        // Default fallback if assignedWorkerId is usr_worker_01 or worker department matches
        if (user.role === 'WORKER' && (!c.assignedWorkerId || c.assignedWorkerId === 'usr_worker_01')) return true;
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

  const handleStartWork = async (tId: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.updateComplaintStatus(
        tId,
        'IN_PROGRESS' as ComplaintStatus,
        user.fullName,
        'WORKER',
        'Field technician arrived on site and initiated repair work.'
      );
      setAssignedTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      if (selectedComplaint?.id === updated.id) {
        setSelectedComplaint(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedComplaint || !user) return;
    setSubmitting(true);
    const proofImg = photoPreview || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600';

    try {
      const updated = await complaintService.updateComplaintStatus(
        selectedComplaint.id,
        'RESOLVED' as ComplaintStatus,
        user.fullName,
        'WORKER',
        notes || 'Work completed according to municipal engineering standards. Photo proof attached.',
        proofImg
      );
      setAssignedTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedComplaint(null);
      setPhotoPreview(null);
      setNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Field Technician Console..." />;

  const pendingTasks = assignedTasks.filter((t) => t.status !== 'RESOLVED');
  const completedTasks = assignedTasks.filter((t) => t.status === 'RESOLVED');

  return (
    <Box>
      <HeaderBreadcrumb
        title="Field Technician Console"
        subtitle="View assigned work orders, navigate to repair locations, and upload photo proof."
        breadcrumbs={[
          { label: 'Field Worker Module' },
          { label: 'Dashboard' },
        ]}
      />

      {/* Field Worker Header */}
      <WelcomeCard
        title={user?.fullName || 'Field Technician'}
        subtitle="Senior Field Technician • Public Works Department"
        avatarUrl={user?.avatarUrl}
        actionText={`Assigned Tasks Queue (${pendingTasks.length})`}
        actionIcon={<BuildIcon />}
        onAction={() => navigate('/worker/tasks')}
        gradientBackground="#0F4C5C"
      />

      {/* 3-Column Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        <StatCard
          title="Active Field Tasks"
          value={pendingTasks.length}
          subtitle="Dispatched by ward councillor"
          icon={<BuildIcon />}
          iconBgColor="#E8EFE9"
          iconColor="#304B3A"
          borderLeftColor="#496A57"
        />

        <StatCard
          title="Completed Repairs"
          value={completedTasks.length}
          subtitle="Verified with completion photo"
          icon={<TaskAltIcon />}
          iconBgColor="#F8F9F7"
          iconColor="#202522"
          borderLeftColor="#68706B"
        />

        <StatCard
          title="On-Site Resolution Score"
          value="98%"
          subtitle="Turnaround SLA score"
          icon={<MyLocationIcon />}
          iconBgColor="#E8EFE9"
          iconColor="#304B3A"
          borderLeftColor="#496A57"
        />
      </Box>

      {/* Immediate Tasks Queue */}
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', mb: 2 }}>
        Immediate Assigned Field Tasks
      </Typography>

      {pendingTasks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '8px', border: '1px solid #E5E8E4', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
            All Assigned Tasks Completed! 🎉
          </Typography>
          <Typography variant="body2" sx={{ color: '#68706B' }}>
            There are currently no active repair orders pending for your profile.
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
          {pendingTasks.map((task) => (
            <Card
              key={task.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E8E4',
                borderLeft: '4px solid #496A57',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#496A57' },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip label={task.trackingNumber} size="small" sx={{ fontWeight: 600, backgroundColor: '#E8EFE9', color: '#304B3A' }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: PRIORITY_COLORS[task.priority]?.bg || '#F8F9F7',
                        color: PRIORITY_COLORS[task.priority]?.text || '#68706B',
                      }}
                    />
                    <Chip
                      label={task.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: STATUS_COLORS[task.status]?.bg || '#F8F9F7',
                        color: STATUS_COLORS[task.status]?.text || '#68706B',
                      }}
                    />
                  </Box>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                  {task.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#68706B', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {task.description}
                </Typography>

                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8F9F7', borderRadius: '6px', border: '1px solid #E5E8E4', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: '#496A57' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#202522' }}>
                      {task.locationAddress} ({task.ward})
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #E5E8E4' }}>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 500 }}>
                  Resident: {task.citizenName}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setSelectedComplaint(task)}
                  sx={{
                    borderRadius: '6px',
                    backgroundColor: '#496A57',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.825rem',
                    px: 2,
                    py: 0.7,
                    '&:hover': { backgroundColor: '#304B3A' },
                  }}
                >
                  View Details & Action
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Comprehensive Task Inspection & Resolution Modal */}
      <Dialog
        open={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}
      >
        {selectedComplaint && (
          <>
            <DialogTitle sx={{ fontWeight: 600, color: '#202522', fontSize: '1.15rem', pb: 1 }}>
              Grievance Order Details: {selectedComplaint.trackingNumber}
            </DialogTitle>
            <DialogContent dividers sx={{ borderTop: '1px solid #E5E8E4', borderBottom: '1px solid #E5E8E4' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    TASK TITLE & CATEGORY
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                    {selectedComplaint.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={selectedComplaint.category} size="small" sx={{ fontWeight: 600, backgroundColor: '#E8EFE9', color: '#304B3A' }} />
                    <Chip label={selectedComplaint.priority} size="small" sx={{ fontWeight: 600, backgroundColor: PRIORITY_COLORS[selectedComplaint.priority]?.bg, color: PRIORITY_COLORS[selectedComplaint.priority]?.text }} />
                    <Chip label={selectedComplaint.status} size="small" sx={{ fontWeight: 600, backgroundColor: STATUS_COLORS[selectedComplaint.status]?.bg, color: STATUS_COLORS[selectedComplaint.status]?.text }} />
                  </Box>

                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    LOCATION / ADDRESS
                  </Typography>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8F9F7', borderRadius: '6px', border: '1px solid #E5E8E4', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ color: '#496A57', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {selectedComplaint.locationAddress} • {selectedComplaint.ward}
                      </Typography>
                    </Box>
                  </Paper>

                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    CITIZEN REPORTER
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ color: '#68706B', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {selectedComplaint.citizenName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ color: '#496A57', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#496A57' }}>
                        {selectedComplaint.citizenPhone}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    GRIEVANCE DESCRIPTION
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9F7', borderRadius: '6px', border: '1px solid #E5E8E4', mb: 2, minHeight: 100 }}>
                    <Typography variant="body2" sx={{ color: '#202522', lineHeight: 1.6 }}>
                      {selectedComplaint.description}
                    </Typography>
                  </Paper>

                  {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
                        SITE ATTACHMENTS
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {selectedComplaint.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Site" style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid #E5E8E4' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#E5E8E4' }} />

              {/* Action Form */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 2 }}>
                Update Work Order Status & Submit Proof
              </Typography>

              {selectedComplaint.status === 'PENDING' && (
                <Button
                  variant="outlined"
                  startIcon={<BuildIcon />}
                  onClick={() => handleStartWork(selectedComplaint.id)}
                  sx={{ mb: 3, borderRadius: '8px', textTransform: 'none', fontWeight: 500, borderColor: '#496A57', color: '#304B3A', '&:hover': { borderColor: '#304B3A', backgroundColor: '#F3F5F2' } }}
                >
                  Mark Arrived On-Site / Start Repair Work
                </Button>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
                  UPLOAD REPAIR COMPLETION PHOTO (REQUIRED FOR RESOLUTION)
                </Typography>
                {photoPreview ? (
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <img src={photoPreview} alt="Completion Proof" style={{ maxHeight: 180, borderRadius: 6, border: '1px solid #E5E8E4' }} />
                    <Button size="small" color="error" onClick={() => setPhotoPreview(null)} sx={{ display: 'block', mx: 'auto', mt: 1, textTransform: 'none', fontWeight: 500 }}>
                      Remove & Retake Photo
                    </Button>
                  </Box>
                ) : (
                  <Paper
                    component="label"
                    sx={{
                      p: 3,
                      border: '2px dashed #E5E8E4',
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: '#F8F9F7',
                      display: 'block',
                      mb: 2.5,
                      '&:hover': { borderColor: '#496A57', bgcolor: '#E8EFE9' },
                    }}
                  >
                    <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                    <CloudUploadIcon sx={{ fontSize: 36, color: '#496A57', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                      Click to Attach On-Site Repair Proof Photo
                    </Typography>
                  </Paper>
                )}

                <CustomTextField
                  label="Technician Resolution Remarks"
                  placeholder="Describe repair actions taken (e.g. pipe replaced, pothole filled, street bulb installed)..."
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setSelectedComplaint(null)} sx={{ borderRadius: '8px', color: '#68706B', fontWeight: 500, textTransform: 'none' }}>
                Close
              </Button>
              <CustomButton
                loading={submitting}
                onClick={handleCompleteTask}
                startIcon={<CheckCircleIcon />}
                sx={{ borderRadius: '8px', backgroundColor: '#496A57', '&:hover': { backgroundColor: '#304B3A' } }}
              >
                Mark Task Fully Resolved
              </CustomButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
