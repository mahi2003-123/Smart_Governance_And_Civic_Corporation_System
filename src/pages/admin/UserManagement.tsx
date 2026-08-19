import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
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
  Tooltip,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { adminService } from '../../services/adminService';
import { User, UserRole, Ward } from '../../types';
import { ROLE_LABELS } from '../../utils/constants';
import { CustomTextField } from '../../components/common/CustomTextField';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [search, setSearch] = useState('');

  // Register Modal State
  const [openModal, setOpenModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'password123',
    phone: '',
    role: 'COUNCILLOR' as UserRole,
    ward: 'Ward 1 - Central Town'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uData, wData] = await Promise.all([
        adminService.getUsers(),
        adminService.getWards()
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

  const handleOpenModal = () => {
    setModalError('');
    setModalSuccess('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!formData.fullName || !formData.email) {
      setModalError('Please enter full name and email address.');
      return;
    }

    if (formData.role === 'COUNCILLOR' && formData.ward && formData.ward !== 'All Wards') {
      const existingCouncillor = users.find(
        (u) => u.role === 'COUNCILLOR' && u.ward?.toLowerCase() === formData.ward.toLowerCase()
      );
      if (existingCouncillor) {
        setModalError(
          `Ward "${formData.ward}" already has an assigned Councillor (${existingCouncillor.fullName} - ${existingCouncillor.email}). Only 1 Councillor is permitted per ward.`
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
        ward: formData.ward
      });

      setModalSuccess(`Successfully registered ${ROLE_LABELS[formData.role]} "${created.fullName}" in database!`);
      setUsers([created, ...users]);
      setFormData({
        fullName: '',
        email: '',
        password: 'password123',
        phone: '',
        role: 'COUNCILLOR',
        ward: wards.length > 0 ? `Ward ${wards[0].wardNumber} - ${wards[0].name}` : 'Ward 1 - Central Town'
      });

      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err: any) {
      setModalError(err.message || 'Failed to register user in PostgreSQL database.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading Municipal User Database..." />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            User Directory & Access Control
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Super Admin Controller: Register and manage Ward Councillors, Field Workers, and Citizens.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenModal}
          sx={{ borderRadius: 28, px: 3, py: 1.2, fontWeight: 700, textTransform: 'none', backgroundColor: '#2563EB' }}
        >
          Register Councillor / Worker
        </Button>
      </Box>

      {/* Search Card */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CustomTextField
              placeholder="Search by User Name, Email, or Role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 0 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#6F4E37', mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: 4 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ward Jurisdiction</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748B' }}>
                    No users found matching your filter criteria. Click "Register Councillor / Worker" above to add official staff.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{row.fullName}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={ROLE_LABELS[row.role] || row.role}
                        size="small"
                        color={
                          row.role === 'ADMIN'
                            ? 'error'
                            : row.role === 'COUNCILLOR'
                            ? 'primary'
                            : row.role === 'WORKER'
                            ? 'info'
                            : 'default'
                        }
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{row.ward || 'Global System'}</TableCell>
                    <TableCell align="center">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Active'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Register Modal Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
          Register Official User (Councillor / Worker)
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent dividers sx={{ p: 3 }}>
            {modalError && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{modalError}</Alert>}
            {modalSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{modalSuccess}</Alert>}

            {formData.role === 'COUNCILLOR' && (() => {
              const existingC = users.find(u => u.role === 'COUNCILLOR' && u.ward?.toLowerCase() === formData.ward?.toLowerCase());
              if (existingC) {
                return (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 3, fontSize: '0.85rem' }}>
                    <strong>🚫 Ward Restricted:</strong> {formData.ward} already has an active Councillor (<strong>{existingC.fullName}</strong> - {existingC.email}). Only 1 Councillor per ward is allowed.
                  </Alert>
                );
              }
              return null;
            })()}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="register-role-label">System Role</InputLabel>
                  <Select
                    labelId="register-role-label"
                    value={formData.role}
                    label="System Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <MenuItem value="COUNCILLOR">Ward Councillor</MenuItem>
                    <MenuItem value="WORKER">Field Worker / Technician</MenuItem>
                    <MenuItem value="ADMIN">System Administrator</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="register-ward-label">Ward Jurisdiction</InputLabel>
                  <Select
                    labelId="register-ward-label"
                    value={formData.ward}
                    label="Ward Jurisdiction"
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  >
                    {wards.map((w) => (
                      <MenuItem key={w.id} value={`Ward ${w.wardNumber} - ${w.name}`}>
                        Ward {w.wardNumber} - {w.name}
                      </MenuItem>
                    ))}
                    <MenuItem value="All Wards">All Wards (Global)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Full Name"
                  placeholder="e.g. Hon. Priya Verma or Suresh Patil"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Official Email Address"
                  type="email"
                  placeholder="e.g. priya.councillor@sgcs.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Initial Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Mobile Phone Number"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseModal} sx={{ color: '#64748B', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={modalLoading}
              sx={{ borderRadius: 3, px: 3, fontWeight: 700, backgroundColor: '#2563EB' }}
            >
              {modalLoading ? 'Registering...' : 'Register User to Database'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
