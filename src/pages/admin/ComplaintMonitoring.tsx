import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { complaintService } from '../../services/complaintService';
import { adminService } from '../../services/adminService';
import { Complaint, Ward } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';

export const ComplaintMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cData, wData] = await Promise.all([
          complaintService.getComplaints(),
          adminService.getWards(),
        ]);
        setComplaints(cData);
        setWards(wData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(search.toLowerCase());

    const matchesWard = wardFilter === 'ALL' || (c.ward && c.ward.includes(wardFilter));
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesWard && matchesCategory && matchesStatus;
  });

  const filterOptions: FilterOption[] = [
    {
      id: 'ward',
      label: 'Ward',
      value: wardFilter,
      options: [
        { label: 'All Wards', value: 'ALL' },
        ...wards.map((w) => ({ label: `Ward ${w.wardNumber}`, value: `Ward ${w.wardNumber}` })),
      ],
      onChange: setWardFilter,
    },
    {
      id: 'category',
      label: 'Category',
      value: categoryFilter,
      options: [
        { label: 'All Categories', value: 'ALL' },
        { label: 'Roads & Potholes', value: 'Roads & Potholes' },
        { label: 'Street Lighting', value: 'Street Lighting' },
        { label: 'Water Supply', value: 'Water Supply' },
        { label: 'Waste Management', value: 'Waste Management' },
        { label: 'Sewage & Drainage', value: 'Sewage & Drainage' },
      ],
      onChange: setCategoryFilter,
    },
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      options: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Resolved', value: 'RESOLVED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
      onChange: setStatusFilter,
    },
  ];

  if (loading) return <LoadingSpinner message="Loading Complaint Monitoring System..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="Complaint Monitoring"
        description="System-wide monitoring of municipal grievances and resolution status."
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by tracking #, title or resident name..."
        filters={filterOptions}
      />

      <TableContainer
        sx={{
          border: '1px solid #E5E8E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#F8F9F7' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Reference #</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Complaint Title & Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Ward</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Citizen</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Submitted</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No complaints match the search and filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const actionItems: ActionMenuItem[] = [
                  {
                    label: 'View Complaint Details',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => setSelectedComplaint(c),
                  },
                  {
                    label: 'View Citizen Record',
                    icon: <PersonOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Citizen: ${c.citizenName} (${c.citizenPhone})`),
                  },
                  {
                    label: 'View Assigned Worker',
                    icon: <BadgeOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Assigned Worker: ${c.assignedWorkerName || 'None'}`),
                  },
                ];

                return (
                  <TableRow key={c.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.825rem' }}>
                      {c.trackingNumber}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {c.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {c.category}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {c.ward.split(' - ')[0]}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#202522' }}>
                      {c.citizenName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.priority}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.675rem',
                          backgroundColor:
                            c.priority === 'HIGH' || c.priority === 'URGENT'
                              ? '#FDE8E8'
                              : c.priority === 'MEDIUM'
                              ? '#FBF4E8'
                              : '#F3F5F2',
                          color:
                            c.priority === 'HIGH' || c.priority === 'URGENT'
                              ? '#B45D59'
                              : c.priority === 'MEDIUM'
                              ? '#B58A45'
                              : '#68706B',
                          borderRadius: '4px',
                          height: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          backgroundColor:
                            c.status === 'RESOLVED'
                              ? '#E8EFE9'
                              : c.status === 'IN_PROGRESS'
                              ? '#EAF3FA'
                              : c.status === 'PENDING'
                              ? '#FBF4E8'
                              : '#FDE8E8',
                          color:
                            c.status === 'RESOLVED'
                              ? '#304B3A'
                              : c.status === 'IN_PROGRESS'
                              ? '#2B579A'
                              : c.status === 'PENDING'
                              ? '#B58A45'
                              : '#B45D59',
                          borderRadius: '4px',
                          height: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {c.createdAt ? c.createdAt.split('T')[0] : '2026-08-20'}
                    </TableCell>
                    <TableCell align="right">
                      <ActionMenu items={actionItems} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Complaint Detail Dialog */}
      {selectedComplaint && (
        <Dialog
          open={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
                Complaint #{selectedComplaint.trackingNumber}
              </Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>
                {selectedComplaint.ward} — {selectedComplaint.category}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setSelectedComplaint(null)}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                {selectedComplaint.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4A524D', lineHeight: 1.6 }}>
                {selectedComplaint.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: '#E5E8E4' }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Citizen Contact
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                  {selectedComplaint.citizenName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#68706B' }}>
                  {selectedComplaint.citizenPhone}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Assigned Worker
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                  {selectedComplaint.assignedWorkerName || 'Unassigned'}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Status
                </Typography>
                <Chip
                  label={selectedComplaint.status.replace('_', ' ')}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    backgroundColor: '#E8EFE9',
                    color: '#304B3A',
                    mt: 0.5,
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>
                  Location Address
                </Typography>
                <Typography variant="body2" sx={{ color: '#202522' }}>
                  {selectedComplaint.locationAddress || selectedComplaint.ward}
                </Typography>
              </Grid>
            </Grid>

            {selectedComplaint.timeline && selectedComplaint.timeline.length > 0 && (
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, mb: 1, display: 'block' }}>
                  RESOLUTION AUDIT TIMELINE
                </Typography>
                <Stack spacing={1.5} sx={{ pl: 2, borderLeft: '1px solid #E5E8E4' }}>
                  {selectedComplaint.timeline.map((item) => (
                    <Box key={item.id}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {item.title} — <span style={{ color: '#68706B', fontWeight: 400 }}>{item.timestamp}</span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        By {item.actorName} ({item.actorRole})
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedComplaint(null)} sx={{ color: '#68706B', textTransform: 'none' }}>
              Close Window
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ComplaintMonitoring;
