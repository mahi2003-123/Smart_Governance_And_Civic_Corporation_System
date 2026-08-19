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
      const data = await complaintService.getComplaints({ assignedWorkerId: user?.id || 'usr_worker_01' });
      setTasks(data);
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
    <Box>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800}>
          Field Repair Tasks Queue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Execute assigned ward maintenance tasks, log site arrival, and upload completion evidence.
        </Typography>
      </Box>

      {pendingList.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            All assigned tasks completed!
          </Typography>
          <Typography variant="body2">No pending repair orders assigned to your profile right now.</Typography>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {pendingList.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card sx={{ p: 3, borderRadius: 4 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
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

                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {task.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {task.description}
                    </Typography>

                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Paper sx={{ p: 1, px: 2, bgcolor: '#F8F5F2', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: '#6F4E37' }} />
                        <Typography variant="caption" fontWeight={600}>
                          {task.locationAddress}
                        </Typography>
                      </Paper>

                      <Paper sx={{ p: 1, px: 2, bgcolor: '#F8F5F2', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" sx={{ color: '#6F4E37' }} />
                        <Typography variant="caption" fontWeight={600}>
                          Resident: {task.citizenName} ({task.citizenPhone})
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  {/* Field Actions */}
                  <Grid item xs={12} md={4}>
                    <Box display="flex" flexDirection="column" gap={1.5} alignItems={{ md: 'flex-end' }}>
                      {task.status === 'PENDING' && (
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<BuildIcon />}
                          onClick={() => handleStartWork(task.id)}
                          sx={{ borderRadius: 28 }}
                        >
                          Mark Arrived / Start Work
                        </Button>
                      )}

                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => setActiveTask(task)}
                        sx={{ borderRadius: 28 }}
                      >
                        Upload Photo & Resolve
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Completion Modal */}
      <Dialog open={Boolean(activeTask)} onClose={() => setActiveTask(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
        <DialogTitle fontWeight={800}>Submit Repair Completion Proof</DialogTitle>
        <DialogContent>
          {activeTask && (
            <>
              <Typography variant="subtitle2" color="primary" mb={2}>
                {activeTask.trackingNumber}: {activeTask.title}
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Upload Completion Photo (Required)
              </Typography>

              {photoPreview ? (
                <Box mb={2} textAlign="center">
                  <img src={photoPreview} alt="Completion Proof" style={{ maxHeight: 180, borderRadius: 12 }} />
                  <Button size="small" color="error" onClick={() => setPhotoPreview(null)} sx={{ display: 'block', mx: 'auto', mt: 1 }}>
                    Retake Photo
                  </Button>
                </Box>
              ) : (
                <Paper
                  component="label"
                  sx={{
                    p: 3,
                    border: '2px dashed #6F4E37',
                    borderRadius: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: '#F8F5F2',
                    mb: 2.5,
                  }}
                >
                  <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#6F4E37', mb: 1 }} />
                  <Typography variant="body2" fontWeight={700}>
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
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveTask(null)} sx={{ borderRadius: 28 }}>
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
