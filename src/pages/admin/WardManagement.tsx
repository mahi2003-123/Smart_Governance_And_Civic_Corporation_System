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
  Grid,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { adminService } from '../../services/adminService';
import { Ward } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';
import { CustomTextField } from '../../components/common/CustomTextField';

export const WardManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState<Ward[]>([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [wardNumber, setWardNumber] = useState(6);
  const [name, setName] = useState('');
  const [councillorName, setCouncillorName] = useState('');
  const [councillorEmail, setCouncillorEmail] = useState('');
  const [population, setPopulation] = useState(42000);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const data = await adminService.getWards();
      setWards(data);
      setWardNumber(data.length + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !councillorName) return;
    setSubmitting(true);
    try {
      const newW = await adminService.createWard({
        wardNumber,
        name: name.startsWith('Ward') ? name : `Ward ${wardNumber} - ${name}`,
        councillorName,
        councillorEmail: councillorEmail || 'councillor@sgcs.gov.in',
        population,
      });
      setWards([...wards, newW]);
      setOpenModal(false);
      setName('');
      setCouncillorName('');
      setCouncillorEmail('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = wards.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.councillorName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading Ward Management Directory..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="Ward Management"
        description="Manage municipal wards, assigned councillors and field staff."
        actionLabel="Add Ward"
        actionIcon={<AddOutlinedIcon sx={{ fontSize: 18 }} />}
        onActionClick={() => setOpenModal(true)}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search wards by name or councillor..."
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
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Ward Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Ward Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Assigned Councillor</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Population</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Active Grievances</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Resolved</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No municipal wards found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((w) => {
                const actionItems: ActionMenuItem[] = [
                  {
                    label: 'View Ward Details',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Ward Details: ${w.name}`),
                  },
                  {
                    label: 'Assign Councillor',
                    icon: <PersonAddOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Assign Councillor to ${w.name}`),
                  },
                  {
                    label: 'View Field Workers',
                    icon: <GroupOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`View field workers in ${w.name}`),
                  },
                  {
                    label: 'Edit Ward Info',
                    icon: <EditOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Edit ${w.name}`),
                  },
                ];

                return (
                  <TableRow key={w.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#202522' }}>
                      Ward {w.wardNumber}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#496A57' }}>
                      {w.name}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {w.councillorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {w.councillorEmail}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {w.population.toLocaleString()} Residents
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${w.activeComplaints} Active`}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          backgroundColor: '#FBF4E8',
                          color: '#B58A45',
                          borderRadius: '4px',
                          height: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${w.resolvedComplaints} Fixed`}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          backgroundColor: '#E8EFE9',
                          color: '#304B3A',
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

      {/* Add Ward Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
            Add Municipal Ward
          </Typography>
          <IconButton size="small" onClick={() => setOpenModal(false)}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateWard}>
          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Ward Number"
                  type="number"
                  value={wardNumber}
                  onChange={(e) => setWardNumber(parseInt(e.target.value, 10))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Estimated Population"
                  type="number"
                  value={population}
                  onChange={(e) => setPopulation(parseInt(e.target.value, 10))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  label="Ward Name"
                  placeholder="e.g. Central Town or West Ridge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Assigned Councillor Name"
                  placeholder="e.g. Hon. Rajesh Sharma"
                  value={councillorName}
                  onChange={(e) => setCouncillorName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Councillor Email Address"
                  type="email"
                  placeholder="councillor@sgcs.gov.in"
                  value={councillorEmail}
                  onChange={(e) => setCouncillorEmail(e.target.value)}
                  required
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
              disabled={submitting}
              sx={{
                backgroundColor: '#496A57',
                color: '#FFFFFF',
                textTransform: 'none',
                px: 3,
                '&:hover': { backgroundColor: '#304B3A' },
              }}
            >
              {submitting ? 'Creating...' : 'Create Ward'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default WardManagement;
