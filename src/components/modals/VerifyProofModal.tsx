import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  TextField,
  Chip,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import PersonIcon from '@mui/icons-material/Person';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Complaint } from '../../types';

interface VerifyProofModalProps {
  open: boolean;
  complaint: Complaint | null;
  onClose: () => void;
  onApprove: (complaintId: string) => Promise<void>;
  onRejectProof: (complaintId: string, feedback: string) => Promise<void>;
}

export const VerifyProofModal: React.FC<VerifyProofModalProps> = ({
  open,
  complaint,
  onClose,
  onApprove,
  onRejectProof,
}) => {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);

  if (!complaint) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    setActionType('APPROVE');
    try {
      await onApprove(complaint.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback explaining why rework is requested.');
      return;
    }
    setSubmitting(true);
    setActionType('REJECT');
    try {
      await onRejectProof(complaint.id, feedback);
      setFeedback('');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
      setActionType(null);
    }
  };

  const resolvedPhoto = complaint.afterImage || complaint.completionImage;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: '#202522', fontSize: '1.25rem', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F4D3A' }}>
            Verify Worker Completion Proof: {complaint.trackingNumber}
          </Typography>
          <Chip label="PENDING COUNCILLOR REVIEW" color="warning" size="small" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 0.5 }}>
          {complaint.title}
        </Typography>
        <Typography variant="caption" sx={{ color: '#68706B', display: 'block', mb: 2 }}>
          {complaint.category} • {complaint.ward} • Location: {complaint.locationAddress}
        </Typography>

        <Paper sx={{ p: 2, bgcolor: '#F8F9F7', borderRadius: '8px', border: '1px solid #E5E8E4', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon sx={{ color: '#496A57', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522' }}>
              Assigned Worker: {complaint.assignedWorkerName || 'Local Field Technician'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#444', fontStyle: 'italic', pl: 3.5 }}>
            "{complaint.workerNotes || 'Worker reported resolution complete and uploaded site evidence.'}"
          </Typography>
        </Paper>

        {/* Evidence Side-by-Side Comparison */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#202522', mb: 1.5 }}>
          Inspection Evidence (Before & After Photos)
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {/* Before Photo */}
          <Box sx={{ border: '1px solid #E5E8E4', borderRadius: '8px', overflow: 'hidden', bgcolor: '#FAFAFA' }}>
            <Box sx={{ p: 1, bgcolor: '#F3F4F6', borderBottom: '1px solid #E5E8E4' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>
                BEFORE PHOTO (Initial Condition)
              </Typography>
            </Box>
            <Box sx={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
              {complaint.beforeImage ? (
                <img
                  src={complaint.beforeImage}
                  alt="Before Repair"
                  style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: '6px' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', color: '#9CA3AF', py: 4 }}>
                  <ImageOutlinedIcon sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="caption" sx={{ display: 'block' }}>No Before Photo Uploaded</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* After Photo (Mandatory) */}
          <Box sx={{ border: '2px solid #16A34A', borderRadius: '8px', overflow: 'hidden', bgcolor: '#F0FDF4' }}>
            <Box sx={{ p: 1, bgcolor: '#DCFCE7', borderBottom: '1px solid #BBF7D0' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                RESOLVED / AFTER PHOTO (Submitted Proof *)
              </Typography>
            </Box>
            <Box sx={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
              {resolvedPhoto ? (
                <img
                  src={resolvedPhoto}
                  alt="After Repair"
                  style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: '6px' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', color: '#DC2626', py: 4 }}>
                  <ImageOutlinedIcon sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>No Resolved Photo Attached</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
            Councillor Feedback / Rework Instructions (Optional for approval, required for rework)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Type notes or specific feedback for field worker..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            size="small"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: '#68706B', fontWeight: 600 }}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ReplayIcon />}
            onClick={handleReject}
            disabled={submitting}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            {submitting && actionType === 'REJECT' ? 'Requesting Rework...' : 'Request Rework'}
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handleApprove}
            disabled={submitting}
            sx={{
              bgcolor: '#16A34A',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#15803D' }
            }}
          >
            {submitting && actionType === 'APPROVE' ? 'Approving...' : 'Approve & Mark Resolved'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
