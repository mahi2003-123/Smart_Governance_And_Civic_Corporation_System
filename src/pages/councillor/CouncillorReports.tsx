import React from 'react';
import { Box, Card, Typography, Grid, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

export const CouncillorReports: React.FC = () => {
  const reportData = [
    { category: 'Roads & Potholes', filed: 42, resolved: 38, avgTime: '1.5 days' },
    { category: 'Street Lighting', filed: 28, resolved: 27, avgTime: '1.1 days' },
    { category: 'Waste Management', filed: 35, resolved: 34, avgTime: '0.8 days' },
    { category: 'Water Supply', filed: 18, resolved: 16, avgTime: '2.0 days' },
    { category: 'Sewage & Drainage', filed: 15, resolved: 14, avgTime: '2.5 days' },
  ];

  const handleExportPDF = () => {
    alert('Exporting Official Ward Civic Performance PDF Report...');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            Ward Performance & Municipal Audit Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Official monthly analytical breakdown of civic issue resolutions, technician SLA, and ward performance.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportPDF} sx={{ borderRadius: 28, px: 3 }}>
          Export PDF Audit Report
        </Button>
      </Box>

      {/* Chart Summary */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Grievance Filing vs Resolution by Category
        </Typography>
        <Box height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="filed" fill="#6F4E37" name="Total Filed" radius={[6, 6, 0, 0]} />
              <Bar dataKey="resolved" fill="#2E7D32" name="Resolved" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      {/* Detailed Data Audit Table */}
      <Card sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Category Performance Matrix
        </Typography>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Civic Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Complaints Filed</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Successfully Resolved</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Resolution Efficiency</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Avg Turnaround Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row) => {
              const rate = Math.round((row.resolved / row.filed) * 100);
              return (
                <TableRow key={row.category} hover>
                  <TableCell fontWeight={700}>{row.category}</TableCell>
                  <TableCell>{row.filed}</TableCell>
                  <TableCell>{row.resolved}</TableCell>
                  <TableCell>
                    <Chip label={`${rate}%`} color={rate > 90 ? 'success' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{row.avgTime}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};
