import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  MenuItem,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { proposalService } from '../../services/proposalService';
import { CommunityProposal } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WardSelector } from '../../components/common/WardSelector';
import { ProposalItemCard } from '../../components/proposals/ProposalItemCard';

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

  const userIdentifier = user?.email || user?.id || user?.fullName || 'anonymous';

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
      const data = await proposalService.getProposals(undefined, userIdentifier);
      setProposals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [userIdentifier]);

  const handleVote = async (proposalId: string, voteType: 'UP' | 'DOWN') => {
    try {
      const updated = await proposalService.voteProposal(proposalId, voteType, userIdentifier);
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (proposalId: string, commentText: string) => {
    try {
      const updated = await proposalService.addComment(
        proposalId,
        {
          content: commentText,
          authorName: user?.fullName || 'Citizen Resident',
          authorRole: user?.role || 'CITIZEN',
        },
        userIdentifier
      );
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
      const created = await proposalService.createProposal(
        {
          title: title.trim(),
          category,
          description: description.trim(),
          ward,
          authorName: user?.fullName || 'Citizen Resident',
          authorRole: user?.role || 'CITIZEN',
        },
        userIdentifier
      );

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
            Propose local civic improvement projects for your ward, vote, and comment on initiatives proposed by fellow citizens and councillors.
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
      <Stack spacing={3}>
        {proposals.length === 0 ? (
          <Box sx={{ p: 4, color: '#68706B', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E8E4' }}>
            <Typography variant="body1">No community proposals recorded yet. Be the first to submit a proposal!</Typography>
          </Box>
        ) : (
          proposals.map((item) => (
            <ProposalItemCard
              key={item.id}
              proposal={item}
              onVote={handleVote}
              onComment={handleComment}
            />
          ))
        )}
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
