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
import { adminService } from '../../services/adminService';
import { User, UserRole, Ward } from '../../types';
import { ROLE_LABELS } from '../../utils/constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';
import { CustomTextField } from '../../components/common/CustomTextField';

export const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'COUNCILLOR' as UserRole,
    ward: 'Ward 1 - Central Town',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uData, wData] = await Promise.all([
        adminService.getUsers(),
        adminService.getWards(),
      ]);
      setUsers(uData);
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
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setModalError('Please enter full name, email address, and initial password.');
      return;
    }

    if (formData.role === 'COUNCILLOR' && formData.ward && formData.ward !== 'All Wards') {
      const existingCouncillor = users.find(
        (u) => u.role === 'COUNCILLOR' && u.ward?.toLowerCase() === formData.ward.toLowerCase()
      );
      if (existingCouncillor) {
        setModalError(
          `Ward "${formData.ward}" already has an assigned Councillor (${existingCouncillor.fullName} - ${existingCouncillor.email}). Only 1 Councillor permitted per ward.`
        );
        return;
      }
    }

    setModalLoading(true);
    try {
      const created = await adminService.createUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        ward: formData.ward,
      });

      setModalSuccess(`Successfully created ${ROLE_LABELS[formData.role]} "${created.fullName}"!`);
      setUsers([created, ...users]);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'COUNCILLOR',
        ward: wards.length > 0 ? `Ward ${wards[0].wardNumber} - ${wards[0].name}` : 'Ward 1 - Central Town',
      });

      setTimeout(() => {
        setOpenModal(false);
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create user record.');
    } finally {
      setModalLoading(false);
    }
  };

  // Filter application
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (u.status || 'ACTIVE') === statusFilter;
    const matchesWard = wardFilter === 'ALL' || (u.ward && u.ward.includes(wardFilter));

    return matchesSearch && matchesRole && matchesStatus && matchesWard;
  });

  const filterOptions: FilterOption[] = [
    {
      id: 'role',
      label: 'Role',
      value: roleFilter,
      options: [
        { label: 'All Roles', value: 'ALL' },
        { label: 'Citizen', value: 'CITIZEN' },
        { label: 'Councillor', value: 'COUNCILLOR' },
        { label: 'Local Worker', value: 'WORKER' },
        { label: 'Super Admin', value: 'ADMIN' },
      ],
      onChange: setRoleFilter,
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
  ];

  if (loading) return <LoadingSpinner message="Loading User Directory..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="Users"
        description="Manage citizens, councillors and workers across the system."
        actionLabel="Add User"
        actionIcon={<AddOutlinedIcon sx={{ fontSize: 18 }} />}
        onActionClick={() => {
          setModalError('');
          setModalSuccess('');
          setOpenModal(true);
        }}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name, email or phone..."
        filters={filterOptions}
      />

      {/* Standardized Data Table */}
      <TableContainer
        sx={{
          border: '1px solid #E5E8E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <Table size="medium">
          <TableHead sx={{ backgroundColor: '#F8F9F7' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Ward</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Created Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No users found matching your search and filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isActive = (user.status || 'ACTIVE') === 'ACTIVE';

                const actionItems: ActionMenuItem[] = [
                  {
                    label: 'View Profile',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`User details: ${user.fullName} (${user.email})`),
                  },
                  {
                    label: 'Edit Details',
                    icon: <EditOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Edit ${user.fullName}`),
                  },
                  {
                    label: isActive ? 'Deactivate User' : 'Activate User',
                    icon: isActive ? <BlockOutlinedIcon fontSize="small" /> : <CheckCircleOutlinedIcon fontSize="small" />,
                    color: isActive ? 'error' : 'primary',
                    onClick: () => handleToggleStatus(user),
                  },
                ];

                return (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:hover': { backgroundColor: '#F8F9F7' },
                      borderBottom: '1px solid #E5E8E4',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {user.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {user.phone || 'No phone'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={ROLE_LABELS[user.role] || user.role}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.725rem',
                          backgroundColor:
                            user.role === 'ADMIN'
                              ? '#FDE8E8'
                              : user.role === 'COUNCILLOR'
                              ? '#E8EFE9'
                              : user.role === 'WORKER'
                              ? '#FBF4E8'
                              : '#F3F5F2',
                          color:
                            user.role === 'ADMIN'
                              ? '#B45D59'
                              : user.role === 'COUNCILLOR'
                              ? '#304B3A'
                              : user.role === 'WORKER'
                              ? '#B58A45'
                              : '#68706B',
                          borderRadius: '4px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {user.ward ? user.ward.split(' - ')[0] : 'System Wide'}
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
                      {user.createdAt ? user.createdAt.split('T')[0] : '2026-01-10'}
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

      {/* Add User Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
            Add New User Account
          </Typography>
          <IconButton size="small" onClick={() => setOpenModal(false)}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            {modalError && <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>{modalError}</Alert>}
            {modalSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '6px' }}>{modalSuccess}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="role-select-label">Account Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    value={formData.role}
                    label="Account Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <MenuItem value="COUNCILLOR">Ward Councillor</MenuItem>
                    <MenuItem value="WORKER">Local Field Worker / Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="ward-select-label">Ward Jurisdiction</InputLabel>
                  <Select
                    labelId="ward-select-label"
                    value={formData.ward}
                    label="Ward Jurisdiction"
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  >
                    {wards.map((w) => (
                      <MenuItem key={w.id} value={`Ward ${w.wardNumber} - ${w.name}`}>
                        Ward {w.wardNumber} - {w.name}
                      </MenuItem>
                    ))}
                    <MenuItem value="System Wide">System Wide</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Full Name"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Account Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Phone Number"
                  placeholder="+91 98765 43210"
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
              {modalLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
