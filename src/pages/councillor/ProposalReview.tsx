import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { proposalService } from '../../services/proposalService';
import { CommunityProposal, ProposalStatus } from '../../types';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProposalItemCard } from '../../components/proposals/ProposalItemCard';
import { useAuth } from '../../hooks/useAuth';

export const ProposalReview: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [activeReviewItem, setActiveReviewItem] = useState<{ item: CommunityProposal; action: ProposalStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userIdentifier = user?.email || user?.id || user?.fullName || 'anonymous';

  const fetchProposals = async () => {
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
    fetchProposals();
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
          authorName: user?.fullName || 'Ward Councillor',
          authorRole: 'COUNCILLOR',
        },
        userIdentifier
      );
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDecision = async () => {
    if (!activeReviewItem) return;
    setSubmitting(true);
    try {
      const updated = await proposalService.updateProposalStatus(
        activeReviewItem.item.id,
        activeReviewItem.action,
        notes,
        userIdentifier
      );
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setActiveReviewItem(null);
      setNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Community Proposals for Board Review..." />;

  return (
    <Box sx={{ pb: 6, maxWidth: 980, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
          Community Proposal Board Review
        </Typography>
        <Typography variant="body1" sx={{ color: '#68706B' }}>
          Review citizen proposals across wards, express vote support, participate in discussions, and issue councillor decisions.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {proposals.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: '#68706B', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E8E4' }}>
            <Typography variant="body1">No community proposals submitted for review.</Typography>
          </Box>
        ) : (
          proposals.map((item) => {
            const isEvaluated = item.status === 'APPROVED' || item.status === 'REJECTED';

            const councillorActionControls = isEvaluated ? (
              <Alert
                severity={item.status === 'APPROVED' ? 'success' : 'error'}
                sx={{ borderRadius: '6px', py: 0, px: 1.5, fontSize: '0.8rem' }}
              >
                Reviewed: {item.status}
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setActiveReviewItem({ item, action: 'REJECTED' })}
                  sx={{ borderRadius: '6px', fontSize: '0.8rem', textTransform: 'none' }}
                >
                  Reject
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setActiveReviewItem({ item, action: 'APPROVED' })}
                  sx={{ borderRadius: '6px', fontSize: '0.8rem', textTransform: 'none', backgroundColor: '#496A57', '&:hover': { backgroundColor: '#304B3A' } }}
                >
                  Approve
                </Button>
              </Box>
            );

            return (
              <ProposalItemCard
                key={item.id}
                proposal={item}
                onVote={handleVote}
                onComment={handleComment}
                extraActions={councillorActionControls}
              />
            );
          })
        )}
      </Stack>

      {/* Review Dialog */}
      <Dialog
        open={Boolean(activeReviewItem)}
        onClose={() => setActiveReviewItem(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '8px', p: 1 } } }}
      >
        {activeReviewItem && (
          <>
            <DialogTitle sx={{ fontWeight: 600 }}>
              {activeReviewItem.action === 'APPROVED' ? 'Approve Community Proposal' : 'Reject Proposal'}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                {activeReviewItem.item.title}
              </Typography>
              <CustomTextField
                label="Councillor Official Notes & Budget Remarks"
                placeholder="Enter remarks for the civic public ledger..."
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setActiveReviewItem(null)} sx={{ color: '#68706B', textTransform: 'none' }}>
                Cancel
              </Button>
              <CustomButton
                color={activeReviewItem.action === 'APPROVED' ? 'success' : 'error'}
                loading={submitting}
                onClick={handleConfirmDecision}
              >
                Confirm {activeReviewItem.action}
              </CustomButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProposalReview;
