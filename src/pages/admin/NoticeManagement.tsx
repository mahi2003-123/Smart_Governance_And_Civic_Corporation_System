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
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import { noticeService } from '../../services/noticeService';
import { adminService } from '../../services/adminService';
import { WardNotice, Ward, NoticePriority } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';
import { CustomTextField } from '../../components/common/CustomTextField';

export const NoticeManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<WardNotice[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    ward: 'System Wide',
    priority: 'IMPORTANT' as NoticePriority,
    category: 'Public Advisory',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nData, wData] = await Promise.all([
        noticeService.getNotices(),
        adminService.getWards(),
      ]);
      setNotices(nData);
      setWards(wData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setSubmitting(true);
    try {
      const created = await noticeService.createNotice({
        title: formData.title,
        content: formData.content,
        ward: formData.ward,
        priority: formData.priority,
        publishedBy: 'Super Admin Office',
        category: formData.category,
      });

      setNotices([created, ...notices]);
      setOpenModal(false);
      setFormData({
        title: '',
        content: '',
        ward: 'System Wide',
        priority: 'IMPORTANT',
        category: 'Public Advisory',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this official ward notice?')) {
      setNotices((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const filtered = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase());

    const matchesWard = wardFilter === 'ALL' || (n.ward && n.ward.includes(wardFilter));

    return matchesSearch && matchesWard;
  });

  const filterOptions: FilterOption[] = [
    {
      id: 'ward',
      label: 'Ward Jurisdiction',
      value: wardFilter,
      options: [
        { label: 'All Wards', value: 'ALL' },
        { label: 'System Wide', value: 'System Wide' },
        ...wards.map((w) => ({ label: `Ward ${w.wardNumber}`, value: `Ward ${w.wardNumber}` })),
      ],
      onChange: setWardFilter,
    },
  ];

  if (loading) return <LoadingSpinner message="Loading Ward Notices Registry..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="Ward Notices"
        description="Publish and manage system-wide and ward-specific official notices."
        actionLabel="Create Notice"
        actionIcon={<AddOutlinedIcon sx={{ fontSize: 18 }} />}
        onActionClick={() => setOpenModal(true)}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notices by title or category..."
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
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Notice Title</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Ward Jurisdiction</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Published Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No published notices match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((n) => {
                const actionItems: ActionMenuItem[] = [
                  {
                    label: 'View Notice',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Notice Content: ${n.content}`),
                  },
                  {
                    label: 'Edit Notice',
                    icon: <EditOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Edit ${n.title}`),
                  },
                  {
                    label: 'Delete Notice',
                    icon: <DeleteOutlinedIcon fontSize="small" />,
                    color: 'error',
                    onClick: () => handleDeleteNotice(n.id),
                  },
                ];

                return (
                  <TableRow key={n.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#202522' }}>
                      {n.title}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {n.category}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#496A57', fontWeight: 500 }}>
                      {n.ward ? n.ward.split(' - ')[0] : 'System Wide'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={n.priority}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.675rem',
                          backgroundColor:
                            n.priority === 'EMERGENCY'
                              ? '#FDE8E8'
                              : n.priority === 'IMPORTANT'
                              ? '#FBF4E8'
                              : '#E8EFE9',
                          color:
                            n.priority === 'EMERGENCY'
                              ? '#B45D59'
                              : n.priority === 'IMPORTANT'
                              ? '#B58A45'
                              : '#304B3A',
                          borderRadius: '4px',
                          height: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {n.publishDate ? n.publishDate.split('T')[0] : '2026-08-22'}
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
        PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
            Publish Official Ward Notice
          </Typography>
          <IconButton size="small" onClick={() => setOpenModal(false)}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateNotice}>
          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="notice-ward-label">Ward Jurisdiction</InputLabel>
                  <Select
                    labelId="notice-ward-label"
                    value={formData.ward}
                    label="Ward Jurisdiction"
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  >
                    <MenuItem value="System Wide">System Wide (All Wards)</MenuItem>
                    {wards.map((w) => (
                      <MenuItem key={w.id} value={`Ward ${w.wardNumber} - ${w.name}`}>
                        Ward {w.wardNumber} - {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="notice-priority-label">Priority Level</InputLabel>
                  <Select
                    labelId="notice-priority-label"
                    value={formData.priority}
                    label="Priority Level"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as NoticePriority })}
                  >
                    <MenuItem value="NORMAL">Normal</MenuItem>
                    <MenuItem value="IMPORTANT">Important Advisory</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency Notice</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Notice Title"
                  placeholder="e.g. Water Supply Maintenance Schedule"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  label="Notice Content & Details"
                  multiline
                  rows={4}
                  placeholder="Enter official announcement details for residents..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
              {submitting ? 'Publishing...' : 'Publish Notice'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default NoticeManagement;
