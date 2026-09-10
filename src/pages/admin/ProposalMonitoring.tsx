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
import { ProposalItemCard } from '../../components/proposals/ProposalItemCard';
import { useAuth } from '../../hooks/useAuth';

export const ProposalMonitoring: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal
  const [selectedProposal, setSelectedProposal] = useState<CommunityProposal | null>(null);

  const userIdentifier = user?.email || user?.id || user?.fullName || 'anonymous';

  const fetchProposals = async () => {
    try {
      const [pData, wData] = await Promise.all([
        proposalService.getProposals(undefined, userIdentifier),
        adminService.getWards(),
      ]);
      setProposals(pData);
      setWards(wData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProposals();
      setLoading(false);
    };
    fetchData();
  }, [userIdentifier]);

  const handleVote = async (proposalId: string, voteType: 'UP' | 'DOWN') => {
    try {
      const updated = await proposalService.voteProposal(proposalId, voteType, userIdentifier);
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProposal?.id === updated.id) {
        setSelectedProposal(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (proposalId: string, commentText: string) => {
    try {
      const updated = await proposalService.addComment(
        proposalId,
        {
          content: commentText,
          authorName: user?.fullName || 'System Admin',
          authorRole: 'ADMIN',
        },
        userIdentifier
      );
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProposal?.id === updated.id) {
        setSelectedProposal(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        description="Monitor citizen proposals, voting responses, and comments across all city wards."
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
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Author & Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Votes & Comments</TableCell>
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
                    label: 'View Proposal & Discussion',
                    icon: <VisibilityOutlinedIcon fontSize="small" />,
                    onClick: () => setSelectedProposal(p),
                  },
                  {
                    label: 'View Author Details',
                    icon: <PersonOutlinedIcon fontSize="small" />,
                    onClick: () => alert(`Author: ${p.authorName} (${p.authorRole || 'CITIZEN'})`),
                  },
                ];

                const commentCount = p.comments?.length || 0;

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
                      {p.authorName}{' '}
                      <Chip label={p.authorRole || 'CITIZEN'} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.625rem' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                          label={`👍 ${p.upvotes || 0}`}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: '#E8EFE9', color: '#304B3A', height: 20 }}
                        />
                        <Chip
                          label={`👎 ${p.downvotes || 0}`}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: '#FDE8E8', color: '#B45D59', height: 20 }}
                        />
                        <Chip
                          label={`💬 ${commentCount}`}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: '#F3F5F2', color: '#68706B', height: 20 }}
                        />
                      </Box>
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

      {/* Modal to view and participate in proposal discussion */}
      {selectedProposal && (
        <Dialog
          open={Boolean(selectedProposal)}
          onClose={() => setSelectedProposal(null)}
          maxWidth="md"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: '8px', p: 1 } } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
              Proposal Overview & Discussions
            </Typography>
            <IconButton size="small" onClick={() => setSelectedProposal(null)}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderColor: '#E5E8E4' }}>
            <ProposalItemCard
              proposal={selectedProposal}
              onVote={handleVote}
              onComment={handleComment}
            />
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
