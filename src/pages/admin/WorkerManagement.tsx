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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { adminService } from '../../services/adminService';
import { User, Ward } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';
import { CustomTextField } from '../../components/common/CustomTextField';

export const WorkerManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<User[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ward: 'Ward 1 - Central Town',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uData, wData] = await Promise.all([
        adminService.getUsers(),
        adminService.getWards(),
      ]);
      setWorkers(uData.filter((u) => u.role === 'WORKER'));
      setWards(wData);
      if (wData.length > 0) {
        setFormData((prev) => ({ ...prev, ward: `Ward ${wData[0].wardNumber} - ${wData[0].name}` }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    await adminService.updateUserStatus(user.id, nextStatus);
    setWorkers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!formData.fullName || !formData.email) {
      setModalError('Please fill in name and email address.');
      return;
    }

    setModalLoading(true);
    try {
      const created = await adminService.createUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: 'WORKER',
        ward: formData.ward,
      });

      setModalSuccess(`Successfully registered Local Worker "${created.fullName}"!`);
      setWorkers([{ ...created, assignedTasks: 0 }, ...workers]);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        ward: wards.length > 0 ? `Ward ${wards[0].wardNumber} - ${wards[0].name}` : 'Ward 1 - Central Town',
      });

      setTimeout(() => setOpenModal(false), 1200);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create worker record.');
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = workers.filter((w) => {
    const matchesSearch =
      w.fullName.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase()) ||
      (w.ward && w.ward.toLowerCase().includes(search.toLowerCase()));

    const matchesWard = wardFilter === 'ALL' || (w.ward && w.ward.includes(wardFilter));
    const matchesStatus = statusFilter === 'ALL' || (w.status || 'ACTIVE') === statusFilter;

    return matchesSearch && matchesWard && matchesStatus;
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
      id: 'status',
      label: 'Status',
      value: statusFilter,
      options: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
      ],
      onChange: setStatusFilter,
    },
  ];

  if (loading) return <LoadingSpinner message="Loading Local Worker Registry..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="Local Workers"
        description="Manage field maintenance workers and service tasks."
        actionLabel="Add Worker"
        actionIcon={<AddOutlinedIcon sx={{ fontSize: 18 }} />}
        onActionClick={() => {
          setModalError('');
          setModalSuccess('');
          setOpenModal(true);
        }}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search workers by name, email or ward..."
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
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Assigned Ward</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Active Tasks</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No field workers found matching filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((w) => {
                const isActive = (w.status || 'ACTIVE') === 'ACTIVE';

                const actionItems: ActionMenuItem[] = [
                  {
                    label: 'View Profile',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Worker Details: ${w.fullName}`),
                  },
                  {
                    label: 'Assign Ward',
                    icon: <SwapHorizOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Assign Ward for ${w.fullName}`),
                  },
                  {
                    label: 'Edit Details',
                    icon: <EditOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Edit Worker ${w.fullName}`),
                  },
                  {
                    label: isActive ? 'Deactivate' : 'Activate',
                    icon: isActive ? <BlockOutlinedIcon fontSize="small" /> : <CheckCircleOutlinedIcon fontSize="small" />,
                    color: isActive ? 'error' : 'primary',
                    onClick: () => handleToggleStatus(w),
                  },
                ];

                return (
                  <TableRow key={w.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {w.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {w.phone || 'No phone'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>{w.email}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {w.ward ? w.ward.split(' - ')[0] : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${w.assignedTasks || 0} tasks`}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          backgroundColor: '#F3F5F2',
                          color: '#202522',
                          borderRadius: '4px',
                          height: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          backgroundColor: isActive ? '#E8EFE9' : '#FDE8E8',
                          color: isActive ? '#304B3A' : '#B45D59',
                          borderRadius: '4px',
                          height: '20px',
                        }}
                      />
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

      {/* Add Worker Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
            Register Local Worker
          </Typography>
          <IconButton size="small" onClick={() => setOpenModal(false)}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateWorker}>
          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            {modalError && <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>{modalError}</Alert>}
            {modalSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '6px' }}>{modalSuccess}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel id="worker-ward-label">Assigned Ward</InputLabel>
                  <Select
                    labelId="worker-ward-label"
                    value={formData.ward}
                    label="Assigned Ward"
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  >
                    {wards.map((w) => (
                      <MenuItem key={w.id} value={`Ward ${w.wardNumber} - ${w.name}`}>
                        Ward {w.wardNumber} - {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Worker Full Name"
                  placeholder="e.g. Suresh Kumar"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Email Address"
                  type="email"
                  placeholder="worker@sgcs.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Mobile Phone"
                  placeholder="+91 98765 22001"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: '#68706B', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={modalLoading}
              sx={{
                backgroundColor: '#496A57',
                color: '#FFFFFF',
                textTransform: 'none',
                px: 3,
                '&:hover': { backgroundColor: '#304B3A' },
              }}
            >
              {modalLoading ? 'Registering...' : 'Register Worker'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default WorkerManagement;
