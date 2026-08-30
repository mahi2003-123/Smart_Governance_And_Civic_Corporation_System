import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { adminService } from '../../services/adminService';
import { CivicAnalytics, Ward } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminStat } from '../../components/admin/AdminStat';

export const SystemReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CivicAnalytics | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [aData, wData] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getWards(),
        ]);
        setAnalytics(aData);
        setWards(wData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportReport = () => {
    window.print();
  };

  if (loading || !analytics) return <LoadingSpinner message="Generating Municipal Performance Reports..." />;

  return (
    <Box sx={{ pb: 6, maxWidth: 1100, mx: 'auto' }}>
      <AdminPageHeader
        title="System Reports"
        description="High-level analytics and performance summaries across municipal operations."
        actionLabel="Print / Export Report"
        actionIcon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
        onActionClick={handleExportReport}
        secondaryAction={
          <Button
            variant="outlined"
            startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={() => alert('Downloading Municipal Report CSV archive...')}
            sx={{
              borderColor: '#E5E8E4',
              color: '#202522',
              textTransform: 'none',
              fontSize: '0.875rem',
              borderRadius: '8px',
              '&:hover': { borderColor: '#496A57', backgroundColor: '#F8F9F7' },
            }}
          >
            Export CSV
          </Button>
        }
      />

      {/* Report Summary Cards */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
          EXECUTIVE PERFORMANCE SUMMARY
        </Typography>
        <Divider sx={{ mb: 2.5, borderColor: '#E5E8E4' }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 0,
            border: '1px solid #E5E8E4',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <AdminStat label="Total Complaints" value={analytics.totalComplaints} supportingText="Filed city-wide" />
          <AdminStat label="Pending Resolution" value={analytics.pendingComplaints} supportingText="Awaiting action" highlightColor="#B58A45" />
          <AdminStat label="Resolved Grievances" value={analytics.resolvedComplaints} supportingText="Target 90%+" highlightColor="#527A5E" />
          <AdminStat label="Active Wards" value={wards.length || 5} supportingText="Municipal divisions" showRightBorder={false} />
        </Box>
      </Box>

      {/* Category Breakdown & Ward Performance */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
            COMPLAINTS BY CATEGORY
          </Typography>
          <Divider sx={{ mb: 2.5, borderColor: '#E5E8E4' }} />

          <Box sx={{ p: 3, border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
            {analytics.categoryBreakdown.map((cat) => {
              const pct = Math.round((cat.count / analytics.totalComplaints) * 100);

              return (
                <Box key={cat.category} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                      {cat.category}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600 }}>
                      {cat.count} issues ({pct}%)
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, width: '100%', backgroundColor: '#F3F5F2', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, backgroundColor: '#496A57', borderRadius: 3 }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Grid>

        {/* Ward Resolution Rates */}
        <Grid item xs={12} md={6}>
          <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
            WARD RESOLUTION PERFORMANCE
          </Typography>
          <Divider sx={{ mb: 2.5, borderColor: '#E5E8E4' }} />

          <Box sx={{ p: 3, border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
            {wards.map((w) => {
              const total = w.activeComplaints + w.resolvedComplaints;
              const pct = total > 0 ? Math.round((w.resolvedComplaints / total) * 100) : 100;

              return (
                <Box key={w.id} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                      {w.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600 }}>
                      {pct}% Resolved ({w.activeComplaints} active)
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, width: '100%', backgroundColor: '#F3F5F2', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, backgroundColor: '#527A5E', borderRadius: 3 }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemReports;
