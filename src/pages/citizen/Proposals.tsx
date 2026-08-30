import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  MenuItem,
  Divider,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import { proposalService } from '../../services/proposalService';
import { CommunityProposal } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WardSelector } from '../../components/common/WardSelector';
import { StatusBadge } from '../../components/common/StatusBadge';

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

  if (loading) return <LoadingSpinner message="Loading Community Proposals..." />;

  return (
    <Box sx={{ pb: 8, maxWidth: 960, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1, letterSpacing: '-0.015em' }}>
            Community Proposals
          </Typography>
          <Typography variant="body1" sx={{ color: '#68706B' }}>
            Propose local civic improvement projects for your ward and support initiatives submitted by fellow citizens.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={() => setOpenModal(true)}
          sx={{
            py: 1,
            px: 2.5,
            borderRadius: '8px',
            backgroundColor: '#496A57',
            color: '#FFFFFF',
            fontWeight: 500,
            '&:hover': { backgroundColor: '#304B3A' },
          }}
        >
          Submit Proposal
        </Button>
      </Box>

      {/* Proposals List */}
      <Stack spacing={2.5}>
        {proposals.map((item) => {
          const hasVoted = item.userVoted === 'UP';

          return (
            <Box
              key={item.id}
              sx={{
                p: { xs: 3, sm: 3.5 },
                borderRadius: '8px',
                border: '1px solid #E5E8E4',
                backgroundColor: '#FFFFFF',
                transition: 'border-color 0.15s ease',
                '&:hover': { borderColor: '#496A57' },
              }}
            >
              {/* Proposal Header Meta */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={item.category} size="small" sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', height: 22 }} />
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    Proposed by: {item.authorName}
                  </Typography>
                </Box>
                <StatusBadge status={item.status} />
              </Box>

              {/* Title */}
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', mb: 1, fontSize: '1.2rem' }}>
                {item.title}
              </Typography>

              {/* Ward Location */}
              <Typography variant="caption" sx={{ color: '#68706B', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                <LocationCityOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> Jurisdiction: {item.ward}
              </Typography>

              {/* Description */}
              <Typography variant="body2" sx={{ color: '#68706B', mb: 2.5, lineHeight: 1.6 }}>
                {item.description}
              </Typography>

              <Divider sx={{ mb: 2, borderColor: '#E5E8E4' }} />

              {/* Subtle Support Interaction */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={() => handleUpvote(item.id)}
                  startIcon={
                    hasVoted ? (
                      <FavoriteIcon sx={{ color: '#B45D59', fontSize: 18 }} />
                    ) : (
                      <FavoriteBorderOutlinedIcon sx={{ color: '#68706B', fontSize: 18 }} />
                    )
                  }
                  sx={{
                    color: hasVoted ? '#304B3A' : '#202522',
                    backgroundColor: hasVoted ? '#E8EFE9' : '#FFFFFF',
                    border: '1px solid #E5E8E4',
                    borderRadius: '6px',
                    px: 2,
                    py: 0.6,
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.825rem',
                    '&:hover': {
                      backgroundColor: '#F3F5F2',
                      borderColor: '#496A57',
                    },
                  }}
                >
                  {hasVoted ? `Supported (${item.upvotes})` : `♡ ${item.upvotes} citizens support this proposal`}
                </Button>

                <Typography variant="caption" sx={{ color: '#68706B' }}>
                  Community Initiative
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Modal to Submit Proposal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '8px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#202522', pt: 3 }}>
          Submit Community Proposal
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '6px' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleCreateProposal} sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Proposal Title"
                placeholder="e.g. Solar Streetlights Installation on Main Road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <TextField
                select
                fullWidth
                label="Proposal Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {proposalCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

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
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{ color: '#68706B', fontWeight: 500, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProposal}
            disabled={submitting}
            sx={{
              borderRadius: '8px',
              backgroundColor: '#496A57',
              px: 3,
              py: 1,
              fontWeight: 500,
              '&:hover': { backgroundColor: '#304B3A' },
            }}
          >
            Submit Proposal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Proposals;
