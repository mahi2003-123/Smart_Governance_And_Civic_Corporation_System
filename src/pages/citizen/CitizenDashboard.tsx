import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  AddTaskIcon,
  EyeIcon,
  CheckIcon,
  HourglassIcon,
  EngineeringIcon,
  AssignmentIcon,
  ArrowRightIcon,
} from '../../components/common/Icons';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
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
    fetchComplaints();
  }, []);

  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  if (loading) {
    return <LoadingSpinner message="Loading your citizen ward portal..." />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 6 }}>
      {/* Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          borderRadius: '24px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.fullName || 'Citizen'}! 👋
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, maxWidth: 650, lineHeight: 1.6 }}>
            Assigned Ward Jurisdiction:{' '}
            <strong style={{ color: '#1E40AF' }}>{user?.ward || 'Ward 1 - Central Town'}</strong>. Report civic grievances, track repairs, and vote on community ward proposals.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddTaskIcon size={20} color="#FFFFFF" />}
            onClick={() => navigate('/citizen/complaints/submit')}
            sx={{
              py: 1.4,
              px: 3,
              borderRadius: '20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.925rem',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: '#1D4ED8',
              },
            }}
          >
            Report New Issue
          </Button>

          <Button
            variant="outlined"
            startIcon={<SearchIcon sx={{ color: '#2563EB' }} />}
            onClick={() => navigate('/citizen/track')}
            sx={{
              py: 1.4,
              px: 2.5,
              borderRadius: '20px',
              borderColor: '#BFDBFE',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.925rem',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: '#F8FAFC',
                borderColor: '#2563EB',
              },
            }}
          >
            Track Issue
          </Button>
        </Box>
      </Paper>

      {/* Metrics Summary Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
        {/* Total Registered Grievances */}
        <Card
          elevation={0}
          onClick={() => navigate('/citizen/complaints')}
          sx={{
            p: 3,
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' },
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AssignmentIcon size={26} color="#2563EB" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {totalComplaints}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mt: 0.5, display: 'block' }}>
              Total Complaints Filed
            </Typography>
          </Box>
        </Card>

        {/* In Progress */}
        <Card
          elevation={0}
          onClick={() => navigate('/citizen/complaints')}
          sx={{
            p: 3,
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' },
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#FFFBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HourglassIcon size={26} color="#D97706" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {pendingCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mt: 0.5, display: 'block' }}>
              Grievances In Progress
            </Typography>
          </Box>
        </Card>

        {/* Resolved */}
        <Card
          elevation={0}
          onClick={() => navigate('/citizen/complaints')}
          sx={{
            p: 3,
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' },
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon size={26} color="#10B981" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {resolvedCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mt: 0.5, display: 'block' }}>
              Successfully Resolved
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Main Grid Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, gap: 4 }}>
        
        {/* Recent Grievances Table */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              My Recent Complaints
            </Typography>

            <Button
              endIcon={<ArrowRightIcon size={16} color="#2563EB" />}
              onClick={() => navigate('/citizen/complaints')}
              sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'none', fontSize: '0.875rem' }}
            >
              View All History
            </Button>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 } }}>
                  <TableCell>Tracking ID</TableCell>
                  <TableCell>Title / Category</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748B' }}>
                      No civic complaints recorded yet. Click 'Report New Issue' to submit one.
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.slice(0, 5).map((comp) => {
                    return (
                      <TableRow
                        key={comp.id}
                        hover
                        onClick={() => navigate(`/citizen/complaints/${comp.id}`)}
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td, &:last-child th': { border: 0 },
                          '& td': { py: 2 },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.85rem' }}>
                          {comp.trackingNumber}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {comp.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 500 }}>
                            {comp.category} • {comp.ward}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                          {new Date(comp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={comp.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/citizen/complaints/${comp.id}`);
                              }}
                              sx={{
                                color: '#2563EB',
                                backgroundColor: '#EFF6FF',
                                '&:hover': { backgroundColor: '#DBEAFE' },
                              }}
                            >
                              <EyeIcon size={18} color="#2563EB" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Right Side Widgets */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Ward Notices Widget */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <CampaignIcon sx={{ color: '#2563EB' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Ward Notices
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 2 }}>
              Stay updated with official municipal announcements, water shutdown alerts, and road repair schedules.
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/citizen/notices')}
              sx={{
                borderRadius: '14px',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: 700,
                textTransform: 'none',
                py: 1,
                backgroundColor: '#FFFFFF',
                '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
              }}
            >
              View Ward Notices
            </Button>
          </Paper>

          {/* Ward Voting Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <EngineeringIcon size={22} color="#2563EB" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Community Proposals
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 2 }}>
              Upvote local infrastructure proposals or submit project ideas for your ward councillor's budget review.
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/citizen/proposals')}
              sx={{
                borderRadius: '14px',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: 700,
                textTransform: 'none',
                py: 1,
                backgroundColor: '#FFFFFF',
                '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
              }}
            >
              Explore Proposals
            </Button>
          </Paper>

          {/* Emergency Municipal Support */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E40AF', mb: 1 }}>
              Toll-Free Civic Support
            </Typography>
            <Typography variant="caption" sx={{ color: '#2563EB', display: 'block', mb: 2, fontWeight: 600 }}>
              24/7 Helpline: 1800-11-2024 for immediate civic emergencies.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => alert('Dialing Helpline: 1800-11-2024')}
              sx={{
                borderRadius: '14px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'none',
                py: 1,
                '&:hover': { backgroundColor: '#1D4ED8' },
              }}
            >
              Call 1800-11-2024
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CitizenDashboard;
