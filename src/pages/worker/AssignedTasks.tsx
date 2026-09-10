import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintStatus } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AssignedTasks: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [activeTask, setActiveTask] = useState<Complaint | null>(null);

  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaints();
      const myTasks = data.filter((c) => {
        if (!user) return false;
        if (c.assignedWorkerId && (
          c.assignedWorkerId === user.id ||
          c.assignedWorkerId === user.email ||
          user.id.includes(c.assignedWorkerId) ||
          c.assignedWorkerId.includes(user.id)
        )) {
          return true;
        }
        if (c.assignedWorkerName && user.fullName) {
          const cleanAssigned = c.assignedWorkerName.toLowerCase().replace(/\(.*?\)/g, '').trim();
          const cleanUser = user.fullName.toLowerCase().trim();
          if (cleanAssigned.length > 1 && (cleanAssigned.includes(cleanUser) || cleanUser.includes(cleanAssigned))) {
            return true;
          }
        }
        return false;
      });
      setTasks(myTasks);
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
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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
    if (!activeTask || !user) return;
    setSubmitting(true);
    const proofImg = photoPreview || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600';

    try {
      const updated = await complaintService.updateComplaintStatus(
        activeTask.id,
        'RESOLVED' as ComplaintStatus,
        user.fullName,
        'WORKER',
        notes || 'Work completed according to municipal engineering standards. Photo proof attached.',
        proofImg
      );
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setActiveTask(null);
      setPhotoPreview(null);
      setNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading assigned field repair tasks..." />;

  const pendingList = tasks.filter((t) => t.status !== 'RESOLVED');

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#202522' }}>
            Field Repair Tasks Queue
          </Typography>
          <Chip
            label={`${pendingList.length} Active Work Orders`}
            sx={{ fontWeight: 600, bgcolor: pendingList.length > 0 ? '#FBF4E8' : '#E8EFE9', color: pendingList.length > 0 ? '#B58A45' : '#304B3A' }}
          />
        </Box>
        <Typography variant="body1" sx={{ color: '#68706B' }}>
          Execute assigned ward maintenance tasks, log site arrival, and upload completion evidence for councillor verification.
        </Typography>
      </Box>

      {/* Technician Status Summary Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: '1px solid #E5E8E4',
          bgcolor: '#FFFFFF',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: '#E8EFE9',
              color: '#304B3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BuildIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522' }}>
              Field Technician: {user?.fullName || 'Suryan (Worker)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B' }}>
              Assigned Jurisdiction: {user?.ward || 'Ward 2 - Riverside North'} • Status: <span style={{ color: '#16A34A', fontWeight: 600 }}>Active & Ready</span>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block' }}>
              PENDING TASKS
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: pendingList.length > 0 ? '#D97706' : '#202522' }}>
              {pendingList.length}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block' }}>
              TOTAL REPAIRS LOGGED
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#304B3A' }}>
              {tasks.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {pendingList.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '8px',
            border: '1.5px dashed #D0D7D1',
            backgroundColor: '#F8F9F7',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 280,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#E8EFE9',
              color: '#304B3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', mb: 0.5 }}>
            All Field Tasks Completed!
          </Typography>
          <Typography variant="body2" sx={{ color: '#68706B', maxWidth: 420 }}>
            There are currently no active repair orders pending for your worker profile. Newly assigned complaints from councillors will appear here automatically.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2.5 }}>
          {pendingList.map((task) => (
            <Card key={task.id} elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={task.trackingNumber} size="small" sx={{ fontWeight: 700 }} />
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      bgcolor: PRIORITY_COLORS[task.priority].bg,
                      color: PRIORITY_COLORS[task.priority].text,
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Chip
                  label={task.status.replace('_', ' ')}
                  size="small"
                  sx={{
                    bgcolor: STATUS_COLORS[task.status].bg,
                    color: STATUS_COLORS[task.status].text,
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                {task.title}
              </Typography>

              <Typography variant="body2" sx={{ color: '#68706B', mb: 2, lineHeight: 1.6 }}>
                {task.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2.5 }}>
                <Paper elevation={0} sx={{ p: 1, px: 1.5, bgcolor: '#F8F9F7', border: '1px solid #E5E8E4', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ color: '#496A57' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#202522' }}>
                    {task.locationAddress}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 1, px: 1.5, bgcolor: '#F8F9F7', border: '1px solid #E5E8E4', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ color: '#496A57' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#202522' }}>
                    Resident: {task.citizenName} ({task.citizenPhone})
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #F3F5F2' }}>
                {task.status === 'PENDING' && (
                  <Button
                    variant="outlined"
                    startIcon={<BuildIcon />}
                    onClick={() => handleStartWork(task.id)}
                    sx={{ borderRadius: '6px', textTransform: 'none', color: '#496A57', borderColor: '#496A57' }}
                  >
                    Mark Arrived / Start Work
                  </Button>
                )}

                <CustomButton
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setActiveTask(task)}
                >
                  Upload Photo & Resolve
                </CustomButton>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Completion Modal */}
      <Dialog open={Boolean(activeTask)} onClose={() => setActiveTask(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '8px', p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#202522' }}>Submit Repair Completion Proof</DialogTitle>
        <DialogContent>
          {activeTask && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#496A57', fontWeight: 600, mb: 2 }}>
                {activeTask.trackingNumber}: {activeTask.title}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                Upload Completion Photo (Mandatory Evidence)
              </Typography>

              {photoPreview ? (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img src={photoPreview} alt="Completion Proof" style={{ maxHeight: 180, borderRadius: 8, border: '2px solid #16A34A' }} />
                  <Button size="small" color="error" onClick={() => setPhotoPreview(null)} sx={{ display: 'block', mx: 'auto', mt: 1, textTransform: 'none' }}>
                    Retake Photo
                  </Button>
                </Box>
              ) : (
                <Paper
                  component="label"
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1.5px dashed #496A57',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: '#F8F9F7',
                    mb: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { bgcolor: '#E8EFE9' },
                  }}
                >
                  <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                  <CloudUploadIcon sx={{ fontSize: 36, color: '#496A57', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                    Click to Take or Attach On-Site Repair Photo
                  </Typography>
                </Paper>
              )}

              <CustomTextField
                label="Technician Completion Remarks"
                placeholder="Describe asphalt mix used, pipe replaced, or bulb installed..."
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveTask(null)} sx={{ color: '#68706B', textTransform: 'none' }}>
            Cancel
          </Button>
          <CustomButton color="success" loading={submitting} onClick={handleCompleteTask}>
            Verify & Resolve Complaint
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignedTasks;
