import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Card,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Stack,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { adminService } from '../../services/adminService';
import { complaintService } from '../../services/complaintService';
import { CivicAnalytics, Ward, Complaint, User } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { matchesWard } from '../../utils/wardUtils';

interface WardStat {
  wardId: string;
  wardName: string;
  councillorName: string;
  total: number;
  solved: number;
  inProgress: number;
  pending: number;
  solvedRate: number;
  rating: string;
}

const STATUS_COLORS = {
  solved: '#2E7D32',      // Emerald Green
  inProgress: '#1F4D3A',  // Forest Green
  pending: '#E65100',     // Deep Amber/Orange
  other: '#757575',
};

export const SystemReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CivicAnalytics | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [aData, wData, cData, uData] = await Promise.all([
          adminService.getAnalytics().catch(() => null),
          adminService.getWards().catch(() => [] as Ward[]),
          complaintService.getComplaints({}, true).catch(() => [] as Complaint[]),
          adminService.getUsers().catch(() => [] as User[]),
        ]);
        setAnalytics(aData);
        setWards(wData);
        setComplaints(cData);
        setUsers(uData);
      } catch (e) {
        console.error('Failed to load municipal reports data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute ward-by-ward metrics combining wards registry and live complaints
  const wardStats = useMemo<WardStat[]>(() => {
    // 1. Gather all unique ward names
    const wardMap = new Map<string, { id: string; name: string; councillor: string }>();
    const activeCouncillors = users.filter((u) => u.role === 'COUNCILLOR' && (u.status || 'ACTIVE') === 'ACTIVE');

    wards.forEach((w) => {
      let cName = w.councillorName;
      if (!cName || cName.trim() === '' || cName.toLowerCase() === 'unassigned' || cName === 'Assigned Councillor') {
        const found = activeCouncillors.find((u) => matchesWard(u.ward, w.name));
        if (found) {
          cName = found.fullName;
        }
      }
      wardMap.set(w.name.trim(), {
        id: w.id,
        name: w.name.trim(),
        councillor: cName && cName.trim() !== '' ? cName : 'Unassigned',
      });
    });

    // Check if complaints reference any ward not in wards list
    complaints.forEach((c) => {
      if (c.ward && c.ward.trim()) {
        const trimmed = c.ward.trim();
        let matchedKey: string | null = null;
        for (const existingName of wardMap.keys()) {
          if (matchesWard(trimmed, existingName)) {
            matchedKey = existingName;
            break;
          }
        }
        if (!matchedKey) {
          const found = activeCouncillors.find((u) => matchesWard(u.ward, trimmed));
          wardMap.set(trimmed, {
            id: `w_${trimmed.replace(/\s+/g, '_')}`,
            name: trimmed,
            councillor: found ? found.fullName : 'Municipal Office',
          });
        }
      }
    });

    // 2. Aggregate counts per ward
    const results: WardStat[] = [];

    wardMap.forEach((info, wardName) => {
      const wardComplaints = complaints.filter((c) => matchesWard(c.ward, wardName));
      const total = wardComplaints.length;
      const solved = wardComplaints.filter((c) => (c.status || '').toUpperCase() === 'RESOLVED').length;
      const inProgress = wardComplaints.filter((c) => (c.status || '').toUpperCase() === 'IN_PROGRESS').length;
      const pending = wardComplaints.filter(
        (c) => (c.status || '').toUpperCase() === 'PENDING' || (!(c.status || '').toUpperCase().includes('RESOLV') && !(c.status || '').toUpperCase().includes('PROGRESS'))
      ).length;

      const solvedRate = total > 0 ? Math.round((solved / total) * 100) : 0;

      let rating = 'On Track';
      if (total === 0) rating = 'No Grievances';
      else if (solvedRate >= 85) rating = 'Excellent SLA';
      else if (solvedRate >= 60) rating = 'Satisfactory';
      else rating = 'Action Required';

      results.push({
        wardId: info.id,
        wardName: info.name,
        councillorName: info.councillor,
        total,
        solved,
        inProgress,
        pending,
        solvedRate,
        rating,
      });
    });

    // Sort by ward name naturally or ward number
    return results.sort((a, b) => a.wardName.localeCompare(b.wardName, undefined, { numeric: true }));
  }, [wards, complaints, users]);

  // Filtered complaints based on selected ward dropdown
  const filteredComplaints = useMemo(() => {
    if (selectedWard === 'ALL') return complaints;
    return complaints.filter((c) => matchesWard(c.ward, selectedWard));
  }, [complaints, selectedWard]);

  // Overall KPI aggregates
  const totalFiled = filteredComplaints.length;
  const totalSolved = filteredComplaints.filter((c) => (c.status || '').toUpperCase() === 'RESOLVED').length;
  const totalInProgress = filteredComplaints.filter((c) => (c.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const totalPending = filteredComplaints.filter(
    (c) => (c.status || '').toUpperCase() === 'PENDING' || (!(c.status || '').toUpperCase().includes('RESOLV') && !(c.status || '').toUpperCase().includes('PROGRESS'))
  ).length;
  const overallSolvedRate = totalFiled > 0 ? Math.round((totalSolved / totalFiled) * 100) : 0;

  // Best performing ward
  const topWard = useMemo(() => {
    const activeWards = wardStats.filter((w) => w.total > 0);
    if (!activeWards.length) return null;
    return [...activeWards].sort((a, b) => b.solvedRate - a.solvedRate || b.solved - a.solved)[0];
  }, [wardStats]);

  // Category breakdown for graphical representation
  const categoryStats = useMemo(() => {
    const catMap = new Map<string, { total: number; solved: number; inProgress: number; pending: number }>();

    filteredComplaints.forEach((c) => {
      const cat = c.category || 'OTHER';
      const existing = catMap.get(cat) || { total: 0, solved: 0, inProgress: 0, pending: 0 };
      existing.total += 1;
      const st = (c.status || '').toUpperCase();
      if (st === 'RESOLVED') {
        existing.solved += 1;
      } else if (st === 'IN_PROGRESS') {
        existing.inProgress += 1;
      } else {
        existing.pending += 1;
      }
      catMap.set(cat, existing);
    });

    return Array.from(catMap.entries())
      .map(([category, stats]) => ({
        category,
        total: stats.total,
        solved: stats.solved,
        unsolved: stats.inProgress + stats.pending,
        solvedRate: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredComplaints]);

  // Pie chart data for status distribution
  const statusPieData = useMemo(() => {
    return [
      { name: 'Solved / Resolved', value: totalSolved, color: STATUS_COLORS.solved },
      { name: 'In Progress', value: totalInProgress, color: STATUS_COLORS.inProgress },
      { name: 'Pending Action', value: totalPending, color: STATUS_COLORS.pending },
    ].filter((item) => item.value > 0);
  }, [totalSolved, totalInProgress, totalPending]);

  // Export report as real CSV file
  const handleExportCSV = () => {
    const headers = ['Ward Name', 'Assigned Councillor', 'Total Complaints', 'Solved (Resolved)', 'In Progress', 'Pending Action', 'Resolution Rate (%)', 'Audit Rating'];
    const rows = wardStats.map((w) => [
      `"${w.wardName}"`,
      `"${w.councillorName}"`,
      w.total,
      w.solved,
      w.inProgress,
      w.pending,
      `${w.solvedRate}%`,
      `"${w.rating}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SGCS_Municipal_Ward_Resolution_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Generating Municipal Performance Reports & Ward Analytics..." />;
  }

  return (
    <Box sx={{ pb: 8, maxWidth: 1240, mx: 'auto' }}>
      <AdminPageHeader
        title="Municipal Performance & Ward Reports"
        description="Comprehensive graphical representations and resolution audits across all city municipal wards."
        actionLabel="Print / Export Report"
        actionIcon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
        onActionClick={handlePrintReport}
        secondaryAction={
          <Button
            variant="outlined"
            startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={handleExportCSV}
            sx={{
              borderColor: '#E5E8E4',
              color: '#202522',
              textTransform: 'none',
              fontSize: '0.875rem',
              borderRadius: '8px',
              fontWeight: 600,
              '&:hover': { borderColor: '#496A57', backgroundColor: '#F8F9F7' },
            }}
          >
            Export CSV
          </Button>
        }
      />

      {/* Ward Filter Toolbar */}
      <Card
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: '12px',
          border: '1px solid #E5E8E4',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FilterListOutlinedIcon sx={{ color: '#1F4D3A', fontSize: 24 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C2A24' }}>
                Ward Analytics Scope
              </Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>
                Filter graphical metrics across all wards or inspect a single municipal division
              </Typography>
            </Box>
          </Box>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="ward-filter-label" sx={{ fontSize: '0.85rem' }}>Select Municipal Ward</InputLabel>
            <Select
              labelId="ward-filter-label"
              id="ward-filter-select"
              value={selectedWard}
              label="Select Municipal Ward"
              onChange={(e) => setSelectedWard(e.target.value)}
              sx={{ borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <MenuItem value="ALL" sx={{ fontWeight: 700 }}>
                🌐 All Wards (City-wide Aggregation)
              </MenuItem>
              {wardStats.map((w) => (
                <MenuItem key={w.wardId} value={w.wardName}>
                  {w.wardName} ({w.solved}/{w.total} solved)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Executive KPI Performance Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '10px', border: '1px solid #E5E8E4', boxShadow: 'none', backgroundColor: '#FFFFFF' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#68706B', letterSpacing: '0.04em' }}>
                TOTAL GRIEVANCES
              </Typography>
              <AccountBalanceOutlinedIcon sx={{ color: '#1F4D3A', fontSize: 22 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1C2A24', mb: 0.5 }}>
              {totalFiled}
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B' }}>
              {selectedWard === 'ALL' ? `Across ${wardStats.length} Municipal Wards` : `In ${selectedWard}`}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '10px', border: '1px solid #C8E6C9', boxShadow: 'none', backgroundColor: '#F9FDF9' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#2E7D32', letterSpacing: '0.04em' }}>
                SOLVED GRIEVANCES
              </Typography>
              <CheckCircleOutlinedIcon sx={{ color: '#2E7D32', fontSize: 22 }} />
            </Box>
            <Box display="flex" alignItems="baseline" gap={1} mb={0.5}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                {totalSolved}
              </Typography>
              <Chip
                label={`${overallSolvedRate}% Solved`}
                size="small"
                sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, height: 22, fontSize: '0.75rem' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#558B2F' }}>
              Successfully verified & closed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '10px', border: '1px solid #FFE0B2', boxShadow: 'none', backgroundColor: '#FFFDF9' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#E65100', letterSpacing: '0.04em' }}>
                PENDING / ACTIVE
              </Typography>
              <ReportProblemOutlinedIcon sx={{ color: '#E65100', fontSize: 22 }} />
            </Box>
            <Box display="flex" alignItems="baseline" gap={1} mb={0.5}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#E65100' }}>
                {totalPending}
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', fontWeight: 600 }}>
                +{totalInProgress} In Progress
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#BF360C' }}>
              Awaiting worker dispatch & proof
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '10px', border: '1px solid #E5E8E4', boxShadow: 'none', backgroundColor: '#FFFFFF' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#68706B', letterSpacing: '0.04em' }}>
                TOP PERFORMING WARD
              </Typography>
              <TrendingUpOutlinedIcon sx={{ color: '#2E7D32', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F4D3A', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topWard ? topWard.wardName : 'All Balanced'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 700 }}>
              {topWard ? `${topWard.solvedRate}% Solved (${topWard.solved}/${topWard.total})` : 'Awaiting grievance logs'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Primary Graphical Representation: Ward-by-Ward Complaints Breakdown */}
      <Card sx={{ mb: 4, p: 3, borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5} mb={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C2A24' }}>
              Ward-by-Ward Complaints & Resolution Breakdown
            </Typography>
            <Typography variant="body2" sx={{ color: '#68706B' }}>
              Visual comparison showing complaints solved vs in-progress vs pending across each municipal ward.
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={0.8}>
              <Box sx={{ width: 12, height: 12, backgroundColor: STATUS_COLORS.solved, borderRadius: '3px' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#2E7D32' }}>Solved</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.8}>
              <Box sx={{ width: 12, height: 12, backgroundColor: STATUS_COLORS.inProgress, borderRadius: '3px' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F4D3A' }}>In Progress</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.8}>
              <Box sx={{ width: 12, height: 12, backgroundColor: STATUS_COLORS.pending, borderRadius: '3px' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#E65100' }}>Pending</Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mb: 3, borderColor: '#F0F2EE' }} />

        <Box sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wardStats}
              margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFE9" />
              <XAxis
                dataKey="wardName"
                tick={{ fill: '#404D46', fontSize: 12, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#D6E0D9' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#68706B', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#D6E0D9' }}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WardStat;
                    return (
                      <Paper sx={{ p: 2, borderRadius: '8px', border: '1px solid #D6E0D9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1C2A24', mb: 1 }}>
                          {label}
                        </Typography>
                        <Stack spacing={0.6}>
                          <Box display="flex" justifyContent="space-between" gap={3}>
                            <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 700 }}>● Solved:</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{data.solved}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" gap={3}>
                            <Typography variant="caption" sx={{ color: '#1F4D3A', fontWeight: 700 }}>● In Progress:</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{data.inProgress}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" gap={3}>
                            <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 700 }}>● Pending:</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{data.pending}</Typography>
                          </Box>
                          <Divider sx={{ my: 0.5 }} />
                          <Box display="flex" justifyContent="space-between" gap={3}>
                            <Typography variant="caption" sx={{ color: '#1C2A24', fontWeight: 800 }}>Total Complaints:</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800 }}>{data.total}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" gap={3}>
                            <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 800 }}>Resolution Efficiency:</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#2E7D32' }}>{data.solvedRate}%</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="solved" name="Solved (Resolved)" fill={STATUS_COLORS.solved} radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="inProgress" name="In Progress" fill={STATUS_COLORS.inProgress} radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="pending" name="Pending" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      {/* Two Column Section: Ward Resolution Rate (%) and Status Distribution Donut */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Ward Resolution Rate Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%', borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C2A24', mb: 0.5 }}>
              Ward Resolution Efficiency Rate (% Solved)
            </Typography>
            <Typography variant="body2" sx={{ color: '#68706B', mb: 2 }}>
              Percentage of grievances successfully fixed and verified per municipal ward division.
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#F0F2EE' }} />

            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={wardStats}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EBEFE9" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: '#68706B', fontSize: 12 }}
                    axisLine={{ stroke: '#D6E0D9' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="wardName"
                    tick={{ fill: '#404D46', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#D6E0D9' }}
                    width={90}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val}% Solved`, 'Resolution Efficiency']}
                  />
                  <Bar
                    dataKey="solvedRate"
                    fill="#2E7D32"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    {wardStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.solvedRate >= 80 ? '#2E7D32' : entry.solvedRate >= 50 ? '#1F4D3A' : '#E65100'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* City-wide Status Distribution Donut */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%', borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C2A24', mb: 0.5 }}>
              Resolution Status Distribution
            </Typography>
            <Typography variant="body2" sx={{ color: '#68706B', mb: 2 }}>
              Breakdown of grievance resolution lifecycle {selectedWard === 'ALL' ? 'city-wide' : `in ${selectedWard}`}.
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#F0F2EE' }} />

            <Box sx={{ width: '100%', height: 220, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1F4D3A', lineHeight: 1 }}>
                  {overallSolvedRate}%
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#68706B', fontSize: '0.65rem' }}>
                  SOLVED
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1} sx={{ mt: 2 }}>
              {statusPieData.map((item) => (
                <Box key={item.name} display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                    <Typography variant="body2" sx={{ color: '#1C2A24', fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1C2A24' }}>
                    {item.value} ({totalFiled > 0 ? Math.round((item.value / totalFiled) * 100) : 0}%)
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Category Breakdown Graphical Representation */}
      <Card sx={{ mb: 4, p: 3, borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C2A24', mb: 0.5 }}>
          Complaints Solved vs Open by Civic Category
        </Typography>
        <Typography variant="body2" sx={{ color: '#68706B', mb: 2 }}>
          Resolution performance grouped by issue type (Roads, Water Supply, Waste Management, Electricity, etc.)
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#F0F2EE' }} />

        {categoryStats.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">No category complaint records available in this scope.</Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryStats}
                margin={{ top: 15, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFE9" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#404D46', fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#D6E0D9' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#68706B', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#D6E0D9' }}
                />
                <RechartsTooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="solved" name="Solved (Resolved)" fill={STATUS_COLORS.solved} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="unsolved" name="Active (Pending / In Progress)" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Card>

      {/* Comprehensive Ward Performance Audit Table */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E5E8E4', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, backgroundColor: '#FAFBFA', borderBottom: '1px solid #E5E8E4' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1C2A24' }}>
            Municipal Ward Resolution Performance Matrix
          </Typography>
          <Typography variant="caption" sx={{ color: '#68706B' }}>
            Audited statistics for all municipal wards, grievance turnover, and councillor leadership
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F4F6F4' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#404D46', py: 1.5 }}>Municipal Ward</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#404D46', py: 1.5 }}>Assigned Councillor</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#404D46', py: 1.5 }}>Total Filed</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#2E7D32', py: 1.5 }}>Solved</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#1F4D3A', py: 1.5 }}>In Progress</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#E65100', py: 1.5 }}>Pending</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#404D46', py: 1.5, minWidth: 160 }}>Resolution Efficiency</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#404D46', py: 1.5 }}>Audit SLA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wardStats.map((row) => (
                <TableRow
                  key={row.wardId}
                  hover
                  sx={{
                    backgroundColor: selectedWard === row.wardName ? '#F3F8F5' : 'inherit',
                    '&:hover': { backgroundColor: '#F8FBF9' },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#1C2A24' }}>
                    {row.wardName}
                  </TableCell>
                  <TableCell sx={{ color: '#404D46', fontWeight: 500 }}>
                    {row.councillorName}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {row.total}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                    {row.solved}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#1F4D3A' }}>
                    {row.inProgress}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#E65100' }}>
                    {row.pending}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={row.solvedRate}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#EBEFE9',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: row.solvedRate >= 80 ? '#2E7D32' : row.solvedRate >= 50 ? '#1F4D3A' : '#E65100',
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, minWidth: 35, color: '#1C2A24' }}>
                        {row.solvedRate}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.rating}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        backgroundColor:
                          row.solvedRate >= 80 ? '#E8F5E9' : row.solvedRate >= 50 ? '#E8F0EC' : '#FFF3E0',
                        color:
                          row.solvedRate >= 80 ? '#2E7D32' : row.solvedRate >= 50 ? '#1F4D3A' : '#E65100',
                        border: '1px solid',
                        borderColor:
                          row.solvedRate >= 80 ? '#C8E6C9' : row.solvedRate >= 50 ? '#C2D9CD' : '#FFE0B2',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default SystemReports;
