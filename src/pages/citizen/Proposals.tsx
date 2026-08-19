import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { proposalService } from '../../services/proposalService';
import { CommunityProposal } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WardSelector } from '../../components/common/WardSelector';

export const Proposals: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [ward, setWard] = useState(user?.ward || 'Ward 1 - Central Town');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const proposalCategories = [
    'Infrastructure',
    'Park Maintenance',
    'Sanitation',
    'Traffic & Roads',
    'Street Lighting',
    'Community Health',
  ];

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await proposalService.getProposals();
      setProposals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleUpvote = async (proposalId: string) => {
    try {
      const updated = await proposalService.voteProposal(proposalId, 'UP');
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please complete all mandatory fields.');
      return;
    }

    if (!ward) {
      setError('Please select a ward from the dropdown.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const created = await proposalService.createProposal({
        title: title.trim(),
        category,
        description: description.trim(),
        ward,
        authorName: user?.fullName || 'Citizen Resident',
      });

      setProposals((prev) => [created, ...prev]);
      setOpenModal(false);
      setTitle('');
      setDescription('');
    } catch {
      setError('Failed to submit proposal. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approved', bg: '#DCFCE7', color: '#166534' };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', bg: '#FEF3C7', color: '#B45309' };
      case 'REJECTED':
        return { label: 'Rejected', bg: '#FEE2E2', color: '#991B1B' };
      case 'PROPOSED':
      default:
        return { label: 'Proposed', bg: '#EFF6FF', color: '#1D4ED8' };
    }
  };

  if (loading) return <LoadingSpinner message="Loading Ward Proposals..." />;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
            Community Proposals
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Propose civic improvement projects for your ward and upvote proposals submitted by fellow citizens.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{
            borderRadius: '20px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontWeight: 700,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': { backgroundColor: '#1D4ED8' },
          }}
        >
          Submit Proposal
        </Button>
      </Box>

      {/* Proposals Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {proposals.map((item) => {
          const hasVoted = item.userVoted === 'UP';
          const targetGoal = 150;
          const percent = Math.min(100, Math.round((item.upvotes / targetGoal) * 100));
          const statusBadge = getStatusBadgeStyle(item.status);

          return (
            <Card
              key={item.id}
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#BFDBFE',
                  boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 700, borderRadius: '8px' }}
                  />
                  <Chip
                    label={statusBadge.label}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                      borderRadius: '8px',
                    }}
                  />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  {item.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#64748B', mb: 3, lineHeight: 1.6 }}>
                  {item.description}
                </Typography>
              </Box>

              <Box>
                {/* Author & Ward Info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, color: '#475569' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationCityIcon fontSize="small" sx={{ color: '#2563EB' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {item.ward}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Proposed by: {item.authorName}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {item.upvotes} Votes
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Target: {targetGoal} ({percent}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#EFF6FF',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#2563EB', borderRadius: 4 },
                    }}
                  />
                </Box>

                {/* Upvote Support Button */}
                <Button
                  fullWidth
                  variant={hasVoted ? 'outlined' : 'contained'}
                  startIcon={hasVoted ? <CheckCircleIcon sx={{ color: '#16A34A' }} /> : <ThumbUpIcon />}
                  onClick={() => handleUpvote(item.id)}
                  sx={{
                    borderRadius: '16px',
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: 'none',
                    backgroundColor: hasVoted ? '#F0FDF4' : '#2563EB',
                    borderColor: hasVoted ? '#DCFCE7' : 'transparent',
                    color: hasVoted ? '#16A34A' : '#FFFFFF',
                    boxShadow: hasVoted ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.25)',
                    '&:hover': {
                      backgroundColor: hasVoted ? '#F0FDF4' : '#1D4ED8',
                    },
                  }}
                >
                  {hasVoted ? 'Upvoted' : 'Upvote Proposal'}
                </Button>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* Modal to Submit Proposal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pt: 3 }}>
          Submit Community Proposal
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleCreateProposal} sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Proposal Title"
                placeholder="e.g. Solar Streetlights Installation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={textFieldStyles}
              />

              <TextField
                select
                fullWidth
                label="Proposal Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                sx={textFieldStyles}
              >
                {proposalCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              {/* MANUAL WARD SELECTION */}
              <WardSelector
                value={ward}
                onChange={(val) => setWard(val)}
                label="Ward Jurisdiction"
                required
                helperText="Select municipal ward for this proposal"
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description & Community Impact"
                placeholder="Detail the project goals, benefit to local residents, and estimated scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                sx={textFieldStyles}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none', borderRadius: '20px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProposal}
            disabled={submitting}
            sx={{
              borderRadius: '16px',
              backgroundColor: '#2563EB',
              px: 3,
              py: 1,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1D4ED8' },
            }}
          >
            Submit Proposal
          </Button>
        </DialogActions>
      </Dialog>
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

export default Proposals;
