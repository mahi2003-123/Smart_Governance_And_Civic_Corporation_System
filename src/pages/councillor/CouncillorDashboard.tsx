import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useNavigate } from 'react-router-dom';
import { matchesWard } from '../../utils/wardUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintPriority } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WelcomeCard } from '../../components/cards/WelcomeCard';
import { StatCard } from '../../components/cards/StatCard';
import { AssignWorkerModal } from '../../components/modals/AssignWorkerModal';
import { StatusBadge } from '../../components/common/StatusBadge';

import VerifiedIcon from '@mui/icons-material/Verified';
import { VerifyProofModal } from '../../components/modals/VerifyProofModal';

export const CouncillorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);
  const [verifyModalComplaint, setVerifyModalComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  const handleConfirmAssign = async (workerId: string, workerName: string, priority: ComplaintPriority) => {
    if (!assignModalComplaint || !user) return;
    try {
      const updated = await complaintService.assignWorker(
        assignModalComplaint.id,
        workerId,
        workerName,
        user.fullName,
        priority
      );
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setAssignModalComplaint(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveProof = async (complaintId: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.approveTask(complaintId, user.fullName);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectProof = async (complaintId: string, feedback: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.rejectTaskProof(complaintId, user.fullName, feedback);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Councillor Console..." />;

  const wardComplaints = (user?.role === 'COUNCILLOR' && user?.ward)
    ? complaints.filter((c) => matchesWard(c.ward, user.ward))
    : complaints;

  const unassignedList = wardComplaints.filter((c) => (c.status === 'PENDING' || (c.status as string) === 'SUBMITTED') && !c.assignedWorkerId);
  const assignedOrInProgressList = wardComplaints.filter((c) => (c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || Boolean(c.assignedWorkerId)) && c.status !== 'RESOLVED' && c.status !== 'PENDING_APPROVAL');
  const pendingApprovalList = wardComplaints.filter((c) => c.status === 'PENDING_APPROVAL');
  const resolvedList = wardComplaints.filter((c) => c.status === 'RESOLVED');

  const actionQueueList = [...pendingApprovalList, ...unassignedList, ...assignedOrInProgressList];

  const statusPieData = [
    { name: 'Unassigned', value: unassignedList.length, color: '#B58A45' },
    { name: 'Assigned / Active', value: assignedOrInProgressList.length, color: '#496A57' },
    { name: 'Resolved', value: resolvedList.length, color: '#68706B' },
  ];

  const wardPerformanceData = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'].map((wardName) => {
    const matching = complaints.filter(
      (c) => c.ward && c.ward.toLowerCase().includes(wardName.toLowerCase())
    );
    const active = matching.filter((c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
    const resolved = matching.filter((c) => c.status === 'RESOLVED').length;
    return { ward: wardName, active, resolved };
  });

  return (
    <Box sx={{ pb: 8, maxWidth: 1120, mx: 'auto' }}>
      {/* Header Banner */}
      <WelcomeCard
        title={user?.fullName || 'Councillor'}
        subtitle={`Ward Councillor • ${user?.ward || 'Ward 1 - Central Town'} Operations`}
        actionText="Publish Ward Notice"
        actionIcon={<CampaignOutlinedIcon sx={{ fontSize: 18 }} />}
        onAction={() => navigate('/councillor/announcements')}
      />

      {/* Ward Stat Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Pending Ward Queue"
          value={unassignedList.length}
          subtitle="Awaiting triage or dispatch"
          icon={<HourglassEmptyOutlinedIcon />}
          iconBgColor="#FBF7F0"
          iconColor="#B58A45"
          borderLeftColor="#B58A45"
        />

        <StatCard
          title="Work In Progress"
          value={assignedOrInProgressList.length}
          subtitle="Field technicians active"
          icon={<TrackChangesOutlinedIcon />}
          iconBgColor="#E8EFE9"
          iconColor="#304B3A"
          borderLeftColor="#496A57"
        />

        <StatCard
          title="Total Resolved (MTD)"
          value={resolvedList.length}
          subtitle="Avg resolution: 1.8 days"
          icon={<CheckCircleOutlinedIcon />}
          iconBgColor="#F3F5F2"
          iconColor="#68706B"
          borderLeftColor="#68706B"
        />

        <StatCard
          title="Community Proposals"
          value={3}
          subtitle="Awaiting councillor review"
          icon={<ForumOutlinedIcon />}
          iconBgColor="#F8F9F7"
          iconColor="#202522"
          borderLeftColor="#202522"
        />
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<AssignmentOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/councillor/complaints')}
          sx={{
            py: 1.2,
            borderRadius: '8px',
            backgroundColor: '#496A57',
            color: '#FFFFFF',
            fontWeight: 500,
            '&:hover': { backgroundColor: '#304B3A' },
          }}
        >
          Manage Complaints
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<RateReviewOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/councillor/proposals')}
          sx={{
            py: 1.2,
            borderRadius: '8px',
            borderColor: '#E5E8E4',
            color: '#202522',
            backgroundColor: '#FFFFFF',
            fontWeight: 500,
            '&:hover': { borderColor: '#496A57', backgroundColor: '#F3F5F2' },
          }}
        >
          Review Proposals
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<CampaignOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/councillor/announcements')}
          sx={{
            py: 1.2,
            borderRadius: '8px',
            borderColor: '#E5E8E4',
            color: '#202522',
            backgroundColor: '#FFFFFF',
            fontWeight: 500,
            '&:hover': { borderColor: '#496A57', backgroundColor: '#F3F5F2' },
          }}
        >
          Ward Announcements
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<AssessmentOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/councillor/reports')}
          sx={{
            py: 1.2,
            borderRadius: '8px',
            borderColor: '#E5E8E4',
            color: '#202522',
            backgroundColor: '#FFFFFF',
            fontWeight: 500,
            '&:hover': { borderColor: '#496A57', backgroundColor: '#F3F5F2' },
          }}
        >
          Ward Reports
        </Button>
      </Box>

      {/* Analytics Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ p: 3, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 2 }}>
            Ward Grievance Volume Comparison
          </Typography>
          <Box sx={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardPerformanceData}>
                <XAxis dataKey="ward" stroke="#68706B" fontSize={12} />
                <YAxis stroke="#68706B" fontSize={12} />
                <RechartsTooltip />
                <Bar dataKey="active" fill="#496A57" name="Active" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#C2C9C3" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box sx={{ p: 3, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', width: '100%', textAlign: 'left', mb: 2 }}>
            Status Distribution
          </Typography>
          <Box sx={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>

      {/* Pending Queue Table */}
      <Box sx={{ p: 3, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522' }}>
            Pending Grievance Action Queue
          </Typography>
          <Button size="small" onClick={() => navigate('/councillor/complaints')} sx={{ color: '#496A57', fontWeight: 500 }}>
            View All Complaints
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking ID</TableCell>
                <TableCell>Citizen & Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actionQueueList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#68706B' }}>
                    No pending complaints or worker verification requests in your ward queue.
                  </TableCell>
                </TableRow>
              ) : (
                actionQueueList.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#496A57' }}>
                      #{row.trackingNumber}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#202522' }}>
                        {row.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                        <PersonOutlinedIcon sx={{ color: '#68706B', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: '#68706B' }}>
                          {row.citizenName} • {row.ward}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: row.priority === 'HIGH' ? '#B45D59' : '#68706B', fontWeight: 500 }}>
                      {row.priority}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} assignedWorkerName={row.assignedWorkerName} />
                    </TableCell>
                    <TableCell align="center">
                      {row.status === 'PENDING_APPROVAL' ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<VerifiedIcon />}
                          onClick={() => setVerifyModalComplaint(row)}
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#D97706',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            '&:hover': { backgroundColor: '#B45309' },
                          }}
                        >
                          Verify Proof
                        </Button>
                      ) : row.assignedWorkerName ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setAssignModalComplaint(row)}
                          sx={{
                            borderRadius: '6px',
                            borderColor: '#2563EB',
                            color: '#1E40AF',
                            backgroundColor: '#EBF5FF',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            '&:hover': { backgroundColor: '#DBEAFE' },
                          }}
                        >
                          Reassign ({row.assignedWorkerName.split(' ')[0]})
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => setAssignModalComplaint(row)}
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#496A57',
                            color: '#FFFFFF',
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            '&:hover': { backgroundColor: '#304B3A' },
                          }}
                        >
                          Assign Worker
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Assign Worker Modal */}
      <AssignWorkerModal
        open={Boolean(assignModalComplaint)}
        complaint={assignModalComplaint}
        onClose={() => setAssignModalComplaint(null)}
        onConfirm={handleConfirmAssign}
      />

      {/* Councillor Verify Proof Modal */}
      <VerifyProofModal
        open={Boolean(verifyModalComplaint)}
        complaint={verifyModalComplaint}
        onClose={() => setVerifyModalComplaint(null)}
        onApprove={handleApproveProof}
        onRejectProof={handleRejectProof}
      />
    </Box>
  );
};

export default CouncillorDashboard;
