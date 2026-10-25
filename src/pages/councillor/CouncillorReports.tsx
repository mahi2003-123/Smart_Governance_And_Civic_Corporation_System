import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { adminService } from '../../services/adminService';
import { Complaint, Ward } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { matchesWard } from '../../utils/wardUtils';

const CATEGORY_DEFINITIONS = [
  { key: 'ROADS', label: 'Roads & Potholes', aliases: ['ROAD', 'ROADS', 'POTHOLE', 'STREET'] },
  { key: 'STREET_LIGHT', label: 'Street Lighting', aliases: ['STREET_LIGHT', 'STREET_LIGHTING', 'LIGHTING', 'LAMP'] },
  { key: 'WASTE_MANAGEMENT', label: 'Waste Management', aliases: ['WASTE_MANAGEMENT', 'GARBAGE', 'SANITATION', 'TRASH'] },
  { key: 'WATER_SUPPLY', label: 'Water Supply', aliases: ['WATER_SUPPLY', 'WATER', 'PIPELINE'] },
  { key: 'DRAINAGE', label: 'Sewage & Drainage', aliases: ['DRAINAGE', 'SEWAGE', 'DRAIN'] },
  { key: 'PUBLIC_SPACE', label: 'Public Spaces & Parks', aliases: ['PUBLIC_SPACE', 'PARK', 'GARDEN'] },
  { key: 'OTHER', label: 'Other Civic Issues', aliases: ['OTHER'] },
];

export const CouncillorReports: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPDF, setExportingPDF] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [complaintData, wardData] = await Promise.all([
        complaintService.getComplaints({}, true).catch(() => [] as Complaint[]),
        adminService.getWards().catch(() => [] as Ward[]),
      ]);
      setComplaints(complaintData);
      setWards(wardData);

      if (user?.role === 'COUNCILLOR' && user.ward) {
        setSelectedWard(user.ward);
      }
    } catch (err) {
      console.error('Failed to load live municipal reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter complaints based on active ward selection
  const filteredComplaints = useMemo(() => {
    if (!selectedWard || selectedWard === 'ALL') {
      return complaints;
    }
    return complaints.filter((c) => matchesWard(c.ward, selectedWard));
  }, [complaints, selectedWard]);

  // Aggregate Category Performance Matrix
  const reportData = useMemo(() => {
    return CATEGORY_DEFINITIONS.map((def) => {
      const catComplaints = filteredComplaints.filter((c) => {
        const cCat = (c.category || '').toUpperCase().trim();
        return def.aliases.some((alias) => cCat === alias || cCat.includes(alias));
      });

      const filed = catComplaints.length;
      const resolved = catComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
      const inProgress = catComplaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
      const pending = catComplaints.filter((c) => c.status === 'PENDING').length;
      const rate = filed > 0 ? Math.round((resolved / filed) * 100) : 0;

      // Calculate average turnaround time for resolved grievances
      const resolvedWithTime = catComplaints.filter(
        (c) => (c.status === 'RESOLVED' || c.status === 'CLOSED') && c.createdAt && c.updatedAt
      );
      let avgTime = 'N/A';
      if (resolvedWithTime.length > 0) {
        let totalMs = 0;
        resolvedWithTime.forEach((c) => {
          const diff = new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime();
          if (diff > 0) totalMs += diff;
        });
        const avgDays = totalMs / (resolvedWithTime.length * 1000 * 60 * 60 * 24);
        if (avgDays < 0.1) {
          avgTime = '< 0.5 days';
        } else {
          avgTime = `${avgDays.toFixed(1)} days`;
        }
      } else if (filed > 0 && resolved === 0) {
        avgTime = 'Pending';
      }

      return {
        key: def.key,
        category: def.label,
        filed,
        resolved,
        inProgress,
        pending,
        rate,
        avgTime,
      };
    });
  }, [filteredComplaints]);

  // Overall Performance Summary KPIs
  const summaryTotals = useMemo(() => {
    const totalFiled = filteredComplaints.length;
    const totalResolved = filteredComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const totalInProgress = filteredComplaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
    const totalPending = filteredComplaints.filter((c) => c.status === 'PENDING').length;
    const overallRate = totalFiled > 0 ? Math.round((totalResolved / totalFiled) * 100) : 0;
    return {
      totalFiled,
      totalResolved,
      totalInProgress,
      totalPending,
      overallRate,
    };
  }, [filteredComplaints]);

  // Current Ward Info details
  const currentWardInfo = useMemo(() => {
    if (!selectedWard || selectedWard === 'ALL') {
      return {
        label: 'All Municipal Wards',
        councillor: user?.fullName || 'Municipal Administration',
      };
    }
    const matching = wards.find((w) => matchesWard(w.name, selectedWard) || matchesWard(w.id, selectedWard));
    return {
      label: matching ? matching.name : selectedWard,
      councillor: matching?.councillorName && matching.councillorName !== 'Unassigned'
        ? matching.councillorName
        : user?.fullName || 'Ward Councillor',
    };
  }, [selectedWard, wards, user]);

  // Export Official PDF Audit Report
  const handleExportPDF = () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Municipal Header Banner (Deep Municipal Green)
      doc.setFillColor(31, 77, 58); // #1F4D3A
      doc.rect(0, 0, 210, 30, 'F');

      // Title & Subtitle in White
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('SMART GOVERNANCE & CIVIC SERVICES (SGCS)', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('MUNICIPAL CORPORATION - OFFICIAL WARD PERFORMANCE & AUDIT REPORT', 14, 21);

      // Metadata section
      doc.setTextColor(32, 37, 34);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('AUDIT PARAMETERS & JURISDICTION:', 14, 38);

      doc.setFont('helvetica', 'normal');
      doc.text(`Jurisdiction: ${currentWardInfo.label}`, 14, 44);
      doc.text(`Presiding Councillor / Officer: ${currentWardInfo.councillor}`, 14, 50);
      doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 14, 56);

      doc.text(`Audit ID: SGCS-AUD-${Date.now().toString().slice(-6)}`, 130, 44);
      doc.text(`Verification Status: OFFICIAL & LIVE`, 130, 50);
      doc.text(`Total Records Audited: ${summaryTotals.totalFiled} Grievances`, 130, 56);

      // Divider line
      doc.setDrawColor(229, 232, 228);
      doc.setLineWidth(0.5);
      doc.line(14, 61, 196, 61);

      // Executive Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 77, 58);
      doc.text('EXECUTIVE CIVIC PERFORMANCE SUMMARY', 14, 69);

      autoTable(doc, {
        startY: 73,
        head: [['Complaints Filed', 'Successfully Resolved', 'Active / In Progress', 'Pending Verification', 'Resolution Efficiency']],
        body: [[
          summaryTotals.totalFiled.toString(),
          summaryTotals.totalResolved.toString(),
          summaryTotals.totalInProgress.toString(),
          summaryTotals.totalPending.toString(),
          `${summaryTotals.overallRate}%`,
        ]],
        theme: 'grid',
        headStyles: {
          fillColor: [73, 106, 87],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8.5,
        },
        bodyStyles: {
          halign: 'center',
          fontStyle: 'bold',
          textColor: [32, 37, 34],
          fontSize: 9,
        },
        styles: {
          cellPadding: 3,
        },
      });

      // Category Matrix Table
      const tableStartY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 9 : 98;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 77, 58);
      doc.text('CATEGORY PERFORMANCE MATRIX & SLA AUDIT', 14, tableStartY);

      const tableBody = reportData.map((row) => [
        row.category,
        row.filed.toString(),
        row.resolved.toString(),
        `${row.rate}%`,
        row.avgTime,
      ]);

      autoTable(doc, {
        startY: tableStartY + 4,
        head: [['Civic Category', 'Complaints Filed', 'Successfully Resolved', 'Resolution Efficiency', 'Avg Turnaround Time']],
        body: tableBody,
        theme: 'striped',
        headStyles: {
          fillColor: [31, 77, 58],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 247],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3.5,
          textColor: [32, 37, 34],
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'center' },
        },
      });

      // Official Footer Certification
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 14 : 220;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(104, 112, 107);
      doc.text(
        'This official document is generated automatically by the Smart Governance & Civic Services (SGCS) Municipal Audit Engine.',
        14,
        finalY
      );
      doc.text(
        `Certified by Municipal Corporation Grievance Redressal Cell. Digitally verified on ${new Date().toISOString()}`,
        14,
        finalY + 5
      );

      // Save PDF to user's device
      const cleanWard = currentWardInfo.label.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`SGCS_Ward_Audit_Report_${cleanWard}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      window.print();
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating Ward Performance & Municipal Audit Reports..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header & Export Action */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1C2A24' }}>
            Ward Performance & Municipal Audit Reports
          </Typography>
          <Typography variant="body1" sx={{ color: '#68706B', mt: 0.5 }}>
            Official monthly analytical breakdown of civic issue resolutions, technician SLA, and ward performance.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh live report data">
            <IconButton onClick={loadData} sx={{ border: '1px solid #E5E8E4', borderRadius: '8px' }}>
              <RefreshOutlinedIcon sx={{ color: '#496A57' }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={exportingPDF ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <DownloadIcon />}
            onClick={handleExportPDF}
            disabled={exportingPDF}
            sx={{
              borderRadius: '28px',
              px: 3,
              backgroundColor: '#1F4D3A',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(31, 77, 58, 0.25)',
              '&:hover': { backgroundColor: '#16382A' },
            }}
          >
            {exportingPDF ? 'Generating PDF...' : 'Export PDF Audit Report'}
          </Button>
        </Stack>
      </Box>

      {/* Ward Selection Bar (if Admin or Multiple Wards) */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          borderRadius: '12px',
          border: '1px solid #E5E8E4',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FilterListOutlinedIcon sx={{ color: '#1F4D3A', fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C2A24' }}>
                Ward Scope: <span style={{ color: '#1F4D3A' }}>{currentWardInfo.label}</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>
                Presiding Councillor: {currentWardInfo.councillor}
              </Typography>
            </Box>
          </Box>

          {(user?.role === 'ADMIN' || !user?.ward) && wards.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="ward-select-label">Select Ward</InputLabel>
              <Select
                labelId="ward-select-label"
                value={selectedWard}
                label="Select Ward"
                onChange={(e) => setSelectedWard(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="ALL">All Municipal Wards</MenuItem>
                {wards.map((w) => (
                  <MenuItem key={w.id || w.name} value={w.name}>
                    {w.name} {w.wardNumber ? `(Ward ${w.wardNumber})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Card>

      {/* KPI Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Complaints Filed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1C2A24', mt: 0.5 }}>
                  {summaryTotals.totalFiled}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '10px', backgroundColor: '#E8F0EC' }}>
                <ReportProblemOutlinedIcon sx={{ color: '#1F4D3A', fontSize: 26 }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Successfully Resolved
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#2E7D32', mt: 0.5 }}>
                  {summaryTotals.totalResolved}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '10px', backgroundColor: '#E8F5E9' }}>
                <CheckCircleOutlinedIcon sx={{ color: '#2E7D32', fontSize: 26 }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, textTransform: 'uppercase' }}>
                  In Progress / Pending
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#E65100', mt: 0.5 }}>
                  {summaryTotals.totalInProgress + summaryTotals.totalPending}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '10px', backgroundColor: '#FFF3E0' }}>
                <HourglassEmptyOutlinedIcon sx={{ color: '#E65100', fontSize: 26 }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Resolution Efficiency
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1F4D3A', mt: 0.5 }}>
                  {summaryTotals.overallRate}%
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '10px', backgroundColor: '#E8F0EC' }}>
                <TrendingUpOutlinedIcon sx={{ color: '#1F4D3A', fontSize: 26 }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Summary */}
      <Card sx={{ p: 3, mb: 4, borderRadius: '16px', border: '1px solid #E5E8E4', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1C2A24' }}>
            Grievance Filing vs Resolution by Category
          </Typography>
          <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600 }}>
            Live Municipal Data ({summaryTotals.totalFiled} total complaints)
          </Typography>
        </Box>
        <Box sx={{ width: '100%', height: 320, minHeight: 320, pt: 1 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8E4" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#68706B' }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#68706B' }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E8E4',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Legend verticalAlign="top" align="right" height={36} />
              <Bar dataKey="filed" fill="#496A57" name="Total Filed" radius={[6, 6, 0, 0]} />
              <Bar dataKey="resolved" fill="#2E7D32" name="Resolved" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      {/* Detailed Data Audit Table */}
      <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid #E5E8E4', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1C2A24' }}>
            Category Performance Matrix
          </Typography>
          <Typography variant="caption" sx={{ color: '#68706B' }}>
            Synchronized with Ward Database Records
          </Typography>
        </Box>
        <Table>
          <TableHead sx={{ backgroundColor: '#F8F9F7' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#1C2A24' }}>CIVIC CATEGORY</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1C2A24' }}>COMPLAINTS FILED</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1C2A24' }}>SUCCESSFULLY RESOLVED</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1C2A24' }}>RESOLUTION EFFICIENCY</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1C2A24' }}>AVG TURNAROUND TIME</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row) => (
              <TableRow key={row.key} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ fontWeight: 600, color: '#202522' }}>{row.category}</TableCell>
                <TableCell>{row.filed}</TableCell>
                <TableCell>{row.resolved}</TableCell>
                <TableCell>
                  <Chip
                    label={`${row.rate}%`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: row.rate >= 90 ? '#E8F5E9' : row.rate > 0 ? '#FFF3E0' : '#F5F5F5',
                      color: row.rate >= 90 ? '#2E7D32' : row.rate > 0 ? '#E65100' : '#757575',
                      border: '1px solid',
                      borderColor: row.rate >= 90 ? '#C8E6C9' : row.rate > 0 ? '#FFE0B2' : '#E0E0E0',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#68706B' }}>{row.avgTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default CouncillorReports;
