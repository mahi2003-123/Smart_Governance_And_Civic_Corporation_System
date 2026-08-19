import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { proposalService } from '../../services/proposalService';
import { CommunityProposal, ProposalStatus } from '../../types';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ProposalReview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [activeReviewItem, setActiveReviewItem] = useState<{ item: CommunityProposal; action: ProposalStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProposals = async () => {
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
    fetchProposals();
  }, []);

  const handleConfirmDecision = async () => {
    if (!activeReviewItem) return;
    setSubmitting(true);
    try {
      const updated = await proposalService.updateProposalStatus(
        activeReviewItem.item.id,
        activeReviewItem.action,
        notes
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
    <Box>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800}>
          Community Proposal Board Review
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review upvoted citizen civic proposals and allocate municipal project budgets.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {proposals.map((item) => (
          <Grid item xs={12} key={item.id}>
            <Card sx={{ p: 3, borderRadius: 4 }}>
              <CardContent sx={{ p: '0 !important' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                      <Chip label={item.ward} size="small" sx={{ bgcolor: '#E8DDD3', color: '#4F3523', fontWeight: 700 }} />
                      <Chip
                        label={item.status}
                        size="small"
                        color={
                          item.status === 'APPROVED'
                            ? 'success'
                            : item.status === 'REJECTED'
                            ? 'error'
                            : 'warning'
                        }
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip icon={<ThumbUpIcon fontSize="small" />} label={`${item.upvotes} Citizens Supported`} color="primary" variant="outlined" size="small" />
                      <Typography variant="caption" color="text.secondary">
                        Author: {item.authorName}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Decision Controls */}
                  <Grid item xs={12} md={4}>
                    {item.status === 'APPROVED' || item.status === 'REJECTED' ? (
                      <Alert severity={item.status === 'APPROVED' ? 'success' : 'error'} sx={{ borderRadius: 2 }}>
                        Status: {item.status}. {item.councillorNotes && `Remarks: ${item.councillorNotes}`}
                      </Alert>
                    ) : (
                      <Box display="flex" gap={1.5} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => setActiveReviewItem({ item, action: 'REJECTED' })}
                          sx={{ borderRadius: 28 }}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => setActiveReviewItem({ item, action: 'APPROVED' })}
                          sx={{ borderRadius: 28 }}
                        >
                          Approve
                        </Button>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Review Dialog */}
      <Dialog open={Boolean(activeReviewItem)} onClose={() => setActiveReviewItem(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
        {activeReviewItem && (
          <>
            <DialogTitle fontWeight={800}>
              {activeReviewItem.action === 'APPROVED' ? 'Approve Community Proposal' : 'Reject Proposal'}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" color="primary" mb={2}>
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
              <Button onClick={() => setActiveReviewItem(null)} sx={{ borderRadius: 28 }}>
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
