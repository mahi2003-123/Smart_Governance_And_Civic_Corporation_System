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
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';
import { CustomTextField } from '../../components/common/CustomTextField';

export const WORKER_SPECIALIZATIONS = [
  'Public Works Dept',
  'Water & Drainage Dept',
  'Electrical Maintenance',
  'Sanitation & Waste Management',
  'Roads & Civil Infrastructure',
  'Public Lighting & Power',
  'Parks & Environment',
];

export const WorkerManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<User[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
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
    specialization: WORKER_SPECIALIZATIONS[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const uData = await adminService.getUsers();
      setWorkers(uData.filter((u) => u.role === 'WORKER'));
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
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      setWorkers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update worker status.');
    }
  };

  const handleDeleteWorker = async (user: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete technician "${user.fullName}" (${user.email}) from the database?`)) {
      return;
    }
    try {
      await adminService.deleteUser(user.id);
      setWorkers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete worker from database.');
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = (formData.email || '').trim().toLowerCase();
    const cleanName = (formData.fullName || '').trim();

    if (!cleanName) {
      setModalError('Please enter technician full name.');
      return;
    }

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setModalError('Please enter a valid email address (e.g. technician@sgcs.gov.in).');
      return;
    }

    // Check duplicate email
    const existingUser = workers.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (existingUser) {
      setModalError(`Email address "${cleanEmail}" is already registered in the system (${existingUser.fullName}). Duplicate email addresses are not allowed.`);
      return;
    }

    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/[\s\-\+]/g, '');
      const numberToCheck = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;
      if (!/^[6-9]\d{9}$/.test(numberToCheck)) {
        setModalError('Phone number must be a 10-digit mobile number starting with 6, 7, 8, or 9.');
        return;
      }
    }

    setModalLoading(true);
    try {
      const created = await adminService.createUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: 'WORKER',
        ward: formData.specialization, // Specialization area stored in ward column
      });

      setModalSuccess(`Successfully registered Technician "${created.fullName}" (${formData.specialization})!`);
      setWorkers([{ ...created, assignedTasks: 0 }, ...workers]);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        specialization: WORKER_SPECIALIZATIONS[0],
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

    const matchesDept = deptFilter === 'ALL' || (w.ward && w.ward.toLowerCase() === deptFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (w.status || 'ACTIVE') === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const filterOptions: FilterOption[] = [
    {
      id: 'dept',
      label: 'Specialization',
      value: deptFilter,
      options: [
        { label: 'All Specializations', value: 'ALL' },
        ...WORKER_SPECIALIZATIONS.map((spec) => ({ label: spec, value: spec })),
      ],
      onChange: setDeptFilter,
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
        title="Field Technicians & Local Workers"
        description="Manage municipal maintenance staff, technicians, and specialized field workers."
        actionLabel="Add Technician"
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
        searchPlaceholder="Search workers by name, email or technician area..."
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
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Technician Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Area / Specialization</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Active Tasks</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No field technicians found matching filter criteria.
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
                    label: 'Edit Details',
                    icon: <EditOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Edit Worker ${w.fullName}`),
                  },
                  {
                    label: isActive ? 'Deactivate' : 'Activate',
                    icon: isActive ? <BlockOutlinedIcon fontSize="small" /> : <CheckCircleOutlinedIcon fontSize="small" />,
                    color: isActive ? 'warning' : 'primary',
                    onClick: () => handleToggleStatus(w),
                  },
                  {
                    label: 'Delete Worker',
                    icon: <DeleteOutlinedIcon fontSize="small" />,
                    color: 'error',
                    onClick: () => handleDeleteWorker(w),
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
                    <TableCell sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#304B3A' }}>
                      {w.ward || 'General Maintenance'}
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
        slotProps={{ paper: { sx: { borderRadius: '8px', p: 1 } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
            Register Field Technician
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
                <CustomTextField
                  select
                  label="Technician Specialization / Area"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  fullWidth
                >
                  {WORKER_SPECIALIZATIONS.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Technician Full Name"
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
                  placeholder="technician@sgcs.gov.in"
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
              {modalLoading ? 'Registering...' : 'Register Technician'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default WorkerManagement;
