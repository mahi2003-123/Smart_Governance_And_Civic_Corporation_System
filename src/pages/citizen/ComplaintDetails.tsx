import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
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

  if (loading) return <LoadingSpinner message="Loading complaint details..." />;

  if (!complaint)
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 700 }}>
          Complaint record not found.
        </Typography>
        <Button
          onClick={() => navigate('/citizen/complaints')}
          sx={{ mt: 2, color: '#2563EB', fontWeight: 700, textTransform: 'none' }}
        >
          Back to My Complaints
        </Button>
      </Box>
    );

  const timelineSteps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'SUBMITTED':
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
    <Box sx={{ pb: 6 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/citizen/complaints')}
        sx={{ mb: 3, color: '#64748B', fontWeight: 600, textTransform: 'none', borderRadius: '20px' }}
      >
        Back to My Complaints
      </Button>

      {/* Complaint Overview Card */}
      <Card elevation={0} sx={{ p: { xs: 3, md: 4.5 }, mb: 4, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563EB', letterSpacing: '0.02em' }}>
                {complaint.trackingNumber}
              </Typography>
              <StatusBadge status={complaint.status} />
              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 0.4,
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {complaint.category}
              </Paper>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, letterSpacing: '-0.02em' }}>
              {complaint.title}
            </Typography>

            <Typography variant="body1" sx={{ color: '#475569', mb: 3, lineHeight: 1.7 }}>
              {complaint.description}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, pt: 2, borderTop: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Ward & Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {complaint.ward} - {complaint.locationAddress}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayOutlinedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Submitted Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                  Priority Level
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: complaint.priority === 'HIGH' ? '#DC2626' : '#0F172A' }}>
                  {complaint.priority}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Visual Timeline Card */}
      <Card elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 3 }}>
          Status Timeline
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <Box key={step.key} sx={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#2563EB' : '#F1F5F9',
                    color: isCompleted ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: `3px solid ${isCurrent ? '#93C5FD' : isCompleted ? '#2563EB' : '#E2E8F0'}`,
                    boxShadow: isCompleted ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                  }}
                >
                  {isCompleted ? <CheckCircleOutlinedIcon fontSize="small" /> : idx + 1}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                    color: isCurrent ? '#2563EB' : isCompleted ? '#0F172A' : '#94A3B8',
                    fontSize: '0.85rem',
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* RESOLVED COMPLAINT FEEDBACK SECTION */}
      {complaint.status === 'RESOLVED' && (
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: '24px',
            border: '2px solid #10B981',
            backgroundColor: '#F0FDF4',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#065F46', mb: 1 }}>
            How was your experience?
          </Typography>
          <Typography variant="body2" sx={{ color: '#047857', mb: 3 }}>
            This complaint has been marked as Resolved. Please let us know if you are satisfied with the ward's resolution.
          </Typography>

          {feedbackSubmitted ? (
            <Alert
              severity="success"
              sx={{
                borderRadius: '16px',
                fontWeight: 700,
                backgroundColor: '#DCFCE7',
                color: '#166534',
                fontSize: '0.95rem',
              }}
            >
              {feedbackRating === 'Satisfied'
                ? 'Thank you for your feedback.'
                : 'Your feedback has been recorded.'}
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleFeedbackSubmit}>
              <RadioGroup
                row
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(e.target.value as any)}
                sx={{ mb: 2.5 }}
              >
                <FormControlLabel
                  value="Satisfied"
                  control={<Radio sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: '#065F46' }}>
                      <ThumbUpAltIcon fontSize="small" /> Satisfied
                    </Box>
                  }
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  value="Not Satisfied"
                  control={<Radio sx={{ color: '#DC2626', '&.Mui-checked': { color: '#DC2626' } }} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: '#991B1B' }}>
                      <ThumbDownAltIcon fontSize="small" /> Not Satisfied
                    </Box>
                  }
                />
              </RadioGroup>

              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Optional feedback comment..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: '16px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#047857' },
                }}
              >
                Submit Feedback
              </Button>
            </Box>
          )}
        </Card>
      )}

      {/* Photos & Activity Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Attachment Photos */}
        <Card elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
            Complaint Photo
          </Typography>
          {complaint.images && complaint.images.length > 0 ? (
            <Stack spacing={2}>
              {complaint.images.map((img, i) => (
                <CardMedia
                  key={i}
                  component="img"
                  image={img}
                  alt="Complaint Photo Evidence"
                  sx={{ borderRadius: '16px', maxHeight: 260, objectFit: 'cover' }}
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: '#64748B', fontStyle: 'italic' }}>
              No complaint image uploaded.
            </Typography>
          )}
        </Card>

        {/* Discussion / Comments */}
        <Card elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
            Activity & Updates
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {complaint.comments.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                No updates posted yet.
              </Typography>
            ) : (
              complaint.comments.map((cmt) => (
                <Paper key={cmt.id} elevation={0} sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {cmt.authorName} ({cmt.authorRole})
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#475569' }}>
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
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={textFieldStyles}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={submittingComment || !newComment.trim()}
              sx={{
                borderRadius: '14px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                '&:hover': { backgroundColor: '#1D4ED8' },
              }}
            >
              Send
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9rem',
    '& fieldset': {
      borderColor: '#E2E8F0',
    },
    '&:hover fieldset': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
      borderWidth: '1.5px',
    },
  },
};

export default ComplaintDetails;
