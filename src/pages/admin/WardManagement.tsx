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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import AddIcon from '@mui/icons-material/Add';
import { adminService } from '../../services/adminService';
import { Ward } from '../../types';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const WardManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState<Ward[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const [wardNumber, setWardNumber] = useState(5);
  const [name, setName] = useState('');
  const [councillorName, setCouncillorName] = useState('');
  const [councillorEmail, setCouncillorEmail] = useState('');
  const [population, setPopulation] = useState(40000);
  const [submitting, setSubmitting] = useState(false);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const data = await adminService.getWards();
      setWards(data);
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
        name,
        councillorName,
        councillorEmail: councillorEmail || 'councillor@sgcs.gov.in',
        population,
      });
      setWards([...wards, newW]);
      setOpenModal(false);
      setName('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Ward Boundaries Registry..." />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            Municipal Wards Directory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure administrative boundaries, assign ward councillors, and monitor ward workload.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: 28, px: 3 }}
        >
          Add Municipal Ward
        </Button>
      </Box>

      <Card sx={{ borderRadius: 4 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ward #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ward Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Councillor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Population</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active Grievances</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total Resolved</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wards.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Chip label={`Ward ${row.wardNumber}`} size="small" sx={{ fontWeight: 800 }} />
                  </TableCell>
                  <TableCell fontWeight={700}>{row.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.councillorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.councillorEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.population.toLocaleString()} Residents</TableCell>
                  <TableCell>
                    <Chip label={`${row.activeComplaints} Active`} color="warning" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={`${row.resolvedComplaints} Resolved`} color="success" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Ward Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
        <DialogTitle fontWeight={800}>Register New Municipal Ward</DialogTitle>
        <form onSubmit={handleCreateWard}>
          <DialogContent>
            <CustomTextField
              label="Ward Number"
              type="number"
              value={wardNumber}
              onChange={(e) => setWardNumber(parseInt(e.target.value, 10))}
              required
            />
            <CustomTextField
              label="Ward Name"
              placeholder="e.g. West Tech Park Corridor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <CustomTextField
              label="Councillor Full Name"
              placeholder="Hon. Name"
              value={councillorName}
              onChange={(e) => setCouncillorName(e.target.value)}
              required
            />
            <CustomTextField
              label="Councillor Email Address"
              type="email"
              value={councillorEmail}
              onChange={(e) => setCouncillorEmail(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ borderRadius: 28 }}>
              Cancel
            </Button>
            <CustomButton type="submit" loading={submitting}>
              Create Ward
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
