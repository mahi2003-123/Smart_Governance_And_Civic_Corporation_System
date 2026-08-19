import React from 'react';
import { Box, Card, Typography, Grid, Button, Stack, Paper, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DnsIcon from '@mui/icons-material/Dns';
import SecurityIcon from '@mui/icons-material/Security';

export const SystemReports: React.FC = () => {
  const auditLogs = [
    { id: '1', event: 'System Backup Completed', user: 'SYSTEM_CRON', timestamp: '2026-08-05 04:00:00', status: 'SUCCESS' },
    { id: '2', event: 'Role Upgrade: User usr_worker_02 promoted to Senior Field Tech', user: 'Dr. Rajesh Nair (Admin)', timestamp: '2026-08-04 14:22:10', status: 'AUDITED' },
    { id: '3', event: 'Database Index Rebuild', user: 'SYSTEM_DBA', timestamp: '2026-08-04 02:15:00', status: 'SUCCESS' },
    { id: '4', event: 'Ward 1 Boundary Coordinates Updated', user: 'Dr. Rajesh Nair (Admin)', timestamp: '2026-08-03 11:45:00', status: 'AUDITED' },
  ];

  const handleDownloadLog = () => {
    alert('Downloading System Security & Operations Audit CSV Log...');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            System Audit & Governance Logs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enterprise infrastructure logging, security access audits, and system health status.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadLog} sx={{ borderRadius: 28, px: 3 }}>
          Export System Audit CSV
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, borderRadius: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <DnsIcon sx={{ color: '#6F4E37' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Database Uptime
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight={800} color="success.main">
              99.98%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Zero unscheduled downtime past 90 days
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, borderRadius: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <SecurityIcon sx={{ color: '#6F4E37' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Security Policy Status
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight={800} color="primary">
              Active
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Role-based JWT encryption enabled
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, borderRadius: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <DownloadIcon sx={{ color: '#6F4E37' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Daily Backup Archive
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              2.4 GB
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Compressed encrypted snapshots
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          System Operations Audit Trail
        </Typography>

        <Stack spacing={2}>
          {auditLogs.map((log) => (
            <Paper key={log.id} sx={{ p: 2, borderRadius: 3, bgcolor: '#F8F5F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {log.event}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Triggered by: {log.user} • {log.timestamp}
                </Typography>
              </Box>
              <Chip label={log.status} color="success" size="small" sx={{ fontWeight: 700 }} />
            </Paper>
          ))}
        </Stack>
      </Card>
    </Box>
  );
};
