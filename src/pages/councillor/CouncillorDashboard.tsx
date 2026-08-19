import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ForumIcon from '@mui/icons-material/Forum';
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
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HeaderBreadcrumb } from '../../components/layout/HeaderBreadcrumb';
import { WelcomeCard } from '../../components/cards/WelcomeCard';
import { StatCard } from '../../components/cards/StatCard';
import { AssignWorkerModal } from '../../components/modals/AssignWorkerModal';

export const CouncillorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);

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
        user.fullName
      );
      const withPriority: Complaint = { ...updated, priority };
      setComplaints((prev) => prev.map((c) => (c.id === withPriority.id ? withPriority : c)));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Councillor Dashboard..." />;

  // Filter complaints dynamically for the logged-in Councillor's specific ward jurisdiction
  const wardComplaints = (user?.role === 'COUNCILLOR' && user?.ward)
    ? complaints.filter((c) => matchesWard(c.ward, user.ward))
    : complaints;

  const pendingList = wardComplaints.filter((c) => c.status === 'PENDING' || !c.assignedWorkerId);
  const inProgressList = wardComplaints.filter((c) => c.status === 'IN_PROGRESS');
  const resolvedList = wardComplaints.filter((c) => c.status === 'RESOLVED');

  const statusPieData = [
    { name: 'Pending', value: pendingList.length, color: '#3B82F6' },
    { name: 'In Progress', value: inProgressList.length, color: '#1D4ED8' },
    { name: 'Resolved', value: resolvedList.length, color: '#64748B' },
  ];

  // Calculate dynamic real performance data across wards from actual complaints list
  const wardPerformanceData = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'].map((wardName) => {
    const matching = complaints.filter(
      (c) => c.ward && c.ward.toLowerCase().includes(wardName.toLowerCase())
    );
    const active = matching.filter((c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
    const resolved = matching.filter((c) => c.status === 'RESOLVED').length;
    return { ward: wardName, active, resolved };
  });

  return (
    <Box>
      <HeaderBreadcrumb
        title="Councillor Operations Console"
        subtitle="Manage municipal complaints, dispatch field workers, and review community proposals."
        breadcrumbs={[
          { label: 'Councillor Module' },
          { label: 'Dashboard' },
        ]}
      />

      {/* Councillor Banner */}
      <WelcomeCard
        title={user?.fullName || 'Hon. Priya Verma'}
        subtitle={`Ward Councillor • ${user?.ward || 'Ward 1 - Central Town'} Operations Hub`}
        actionText="Broadcast Ward Notice"
        actionIcon={<CampaignIcon />}
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
          title="Pending Ward Complaints"
          value={pendingList.length}
          subtitle="Awaiting review or dispatch"
          icon={<HourglassEmptyIcon />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
          borderLeftColor="#2563EB"
        />

        <StatCard
          title="Work In Progress"
          value={inProgressList.length}
          subtitle="Field technicians active"
          icon={<TrackChangesIcon />}
          iconBgColor="#DBEAFE"
          iconColor="#1D4ED8"
          borderLeftColor="#1D4ED8"
        />

        <StatCard
          title="Total Resolved (MTD)"
          value={resolvedList.length}
          subtitle="Avg resolution: 1.8 days"
          icon={<CheckCircleOutlinedIcon />}
          iconBgColor="#F1F5F9"
          iconColor="#475569"
          borderLeftColor="#64748B"
        />

        <StatCard
          title="Community Proposals"
          value={3}
          subtitle="Awaiting councillor review"
          icon={<ForumIcon />}
          iconBgColor="#F8FAFC"
          iconColor="#0F172A"
          borderLeftColor="#334155"
        />
      </Box>

      {/* Quick Action Navigation Buttons */}
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
          startIcon={<AssignmentIcon />}
          onClick={() => navigate('/councillor/complaints')}
          sx={{
            py: 1.5,
            borderRadius: '16px',
            backgroundColor: '#2563EB',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': { backgroundColor: '#1D4ED8' },
          }}
        >
          Manage Complaints
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<RateReviewIcon />}
          onClick={() => navigate('/councillor/proposals')}
          sx={{
            py: 1.5,
            borderRadius: '16px',
            borderColor: '#CBD5E1',
            color: '#0F172A',
            backgroundColor: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { borderColor: '#2563EB', backgroundColor: '#F8FAFC' },
          }}
        >
          Review Proposals
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<CampaignIcon />}
          onClick={() => navigate('/councillor/announcements')}
          sx={{
            py: 1.5,
            borderRadius: '16px',
            borderColor: '#CBD5E1',
            color: '#0F172A',
            backgroundColor: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { borderColor: '#2563EB', backgroundColor: '#F8FAFC' },
          }}
        >
          Ward Announcements
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<AssessmentIcon />}
          onClick={() => navigate('/councillor/reports')}
          sx={{
            py: 1.5,
            borderRadius: '16px',
            borderColor: '#CBD5E1',
            color: '#0F172A',
            backgroundColor: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { borderColor: '#2563EB', backgroundColor: '#F8FAFC' },
          }}
        >
          Ward Reports
        </Button>
      </Box>

      {/* Analytics Charts Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <Card elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
            Ward-wise Complaint Resolution Comparison
          </Typography>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardPerformanceData}>
                <XAxis dataKey="ward" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <RechartsTooltip />
                <Bar dataKey="active" fill="#2563EB" name="Active" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" fill="#64748B" name="Resolved" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        <Card elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', width: '100%', textAlign: 'left', mb: 2 }}>
            Grievance Status Breakdown
          </Typography>
          <Box sx={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Box>

      {/* Pending Triage Table */}
      <Card elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Pending Grievance Action Queue
          </Typography>
          <Button size="small" onClick={() => navigate('/councillor/complaints')} sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'none' }}>
            View All Complaints
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Tracking ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Citizen & Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#64748B' }}>
                    No pending complaints in your ward queue.
                  </TableCell>
                </TableRow>
              ) : (
                pendingList.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Chip label={row.trackingNumber} size="small" sx={{ fontWeight: 800, backgroundColor: '#EFF6FF', color: '#2563EB' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {row.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                        <PersonIcon fontSize="small" sx={{ color: '#64748B', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {row.citizenName} • {row.ward}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.priority}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: PRIORITY_COLORS[row.priority]?.bg || '#F1F5F9',
                          color: PRIORITY_COLORS[row.priority]?.text || '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: STATUS_COLORS[row.status]?.bg || '#F1F5F9',
                          color: STATUS_COLORS[row.status]?.text || '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setAssignModalComplaint(row)}
                        sx={{
                          borderRadius: '12px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '0.8rem',
                          '&:hover': { backgroundColor: '#1D4ED8' },
                        }}
                      >
                        Assign Worker
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Assign Worker Modal */}
      <AssignWorkerModal
        open={Boolean(assignModalComplaint)}
        complaint={assignModalComplaint}
        onClose={() => setAssignModalComplaint(null)}
        onConfirm={handleConfirmAssign}
      />
    </Box>
  );
};
