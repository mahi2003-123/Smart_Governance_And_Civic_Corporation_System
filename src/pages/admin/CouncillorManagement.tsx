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
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { adminService } from '../../services/adminService';
import { User, Ward } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';
import { CustomTextField } from '../../components/common/CustomTextField';

export const CouncillorManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [councillors, setCouncillors] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
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
      setAllUsers(uData);
      setCouncillors(uData.filter((u) => u.role === 'COUNCILLOR'));
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
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      setCouncillors((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update councillor status.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete councillor "${user.fullName}" (${user.email}) from the database?`)) {
      return;
    }
    try {
      await adminService.deleteUser(user.id);
      setCouncillors((prev) => prev.filter((u) => u.id !== user.id));
      setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete councillor from database.');
    }
  };

  const handleCreateCouncillor = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = (formData.email || '').trim().toLowerCase();
    const cleanName = (formData.fullName || '').trim();

    if (!cleanName) {
      setModalError('Please enter councillor full name.');
      return;
    }

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setModalError('Please enter a valid email address (e.g. councillor@sgcs.gov.in).');
      return;
    }

    // Check duplicate email
    const existingUser = allUsers.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (existingUser) {
      setModalError(`Email address "${cleanEmail}" is already registered in the system (${existingUser.fullName} - ${existingUser.role}). Duplicate email addresses are not allowed.`);
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

    // Check 1 Councillor per ward constraint
    const targetWardNum = formData.ward.split('-')[0].trim().toLowerCase();
    const existing = allUsers.find(
      (u) =>
        u.role === 'COUNCILLOR' &&
        u.ward &&
        (u.ward.toLowerCase() === formData.ward.toLowerCase() ||
         u.ward.toLowerCase().includes(targetWardNum))
    );

    if (existing) {
      setModalError(
        `Ward "${formData.ward}" already has an assigned Councillor (${existing.fullName} - ${existing.email}). Only 1 Councillor is permitted per municipal ward.`
      );
      return;
    }

    setModalLoading(true);
    try {
      const created = await adminService.createUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: 'COUNCILLOR',
        ward: formData.ward,
      });

      setModalSuccess(`Successfully assigned Councillor "${created.fullName}" to ${formData.ward}!`);
      setCouncillors([created, ...councillors]);
      setAllUsers([created, ...allUsers]);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        ward: wards.length > 0 ? `Ward ${wards[0].wardNumber} - ${wards[0].name}` : 'Ward 1 - Central Town',
      });

      setTimeout(() => setOpenModal(false), 1200);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create councillor record.');
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = councillors.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.ward && c.ward.toLowerCase().includes(search.toLowerCase()));

    const matchesWard = wardFilter === 'ALL' || (c.ward && c.ward.includes(wardFilter));
    const matchesStatus = statusFilter === 'ALL' || (c.status || 'ACTIVE') === statusFilter;

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

  if (loading) return <LoadingSpinner message="Loading Councillor Records..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="Councillors"
        description="Manage municipal ward councillors and ward assignments."
        actionLabel="Add Councillor"
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
        searchPlaceholder="Search councillors by name, email or ward..."
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
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Assigned Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No councillors found matching filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const isActive = (c.status || 'ACTIVE') === 'ACTIVE';

                const actionItems: ActionMenuItem[] = [
                  {
                    label: 'View Profile',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Councillor Details: ${c.fullName}`),
                  },
                  {
                    label: 'Reassign Ward',
                    icon: <SwapHorizOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Reassign Ward for ${c.fullName}`),
                  },
                  {
                    label: 'Edit Details',
                    icon: <EditOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Edit Councillor ${c.fullName}`),
                  },
                  {
                    label: isActive ? 'Deactivate' : 'Activate',
                    icon: isActive ? <BlockOutlinedIcon fontSize="small" /> : <CheckCircleOutlinedIcon fontSize="small" />,
                    color: isActive ? 'error' : 'primary',
                    onClick: () => handleToggleStatus(c),
                  },
                ];

                return (
                  <TableRow key={c.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {c.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {c.phone || 'No phone'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>{c.email}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#496A57' }}>
                      {c.ward || 'Unassigned'}
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
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {c.createdAt ? c.createdAt.split('T')[0] : '2026-01-15'}
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

      {/* Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '8px', p: 1 } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
            Register Ward Councillor
          </Typography>
          <IconButton size="small" onClick={() => setOpenModal(false)}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateCouncillor}>
          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            {modalError && <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>{modalError}</Alert>}
            {modalSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '6px' }}>{modalSuccess}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel id="councillor-ward-label">Assigned Ward Jurisdiction</InputLabel>
                  <Select
                    labelId="councillor-ward-label"
                    value={formData.ward}
                    label="Assigned Ward Jurisdiction"
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
                  label="Councillor Full Name"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Official Email"
                  type="email"
                  placeholder="councillor@sgcs.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Mobile Phone"
                  placeholder="+91 98765 11001"
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
              {modalLoading ? 'Registering...' : 'Assign Councillor'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CouncillorManagement;
