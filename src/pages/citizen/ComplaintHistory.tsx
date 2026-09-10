import React, { useState, useEffect } from 'react';
import {
  Box,
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
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ComplaintHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaints(user?.id ? { citizenId: user.id } : undefined);
      // Filter strictly to current citizen's own complaints
      const userOwnComplaints = data.filter(
        (c) =>
          !user?.id ||
          c.citizenId === user.id ||
          (user.fullName && c.citizenName === user.fullName) ||
          (user.email && c.citizenPhone === user.email)
      );
      setComplaints(userOwnComplaints);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user]);

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

  if (loading) return <LoadingSpinner message="Loading grievance records..." />;

  return (
    <Box sx={{ pb: 8, maxWidth: 1120, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1, letterSpacing: '-0.015em' }}>
            My Complaints History
          </Typography>
          <Typography variant="body1" sx={{ color: '#68706B' }}>
            Review and track the progress of all public grievances registered under your citizen account.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/citizen/complaints/submit')}
          sx={{
            py: 1,
            px: 2.5,
            borderRadius: '8px',
            backgroundColor: '#496A57',
            color: '#FFFFFF',
            fontWeight: 500,
            '&:hover': { backgroundColor: '#304B3A' },
          }}
        >
          Report New Issue
        </Button>
      </Box>

      {/* Tabs & Search Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
        <Box sx={{ borderBottom: '1px solid #E5E8E4', mb: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, val) => setStatusFilter(val)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.85rem',
                color: '#68706B',
                '&.Mui-selected': { color: '#496A57', fontWeight: 600 },
              },
              '& .MuiTabs-indicator': { backgroundColor: '#496A57' },
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
            placeholder="Search by ID, Title, Ward, or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: '#68706B', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
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
                    <FilterListIcon sx={{ color: '#68706B', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          >
            <MenuItem value="NEWEST">Date: Newest First</MenuItem>
            <MenuItem value="OLDEST">Date: Oldest First</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Clean White Table */}
      <Box sx={{ borderRadius: '8px', border: '1px solid #E5E8E4', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking ID</TableCell>
                <TableCell>Title & Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Ward</TableCell>
                <TableCell>Submitted Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#68706B' }}>
                    No complaint records found matching your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    onClick={() => navigate(`/citizen/complaints/${c.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#496A57', fontSize: '0.85rem' }}>
                      #{c.trackingNumber}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#202522', mb: 0.2, fontSize: '0.875rem' }}>
                        {c.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#68706B',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {c.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#68706B', fontSize: '0.85rem' }}>{c.category}</TableCell>
                    <TableCell sx={{ color: '#68706B', fontSize: '0.85rem' }}>{c.ward}</TableCell>
                    <TableCell sx={{ color: '#68706B', fontSize: '0.85rem' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Record">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/citizen/complaints/${c.id}`);
                          }}
                          sx={{
                            color: '#496A57',
                            backgroundColor: '#E8EFE9',
                            '&:hover': { backgroundColor: '#F3F5F2' },
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
      </Box>
    </Box>
  );
};

export default ComplaintHistory;
