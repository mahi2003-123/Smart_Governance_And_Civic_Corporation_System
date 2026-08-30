import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AssignWorkerModal } from '../../components/modals/AssignWorkerModal';
import { matchesWard } from '../../utils/wardUtils';

export const ManageComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignDialogComplaint, setAssignDialogComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaints();
      setComplaints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleConfirmAssign = async (workerId: string, workerName: string, priority: ComplaintPriority) => {
    if (!assignDialogComplaint || !user) return;
    try {
      const updated = await complaintService.assignWorker(
        assignDialogComplaint.id,
        workerId,
        workerName,
        user.fullName,
        priority
      );
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setAssignDialogComplaint(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectComplaint = async (cId: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.updateComplaintStatus(
        cId,
        'REJECTED' as ComplaintStatus,
        user.fullName,
        'COUNCILLOR',
        'Duplicate or out of municipal jurisdiction.'
      );
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching complaint records for triage..." />;

  const displayedComplaints = (user?.role === 'COUNCILLOR' && user?.ward)
    ? complaints.filter((c) => matchesWard(c.ward, user.ward))
    : complaints;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#202522', letterSpacing: '-0.015em' }}>
          Ward Complaint Management & Triage
        </Typography>
        <Typography variant="body2" sx={{ color: '#68706B', mt: 0.5 }}>
          Inspect resident grievances for <strong>{user?.ward || 'All Wards'}</strong>, dispatch qualified field personnel, and verify status updates.
        </Typography>
      </Box>

      <Card elevation={0} sx={{ borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#202522', py: 1.5 }}>Tracking ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#202522', py: 1.5 }}>Complaint & Ward</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#202522', py: 1.5 }}>Citizen Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#202522', py: 1.5 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#202522', py: 1.5 }}>Assigned Worker</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#202522', py: 1.5 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#202522', py: 1.5 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: '#68706B', fontWeight: 500 }}>
                      No complaints submitted for {user?.ward || 'this ward'} yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedComplaints.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8F9F7' } }}>
                    <TableCell>
                      <Chip label={row.trackingNumber} size="small" sx={{ fontWeight: 600, backgroundColor: '#E8EFE9', color: '#304B3A' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {row.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {row.category} • {row.ward}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>{row.citizenName}</Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {row.citizenPhone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.priority}
                        size="small"
                        sx={{
                          bgcolor: PRIORITY_COLORS[row.priority]?.bg || '#F8F9F7',
                          color: PRIORITY_COLORS[row.priority]?.text || '#68706B',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.assignedWorkerName ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#304B3A' }}>
                          {row.assignedWorkerName}
                        </Typography>
                      ) : (
                        <Chip label="Unassigned" size="small" sx={{ backgroundColor: '#FDF2F2', color: '#B45D59', fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: STATUS_COLORS[row.status]?.bg || '#F8F9F7',
                          color: STATUS_COLORS[row.status]?.text || '#68706B',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="View Timeline & Details">
                          <IconButton size="small" sx={{ color: '#496A57', '&:hover': { bgcolor: '#E8EFE9' } }} onClick={() => navigate(`/citizen/history/${row.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<BuildIcon />}
                          onClick={() => setAssignDialogComplaint(row)}
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#496A57',
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '0.825rem',
                            '&:hover': { backgroundColor: '#304B3A' }
                          }}
                        >
                          Triage & Assign
                        </Button>

                        {row.status !== 'REJECTED' && row.status !== 'RESOLVED' && (
                          <Tooltip title="Reject Complaint">
                            <IconButton size="small" color="error" onClick={() => handleRejectComplaint(row.id)}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Assign Field Worker Modal */}
      <AssignWorkerModal
        open={Boolean(assignDialogComplaint)}
        complaint={assignDialogComplaint}
        onClose={() => setAssignDialogComplaint(null)}
        onConfirm={handleConfirmAssign}
      />
    </Box>
  );
};
