import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  CardMedia,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState<'Satisfied' | 'Not Satisfied'>('Satisfied');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id || !user) return;
    setSubmittingComment(true);
    try {
      const updated = await complaintService.addComment(
        id,
        user.fullName,
        user.role,
        newComment.trim()
      );
      setComplaint(updated);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  const handleBack = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/complaints');
    } else if (user?.role === 'COUNCILLOR') {
      navigate('/councillor/complaints');
    } else if (user?.role === 'WORKER') {
      navigate('/worker/tasks');
    } else {
      navigate('/citizen/complaints');
    }
  };

  if (loading) return <LoadingSpinner message="Loading complaint record..." />;

  if (!complaint)
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h3" sx={{ color: '#202522', fontWeight: 600 }}>
          Complaint record not found.
        </Typography>
        <Button
          onClick={handleBack}
          sx={{ mt: 2, color: '#FF8C38', fontWeight: 700, textTransform: 'none' }}
        >
          Return to Dashboard / Complaints
        </Button>
      </Box>
    );

  const timelineSteps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'PENDING', label: 'Under Review' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'PENDING':
      case 'UNDER_REVIEW':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'RESOLVED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(complaint.status);

  return (
    <Box sx={{ pb: 8, maxWidth: 960, mx: 'auto' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
        onClick={handleBack}
        sx={{ mb: 3, color: '#FF8C38', fontWeight: 700, textTransform: 'none' }}
      >
        Back
      </Button>

      {/* Complaint Overview Card */}
      <Box sx={{ border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF', p: { xs: 3, sm: 4.5 }, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#496A57', letterSpacing: '0.02em', fontSize: '1.1rem' }}>
                #{complaint.trackingNumber}
              </Typography>
              <StatusBadge status={complaint.status} />
              <Paper
                elevation={0}
                sx={{
                  px: 1.25,
                  py: 0.3,
                  borderRadius: '4px',
                  backgroundColor: '#F8F9F7',
                  border: '1px solid #E5E8E4',
                  color: '#68706B',
                  fontSize: '0.775rem',
                  fontWeight: 500,
                }}
              >
                {complaint.category}
              </Paper>
            </Box>

            <Typography variant="h2" sx={{ fontWeight: 600, color: '#202522', mb: 1.5, fontSize: '1.4rem' }}>
              {complaint.title}
            </Typography>

            <Typography variant="body1" sx={{ color: '#68706B', mb: 3, lineHeight: 1.65 }}>
              {complaint.description}
            </Typography>

            <Divider sx={{ mb: 3, borderColor: '#E5E8E4' }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ color: '#496A57', fontSize: 18, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                    Ward Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>
                    {complaint.ward}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                    {complaint.locationAddress}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CalendarTodayOutlinedIcon sx={{ color: '#496A57', fontSize: 18, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                    Submission Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>
                    {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Priority Level
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: complaint.priority === 'HIGH' ? '#B45D59' : '#202522' }}>
                  {complaint.priority}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Horizontal Status Timeline (Subtle lines & small status indicators) */}
      <Box sx={{ border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF', p: { xs: 3, sm: 4 }, mb: 4 }}>
        <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 3 }}>
          RESOLUTION PROGRESS TIMELINE
        </Typography>

        <Box sx={{ position: 'relative', px: { xs: 1, sm: 4 } }}>
          {/* Subtle horizontal connecting line */}
          <Box
            sx={{
              position: 'absolute',
              top: 13,
              left: '10%',
              right: '10%',
              height: 2,
              backgroundColor: '#E5E8E4',
              zIndex: 1,
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <Box key={step.key} sx={{ textAlign: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#496A57' : '#FFFFFF',
                      color: isCompleted ? '#FFFFFF' : '#68706B',
                      border: `2px solid ${isCurrent ? '#496A57' : isCompleted ? '#496A57' : '#E5E8E4'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                      fontSize: '0.725rem',
                      fontWeight: 600,
                    }}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent ? '#202522' : isCompleted ? '#304B3A' : '#68706B',
                      display: 'block',
                      fontSize: '0.8rem',
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* RESOLVED COMPLAINT FEEDBACK SECTION */}
      {complaint.status === 'RESOLVED' && (
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: '8px',
            border: '1px solid #E5E8E4',
            backgroundColor: '#F8F9F7',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 0.5 }}>
            Citizen Satisfaction Feedback
          </Typography>
          <Typography variant="body2" sx={{ color: '#68706B', mb: 3 }}>
            This issue has been marked as Resolved. Please let us know if you are satisfied with the municipal work executed.
          </Typography>

          {feedbackSubmitted ? (
            <Alert severity="success" sx={{ borderRadius: '6px', backgroundColor: '#E8EFE9', color: '#304B3A' }}>
              Thank you. Your feedback has been recorded.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleFeedbackSubmit}>
              <RadioGroup
                row
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(e.target.value as any)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="Satisfied"
                  control={<Radio sx={{ color: '#496A57', '&.Mui-checked': { color: '#496A57' } }} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500, color: '#202522', fontSize: '0.875rem' }}>
                      <ThumbUpOutlinedIcon fontSize="small" sx={{ color: '#527A5E' }} /> Satisfied with resolution
                    </Box>
                  }
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  value="Not Satisfied"
                  control={<Radio sx={{ color: '#B45D59', '&.Mui-checked': { color: '#B45D59' } }} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500, color: '#202522', fontSize: '0.875rem' }}>
                      <ThumbDownOutlinedIcon fontSize="small" sx={{ color: '#B45D59' }} /> Unsatisfied
                    </Box>
                  }
                />
              </RadioGroup>

              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Optional feedback details..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#496A57',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  px: 3,
                  '&:hover': { backgroundColor: '#304B3A' },
                }}
              >
                Submit Feedback
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Photos & Activity Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* Photo Evidence */}
        <Box sx={{ border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF', p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 2 }}>
            Photo Evidence
          </Typography>
          {complaint.images && complaint.images.length > 0 ? (
            <Stack spacing={2}>
              {complaint.images.map((img, i) => (
                <CardMedia
                  key={i}
                  component="img"
                  image={img}
                  alt="Site Evidence"
                  sx={{ borderRadius: '6px', maxHeight: 240, objectFit: 'cover', border: '1px solid #E5E8E4' }}
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: '#68706B' }}>
              No photo evidence attached.
            </Typography>
          )}
        </Box>

        {/* Discussion / Comments */}
        <Box sx={{ border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF', p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 2 }}>
            Communication & Work Logs
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {!complaint.comments || complaint.comments.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#68706B' }}>
                No updates posted yet.
              </Typography>
            ) : (
              complaint.comments.map((cmt) => (
                <Paper key={cmt.id} elevation={0} sx={{ p: 2, borderRadius: '6px', backgroundColor: '#F8F9F7', border: '1px solid #E5E8E4' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.85rem' }}>
                      {cmt.authorName} ({cmt.authorRole})
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#68706B' }}>
                      {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#68706B' }}>
                    {cmt.content}
                  </Typography>
                </Paper>
              ))
            )}
          </Stack>

          <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add official comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={submittingComment || !newComment.trim()}
              sx={{
                borderRadius: '8px',
                backgroundColor: '#496A57',
                color: '#FFFFFF',
                fontWeight: 500,
                minWidth: 44,
                '&:hover': { backgroundColor: '#304B3A' },
              }}
            >
              <SendOutlinedIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ComplaintDetails;
