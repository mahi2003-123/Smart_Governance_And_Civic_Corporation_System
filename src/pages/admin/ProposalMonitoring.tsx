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
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { proposalService } from '../../services/proposalService';
import { adminService } from '../../services/adminService';
import { CommunityProposal, Ward } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';
import { ActionMenu, ActionMenuItem } from '../../components/admin/ActionMenu';

export const ProposalMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal
  const [selectedProposal, setSelectedProposal] = useState<CommunityProposal | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pData, wData] = await Promise.all([
          proposalService.getProposals(),
          adminService.getWards(),
        ]);
        setProposals(pData);
        setWards(wData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = proposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesWard = wardFilter === 'ALL' || (p.ward && p.ward.includes(wardFilter));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

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
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
      onChange: setStatusFilter,
    },
  ];

  if (loading) return <LoadingSpinner message="Loading Community Proposal Registry..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="Community Proposals"
        description="Monitor citizen proposals and ward voting support across the city."
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search proposals by title, author or category..."
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
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Proposal Title & Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Ward</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Author (Citizen)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Support Count</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Submitted</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No community proposals match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const actionItems: ActionMenuItem[] = [
                  {
                    label: 'View Full Proposal',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => setSelectedProposal(p),
                  },
                  {
                    label: 'View Author Profile',
                    icon: <PersonOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Author: ${p.authorName}`),
                  },
                ];

                return (
                  <TableRow key={p.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {p.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {p.category}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {p.ward.split(' - ')[0]}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#202522' }}>
                      {p.authorName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${p.upvotes} Upvotes`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.725rem',
                          backgroundColor: '#E8EFE9',
                          color: '#304B3A',
                          borderRadius: '4px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          backgroundColor:
                            p.status === 'APPROVED'
                              ? '#E8EFE9'
                              : p.status === 'REJECTED'
                              ? '#FDE8E8'
                              : '#FBF4E8',
                          color:
                            p.status === 'APPROVED'
                              ? '#304B3A'
                              : p.status === 'REJECTED'
                              ? '#B45D59'
                              : '#B58A45',
                          borderRadius: '4px',
                          height: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#68706B' }}>
                      {p.createdAt ? p.createdAt.split('T')[0] : '2026-08-15'}
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
      {selectedProposal && (
        <Dialog
          open={Boolean(selectedProposal)}
          onClose={() => setSelectedProposal(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
                {selectedProposal.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>
                {selectedProposal.ward} — Submitted by {selectedProposal.authorName}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setSelectedProposal(null)}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            <Typography variant="body2" sx={{ color: '#4A524D', lineHeight: 1.6, mb: 2 }}>
              {selectedProposal.description}
            </Typography>

            <Box sx={{ p: 2, backgroundColor: '#F8F9F7', borderRadius: '6px', border: '1px solid #E5E8E4' }}>
              <Typography variant="caption" sx={{ color: '#68706B', display: 'block', mb: 0.5 }}>
                Community Support Statistics
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#496A57' }}>
                {selectedProposal.upvotes} Upvotes | {selectedProposal.downvotes || 0} Downvotes
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedProposal(null)} sx={{ color: '#68706B', textTransform: 'none' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ProposalMonitoring;
