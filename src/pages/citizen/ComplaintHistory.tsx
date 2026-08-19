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
  TableRow,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EyeIcon from '../../components/common/Icons';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AddTaskIcon from '@mui/icons-material/AddTask';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ComplaintHistory: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const loadComplaints = async () => {
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
    loadComplaints();
  }, []);

  const filteredComplaints = complaints
    .filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.ward.toLowerCase().includes(q) ||
        c.locationAddress.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && (c.status === 'PENDING' || c.status === 'SUBMITTED')) ||
        (statusFilter === 'IN_PROGRESS' && c.status === 'IN_PROGRESS') ||
        (statusFilter === 'RESOLVED' && c.status === 'RESOLVED');

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'NEWEST' ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <LoadingSpinner message="Loading your complaints..." />;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
            My Complaints
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            View and track all civic complaints submitted by you in your ward.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddTaskIcon />}
          onClick={() => navigate('/citizen/complaints/submit')}
          sx={{
            borderRadius: '20px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontWeight: 700,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': { backgroundColor: '#1D4ED8' },
          }}
        >
          Report a Civic Issue
        </Button>
      </Box>

      {/* Tabs Filter & Search Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '20px', border: '1px solid #E2E8F0' }}>
        <Box sx={{ borderBottom: '1px solid #E2E8F0', mb: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, val) => setStatusFilter(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.9rem',
                minWidth: 100,
              },
            }}
          >
            <Tab label={`All (${complaints.length})`} value="ALL" />
            <Tab
              label={`Pending (${complaints.filter((c) => c.status === 'PENDING' || c.status === 'SUBMITTED').length})`}
              value="PENDING"
            />
            <Tab
              label={`In Progress (${complaints.filter((c) => c.status === 'IN_PROGRESS').length})`}
              value="IN_PROGRESS"
            />
            <Tab
              label={`Resolved (${complaints.filter((c) => c.status === 'RESOLVED').length})`}
              value="RESOLVED"
            />
          </Tabs>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Complaint ID, Title, Ward, or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={textFieldStyles}
          />

          <TextField
            select
            fullWidth
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon sx={{ color: '#64748B', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={textFieldStyles}
          >
            <MenuItem value="NEWEST">Date: Newest First</MenuItem>
            <MenuItem value="OLDEST">Date: Oldest First</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Complaints Table */}
      <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={headerCellStyles}>Complaint ID</TableCell>
                <TableCell sx={headerCellStyles}>Title & Description</TableCell>
                <TableCell sx={headerCellStyles}>Category</TableCell>
                <TableCell sx={headerCellStyles}>Ward</TableCell>
                <TableCell sx={headerCellStyles}>Submitted Date</TableCell>
                <TableCell sx={headerCellStyles}>Status</TableCell>
                <TableCell align="right" sx={headerCellStyles}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                    No complaints found matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    onClick={() => navigate(`/citizen/complaints/${c.id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.85rem' }}>
                      {c.trackingNumber}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.2 }}>
                        {c.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748B',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {c.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>{c.category}</TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>{c.ward}</TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/citizen/complaints/${c.id}`);
                          }}
                          sx={{
                            color: '#2563EB',
                            backgroundColor: '#EFF6FF',
                            '&:hover': { backgroundColor: '#DBEAFE' },
                          }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

const headerCellStyles = {
  fontWeight: 700,
  color: '#475569',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '1px solid #E2E8F0',
};

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9rem',
    '& fieldset': {
      borderColor: '#E2E8F0',
    },
    '&:hover fieldset': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
      borderWidth: '1.5px',
    },
  },
};

export default ComplaintHistory;
