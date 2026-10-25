import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Divider, Stack, Alert } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { CivicAnalytics, SystemActivityLog, Ward } from '../../types';
import { matchesWard } from '../../utils/wardUtils';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminStat } from '../../components/admin/AdminStat';
import { ActivityFeed } from '../../components/admin/ActivityFeed';
import { AccessDeniedState } from '../../components/common/AccessDeniedState';

const DEFAULT_ANALYTICS: CivicAnalytics = {
  totalComplaints: 0,
  pendingComplaints: 0,
  inProgressComplaints: 0,
  resolvedComplaints: 0,
  totalProposals: 0,
  activeNotices: 0,
  categoryBreakdown: [],
  monthlyTrends: [],
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CivicAnalytics>(DEFAULT_ANALYTICS);
  const [activities, setActivities] = useState<SystemActivityLog[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [totalCitizens, setTotalCitizens] = useState(0);
  const [totalCouncillors, setTotalCouncillors] = useState(0);
  const [totalWorkers, setTotalWorkers] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    setError(null);
    try {
      const [analyticsRes, activityRes, wardRes, userRes] = await Promise.allSettled([
        adminService.getAnalytics(),
        adminService.getActivityLogs(),
        adminService.getWards(),
        adminService.getUsers(),
      ]);

      // Detect permission / forbidden failures
      const results = [analyticsRes, activityRes, wardRes, userRes];
      for (const res of results) {
        if (res.status === 'rejected') {
          const err = res.reason;
          if (err?.response?.status === 403 || err?.status === 403) {
            setForbidden(true);
            return;
          }
        }
      }

      let hadRejections = false;

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalytics(analyticsRes.value);
      } else {
        hadRejections = true;
      }

      if (activityRes.status === 'fulfilled' && Array.isArray(activityRes.value)) {
        setActivities(activityRes.value);
      } else {
        hadRejections = true;
      }

      const wardData = wardRes.status === 'fulfilled' && Array.isArray(wardRes.value) ? wardRes.value : [];
      const userData = userRes.status === 'fulfilled' && Array.isArray(userRes.value) ? userRes.value : [];

      if (wardRes.status === 'rejected' || userRes.status === 'rejected') {
        hadRejections = true;
      }

      const councillors = userData.filter((u) => u.role === 'COUNCILLOR' && (u.status || 'ACTIVE') === 'ACTIVE');
      const enrichedWards = wardData.map((w) => {
        let cName = w.councillorName;
        let cEmail = w.councillorEmail;
        if (!cName || cName.trim() === '' || cName.toLowerCase() === 'unassigned') {
          const found = councillors.find((c) => matchesWard(c.ward, w.name));
          if (found) {
            cName = found.fullName;
            cEmail = found.email;
          }
        }
        return {
          ...w,
          councillorName: cName && cName.trim() !== '' ? cName : 'Unassigned',
          councillorEmail: cEmail || '',
        };
      });
      setWards(enrichedWards);

      setTotalCitizens(userData.filter((u) => u.role === 'CITIZEN').length);
      setTotalCouncillors(userData.filter((u) => u.role === 'COUNCILLOR').length);
      setTotalWorkers(userData.filter((u) => u.role === 'WORKER').length);

      if (hadRejections) {
        setError('Unable to load some live municipal records. Displaying cached overview.');
      }
    } catch (e: any) {
      console.error(e);
      if (e?.response?.status === 403 || e?.status === 403) {
        setForbidden(true);
      } else {
        setError('Failed to reach backend server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (forbidden) {
    return <AccessDeniedState message="You do not have administrative privileges to access the Super Admin Dashboard." />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Super Admin System Overview..." />;
  }

  const pendingPct = analytics.totalComplaints > 0 ? Math.round((analytics.pendingComplaints / analytics.totalComplaints) * 100) : 0;
  const inProgressPct = analytics.totalComplaints > 0 ? Math.round((analytics.inProgressComplaints / analytics.totalComplaints) * 100) : 0;
  const resolvedPct = analytics.totalComplaints > 0 ? Math.round((analytics.resolvedComplaints / analytics.totalComplaints) * 100) : 0;

  return (
    <Box sx={{ pb: 8, maxWidth: 1200, mx: 'auto' }}>
      {/* 1. Page Header Standard */}
      <AdminPageHeader
        title="System Overview"
        description="Monitor civic activity, users and system performance."
        actionLabel="Register Staff Account"
        actionIcon={<PersonAddOutlinedIcon sx={{ fontSize: 18 }} />}
        onActionClick={() => navigate('/admin/users')}
      />

      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={fetchData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* 2. System Summary */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
          SYSTEM SUMMARY
        </Typography>
        <Divider sx={{ mb: 2.5, borderColor: '#E5E8E4' }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr 1fr' },
            gap: 0,
            border: '1px solid #E5E8E4',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <AdminStat
            label="Total Citizens"
            value={totalCitizens}
            supportingText="Registered resident accounts"
            onClick={() => navigate('/admin/users')}
          />
          <AdminStat
            label="Total Councillors"
            value={totalCouncillors}
            supportingText="Municipal ward leaders"
            onClick={() => navigate('/admin/councillors')}
          />
          <AdminStat
            label="Total Workers"
            value={totalWorkers}
            supportingText="Field maintenance staff"
            onClick={() => navigate('/admin/workers')}
          />
          <AdminStat
            label="Total Complaints"
            value={analytics.totalComplaints}
            supportingText="System-wide grievances"
            onClick={() => navigate('/admin/complaints')}
          />
          <AdminStat
            label="Pending Complaints"
            value={analytics.pendingComplaints}
            supportingText="Awaiting action"
            highlightColor="#B58A45"
            onClick={() => navigate('/admin/complaints')}
          />
          <AdminStat
            label="Resolved Complaints"
            value={analytics.resolvedComplaints}
            supportingText="Successfully fixed"
            highlightColor="#527A5E"
            showRightBorder={false}
            onClick={() => navigate('/admin/complaints')}
          />
        </Box>
      </Box>

      {/* 3. Complaint Overview */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600 }}>
            COMPLAINT STATUS OVERVIEW
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/admin/complaints')}
            sx={{ color: '#496A57', textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}
          >
            Manage complaints →
          </Button>
        </Box>
        <Divider sx={{ mb: 3, borderColor: '#E5E8E4' }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2.5,
          }}
        >
          {/* Pending */}
          <Box
            sx={{
              p: 3,
              borderRadius: '8px',
              border: '1px solid #E5E8E4',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.04em' }}>
              PENDING GRIEVANCES
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#B58A45', mb: 1 }}>
              {analytics.pendingComplaints}
            </Typography>
            <Box sx={{ height: 4, width: '100%', backgroundColor: '#FBF4E8', borderRadius: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${pendingPct}%`,
                  backgroundColor: '#B58A45',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#68706B', mt: 1, display: 'block' }}>
              {pendingPct}% of total system volume
            </Typography>
          </Box>

          {/* In Progress */}
          <Box
            sx={{
              p: 3,
              borderRadius: '8px',
              border: '1px solid #E5E8E4',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.04em' }}>
              IN PROGRESS
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#496A57', mb: 1 }}>
              {analytics.inProgressComplaints}
            </Typography>
            <Box sx={{ height: 4, width: '100%', backgroundColor: '#E8EFE9', borderRadius: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${inProgressPct}%`,
                  backgroundColor: '#496A57',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#68706B', mt: 1, display: 'block' }}>
              {inProgressPct}% active in repair stage
            </Typography>
          </Box>

          {/* Resolved */}
          <Box
            sx={{
              p: 3,
              borderRadius: '8px',
              border: '1px solid #E5E8E4',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.04em' }}>
              RESOLVED ISSUES
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#527A5E', mb: 1 }}>
              {analytics.resolvedComplaints}
            </Typography>
            <Box sx={{ height: 4, width: '100%', backgroundColor: '#E8EFE9', borderRadius: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${resolvedPct}%`,
                  backgroundColor: '#527A5E',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#68706B', mt: 1, display: 'block' }}>
              {resolvedPct}% resolution rate
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 4. Split Grid: Recent System Activity & Ward Overview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 5 }}>
        {/* Recent System Activity */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600 }}>
              RECENT SYSTEM ACTIVITY
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/admin/activity')}
              sx={{ color: '#496A57', textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}
            >
              Full audit log →
            </Button>
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#E5E8E4' }} />

          <ActivityFeed activities={activities} limit={5} />
        </Box>

        {/* Ward Overview */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600 }}>
              WARD OVERVIEW
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/admin/wards')}
              endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
              sx={{ color: '#496A57', textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}
            >
              View All Wards
            </Button>
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#E5E8E4' }} />

          <Stack spacing={2}>
            {wards.slice(0, 4).map((w) => (
              <Box
                key={w.id}
                onClick={() => navigate('/admin/wards')}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid #E5E8E4',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { backgroundColor: '#F8F9F7' },
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522' }}>
                    {w.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    Councillor: {w.councillorName || 'Unassigned'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#496A57' }}>
                    {w.activeComplaints || 0} active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    {w.resolvedComplaints || 0} resolved
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
