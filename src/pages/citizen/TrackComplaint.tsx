import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const TrackComplaint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialRef = searchParams.get('ref') || '';

  const [refNumber, setRefNumber] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refNumber.trim()) {
      setError('Please enter a valid complaint reference number (e.g., SGCS-2026-8941).');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const data = await complaintService.getComplaintById(refNumber.trim());
      if (data) {
        setComplaint(data);
      } else {
        setComplaint(null);
        setError(`No complaint found with reference number "${refNumber.trim()}".`);
      }
    } catch {
      setError('Error retrieving complaint details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      handleTrack();
    }
  }, [initialRef]);

  const timelineSteps = ['Submitted', 'Pending', 'In Progress', 'Resolved'];

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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
          Track Your Complaint
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Enter your official reference number (e.g. SGCS-2026-8941) to check real-time resolution status.
        </Typography>
      </Box>

      {/* Track Card Input Form */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box component="form" onSubmit={handleTrack}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              id="track-ref-input"
              label="Complaint Reference Number"
              placeholder="e.g. SGCS-2026-8941"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFC',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: '16px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': { backgroundColor: '#1D4ED8' },
              }}
            >
              {loading ? 'Searching...' : 'Track Complaint'}
            </Button>
          </Stack>
        </Box>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 4, borderRadius: '16px' }}>
          {error}
        </Alert>
      )}

      {/* Result Display */}
      {searched && complaint && (
        <Stack spacing={3}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  {complaint.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Reference ID: <strong style={{ color: '#2563EB' }}>{complaint.trackingNumber}</strong>
                </Typography>
              </Box>

              <StatusBadge status={complaint.status} size="medium" />
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Ward
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {complaint.ward}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Category
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {complaint.category}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Submitted Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                  Location: {complaint.locationAddress}
                </Typography>
              </Box>
            </Paper>

            {/* Visual Step Timeline */}
            <Box sx={{ pt: 1, pb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                Resolution Progress Timeline
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {timelineSteps.map((label, idx) => {
                  const currentIdx = getStepIndex(complaint.status);
                  const isDone = idx <= currentIdx;
                  return (
                    <Box key={label} sx={{ textAlign: 'center', flex: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#2563EB' : '#F1F5F9',
                          color: isDone ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: `2px solid ${isDone ? '#2563EB' : '#E2E8F0'}`,
                        }}
                      >
                        {isDone ? <CheckCircleOutlinedIcon fontSize="small" /> : idx + 1}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isDone ? 700 : 500,
                          color: isDone ? '#0F172A' : '#94A3B8',
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/citizen/complaints/${complaint.id}`)}
                sx={{
                  borderRadius: '14px',
                  borderColor: '#2563EB',
                  color: '#2563EB',
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                View Full Details & Updates
              </Button>
            </Box>
          </Card>
        </Stack>
      )}
    </Box>
  );
};

export default TrackComplaint;
