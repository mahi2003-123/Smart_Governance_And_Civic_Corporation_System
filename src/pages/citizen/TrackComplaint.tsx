import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
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

  const timelineSteps = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1, letterSpacing: '-0.015em' }}>
          Track Complaint Status
        </Typography>
        <Typography variant="body1" sx={{ color: '#68706B' }}>
          Enter your official reference number (e.g. SGCS-2026-8941) to view live resolution progress.
        </Typography>
      </Box>

      {/* Input Form */}
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: '8px',
          border: '1px solid #E5E8E4',
          backgroundColor: '#FFFFFF',
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
                      <SearchOutlinedIcon sx={{ color: '#68706B', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: '8px',
                backgroundColor: '#496A57',
                color: '#FFFFFF',
                fontWeight: 500,
                px: 4,
                py: 1.2,
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#304B3A' },
              }}
            >
              {loading ? 'Searching...' : 'Track Status'}
            </Button>
          </Stack>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 4, borderRadius: '6px' }}>
          {error}
        </Alert>
      )}

      {/* Result Display */}
      {searched && complaint && (
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '8px',
            border: '1px solid #E5E8E4',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', mb: 0.5, fontSize: '1.25rem' }}>
                {complaint.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B' }}>
                Reference Number: <strong style={{ color: '#496A57' }}>#{complaint.trackingNumber}</strong>
              </Typography>
            </Box>

            <StatusBadge status={complaint.status} />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '6px',
              backgroundColor: '#F8F9F7',
              border: '1px solid #E5E8E4',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Ward Jurisdiction
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>
                  {complaint.ward}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Category
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>
                  {complaint.category}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Submission Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>
                  {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E8E4', display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnOutlinedIcon sx={{ color: '#496A57', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#68706B' }}>
                Location: {complaint.locationAddress}
              </Typography>
            </Box>
          </Paper>

          {/* Timeline Progress */}
          <Box sx={{ pt: 1, pb: 2 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 2 }}>
              RESOLUTION TIMELINE
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {timelineSteps.map((label, idx) => {
                const currentIdx = getStepIndex(complaint.status);
                const isDone = idx <= currentIdx;
                return (
                  <Box key={label} sx={{ textAlign: 'center', flex: 1 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#496A57' : '#FFFFFF',
                        color: isDone ? '#FFFFFF' : '#68706B',
                        border: `2px solid ${isDone ? '#496A57' : '#E5E8E4'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {isDone ? '✓' : idx + 1}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isDone ? 600 : 400,
                        color: isDone ? '#202522' : '#68706B',
                        fontSize: '0.775rem',
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
                borderRadius: '8px',
                borderColor: '#E5E8E4',
                color: '#202522',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { borderColor: '#496A57', backgroundColor: '#F3F5F2' },
              }}
            >
              View Complete Record & Updates
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TrackComplaint;
