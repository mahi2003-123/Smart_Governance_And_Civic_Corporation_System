import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, Tooltip, Grid, MenuItem } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../../types';
import { STATUS_COLORS, COMPLAINT_CATEGORIES } from '../../constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AssignWorkerModal } from '../../components/modals/AssignWorkerModal';
import { VerifyProofModal } from '../../components/modals/VerifyProofModal';
import { matchesWard } from '../../utils/wardUtils';
import { CustomTextField } from '../../components/common/CustomTextField';
import { AccessDeniedState } from '../../components/common/AccessDeniedState';

export const ManageComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignDialogComplaint, setAssignDialogComplaint] = useState<Complaint | null>(null);
  const [verifyModalComplaint, setVerifyModalComplaint] = useState<Complaint | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchComplaints = async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const data = await complaintService.getComplaints();
      setComplaints(data);
    } catch (e: any) {
      console.error(e);
      if (e?.response?.status === 403 || e?.status === 403) {
        setForbidden(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleConfirmAssign = async (workerId: string, workerName: string, priority: ComplaintPriority, dueDate?: string) => {
    if (!assignDialogComplaint || !user) return;
    try {
      const updated = await complaintService.assignWorker(
        assignDialogComplaint.id,
        workerId,
        workerName,
        user.fullName,
        priority,
        dueDate
      );
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setAssignDialogComplaint(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveProof = async (complaintId: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.approveTask(complaintId, user.fullName);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id || c.trackingNumber === updated.trackingNumber ? updated : c)));
      setVerifyModalComplaint(null);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleRejectProof = async (complaintId: string, feedback: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.rejectTaskProof(complaintId, user.fullName, feedback);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id || c.trackingNumber === updated.trackingNumber ? updated : c)));
      setVerifyModalComplaint(null);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleRejectComplaint = async (cId: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.updateComplaintStatus(cId, 'REJECTED' as ComplaintStatus, user.fullName, 'COUNCILLOR', 'Duplicate or out of jurisdiction.');
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkUrgent = async (cId: string) => {
    if (!user) return;
    try {
      const updated = await complaintService.updateComplaintPriority(cId, 'URGENT' as ComplaintPriority);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to mark priority as URGENT');
    }
  };

  const wardComplaints = (user?.role === 'COUNCILLOR' && user?.ward)
    ? complaints.filter((c) => matchesWard(c.ward, user.ward))
    : complaints;

  const todayStr = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    let newC = 0, inProg = 0, dueToday = 0, overdue = 0;
    wardComplaints.forEach(c => {
       if (c.status === 'PENDING' || c.status === 'PENDING_REVIEW') newC++;
       if (c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS') inProg++;
       if (c.dueDate && c.status !== 'RESOLVED' && c.status !== 'REJECTED') {
          const dStr = c.dueDate.split('T')[0];
          if (dStr === todayStr) dueToday++;
          if (dStr < todayStr) overdue++;
       }
    });
    return { newC, inProg, dueToday, overdue };
  }, [wardComplaints, todayStr]);

  const displayedComplaints = wardComplaints.filter(c => {
    const s = search.toLowerCase();
    const matchSearch = c.trackingNumber.toLowerCase().includes(s) || c.title.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s) || c.locationAddress?.toLowerCase().includes(s);
    const matchCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchPri = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchStat = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchCat && matchPri && matchStat;
  }).sort((a,b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  if (forbidden) {
    return <AccessDeniedState message="You do not have permission to view or manage complaints for this ward." onRetry={fetchComplaints} />;
  }

  if (loading && complaints.length === 0) return <LoadingSpinner message="Loading Dashboard & Complaints..." />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#202522' }}>
            Good morning, {user?.fullName.split(' ')[0]}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#68706B', mt: 0.5 }}>
            {user?.ward || 'Central Headquarters'} — Smart Governance Control Center
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E5E8E4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px' }}>
              <Box sx={{ p: 1.5, bgcolor: '#EBF5FF', color: '#1E40AF', borderRadius: '8px' }}><AssessmentIcon/></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#202522' }}>{stats.newC}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#68706B', textTransform: 'uppercase' }}>New Complaints</Typography>
              </Box>
           </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E5E8E4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px' }}>
              <Box sx={{ p: 1.5, bgcolor: '#E8F3EE', color: '#1F4D3A', borderRadius: '8px' }}><AssignmentIcon/></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#202522' }}>{stats.inProg}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#68706B', textTransform: 'uppercase' }}>In Progress</Typography>
              </Box>
           </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E5E8E4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px' }}>
              <Box sx={{ p: 1.5, bgcolor: '#FEF3C7', color: '#92400E', borderRadius: '8px' }}><WarningAmberIcon/></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#202522' }}>{stats.dueToday}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#68706B', textTransform: 'uppercase' }}>Due Today SLA</Typography>
              </Box>
           </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E5E8E4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px' }}>
              <Box sx={{ p: 1.5, bgcolor: '#FDEDEC', color: '#E74C3C', borderRadius: '8px' }}><EventBusyIcon/></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#202522' }}>{stats.overdue}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#68706B', textTransform: 'uppercase' }}>Overdue Tasks</Typography>
              </Box>
           </Card>
        </Grid>
      </Grid>

      {/* Filters Area */}
      <Box sx={{ mb: 3 }}>
         <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', mb: 0.5 }}>Complaints Requiring Attention</Typography>
         <Typography variant="body2" sx={{ color: '#68706B', mb: 2 }}>Review, prioritize and assign civic complaints safely.</Typography>

         <Grid container spacing={2}>
           <Grid item xs={12} md={4}>
             <CustomTextField fullWidth placeholder="Search complaint ID, title, location..." value={search} onChange={e => setSearch(e.target.value)} size="small"/>
           </Grid>
           <Grid item xs={12} sm={4} md={2}>
             <CustomTextField select fullWidth value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} size="small">
               <MenuItem value="ALL">All Categories</MenuItem>
               {COMPLAINT_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
             </CustomTextField>
           </Grid>
           <Grid item xs={12} sm={4} md={2}>
             <CustomTextField select fullWidth value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} size="small">
               <MenuItem value="ALL">All Priorities</MenuItem>
               <MenuItem value="LOW">Low</MenuItem>
               <MenuItem value="MEDIUM">Medium</MenuItem>
               <MenuItem value="HIGH">High</MenuItem>
               <MenuItem value="URGENT">Urgent</MenuItem>
             </CustomTextField>
           </Grid>
           <Grid item xs={12} sm={4} md={2}>
             <CustomTextField select fullWidth value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="small">
               <MenuItem value="ALL">All Statuses</MenuItem>
               {Object.keys(STATUS_COLORS).map(c => <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>)}
             </CustomTextField>
           </Grid>
         </Grid>
      </Box>

      {/* Data Table */}
      <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E5E8E4', bgcolor: '#FFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#68706B', py: 2 }}>Complaint ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#68706B', py: 2 }}>Title & Location</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#68706B', py: 2 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#68706B', py: 2 }}>SLA / Due</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#68706B', py: 2 }}>Assigned Technician</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#68706B', py: 2 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#68706B', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" sx={{ color: '#68706B' }}>No complaints found matching your criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedComplaints.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8F9F7' }, borderBottom: '1px solid #F3F5F2' }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#304B3A' }}>{row.trackingNumber}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {row.aiSuggestedCategory && !row.isAiCategoryAccepted && (
                           <Chip label="AI Review" size="small" sx={{ height: '18px', fontSize: '10px', bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600 }} />
                        )}
                        {row.possibleDuplicateId && !row.isDuplicateConfirmed && (
                           <Chip label={`Dup? ${Math.round((row.duplicateSimilarityScore || 0) * 100)}%`} size="small" sx={{ height: '18px', fontSize: '10px', bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }} />
                        )}
                        {row.status === 'LINKED' && (
                           <Chip label="Linked Dup" size="small" sx={{ height: '18px', fontSize: '10px', bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522' }}>{row.title}</Typography>
                      <Typography variant="caption" sx={{ color: '#68706B', display: 'block', mt: 0.5 }}>{row.ward} • {row.locationAddress}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.category.replace('_', ' ')} size="small" sx={{ bgcolor: '#F3F5F2', color: '#202522', fontWeight: 600, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      {row.dueDate ? (
                         <Typography variant="caption" sx={{ fontWeight: 600, color: row.dueDate.split('T')[0] < todayStr ? '#E74C3C' : '#68706B' }}>
                           {row.dueDate.split('T')[0]}
                         </Typography>
                      ) : <span style={{ color: '#68706B', fontSize: '12px' }}>—</span>}
                    </TableCell>
                    <TableCell>
                      {row.assignedWorkerName ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#496A57' }}>{row.assignedWorkerName}</Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#B45D59', fontWeight: 600, bgcolor: '#FDE8E8', px: 1, py: 0.5, borderRadius: '4px' }}>Unassigned</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.status === 'PENDING_APPROVAL' ? (
                        <Chip label="Review Proof" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
                      ) : (
                        <Chip label={row.status.replace('_', ' ')} size="small" sx={{ bgcolor: (STATUS_COLORS[row.status] ?? STATUS_COLORS.PENDING).bg, color: (STATUS_COLORS[row.status] ?? STATUS_COLORS.PENDING).text, fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Full Timeline">
                          <IconButton size="small" sx={{ color: '#68706B' }} onClick={() => navigate(`/citizen/complaints/${row.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {row.status === 'PENDING_APPROVAL' ? (
                          <Button variant="contained" size="small" onClick={() => setVerifyModalComplaint(row)} sx={{ bgcolor: '#D97706', color: '#FFF', minWidth: '90px' }}>Verify</Button>
                        ) : (row.status !== 'REJECTED' && row.status !== 'RESOLVED') && (
                          <Button variant="outlined" size="small" onClick={() => setAssignDialogComplaint(row)} sx={{ color: '#496A57', borderColor: '#496A57', minWidth: '90px' }}>
                            {row.assignedWorkerName ? 'Reassign' : 'Review'}
                          </Button>
                        )}
                        {row.priority !== 'URGENT' && row.status !== 'RESOLVED' && row.status !== 'REJECTED' && (
                          <Tooltip title="Promote to URGENT">
                            <IconButton size="small" sx={{ color: '#D97706' }} onClick={() => handleMarkUrgent(row.id)}>
                               <WarningAmberIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {row.status === 'PENDING' && (
                          <Tooltip title="Reject Duplicate">
                             <IconButton size="small" sx={{ color: '#B45D59' }} onClick={() => handleRejectComplaint(row.id)}>
                                <BlockIcon fontSize="small" />
                             </IconButton>
                           </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <AssignWorkerModal
        open={Boolean(assignDialogComplaint)}
        complaint={assignDialogComplaint}
        allComplaints={complaints}
        onClose={() => setAssignDialogComplaint(null)}
        onConfirm={handleConfirmAssign}
        onComplaintUpdated={(updated) => {
          setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setAssignDialogComplaint(updated);
        }}
      />

      <VerifyProofModal
        open={Boolean(verifyModalComplaint)}
        complaint={verifyModalComplaint}
        onClose={() => setVerifyModalComplaint(null)}
        onApprove={handleApproveProof}
        onRejectProof={handleRejectProof}
      />
    </Box>
  );
};
