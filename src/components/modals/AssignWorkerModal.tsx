import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, MenuItem, Button, Chip, Divider, IconButton, Grid, Avatar } from '@mui/material';
import { Complaint, ComplaintPriority } from '../../types';
import { CustomTextField } from '../common/CustomTextField';
import { CustomButton } from '../common/CustomButton';
import { adminService } from '../../services/adminService';
import { complaintService } from '../../services/complaintService';
import { matchesWard } from '../../utils/wardUtils';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LinkIcon from '@mui/icons-material/Link';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PersonIcon from '@mui/icons-material/Person';

interface AssignWorkerModalProps {
  open: boolean;
  complaint: Complaint | null;
  allComplaints?: Complaint[];
  onClose: () => void;
  onConfirm: (workerId: string, workerName: string, priority: ComplaintPriority, dueDate?: string) => Promise<void>;
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  open,
  complaint,
  allComplaints = [],
  onClose,
  onConfirm,
}) => {
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<ComplaintPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Auto-resolve working category natively silently
  const activeCategory = complaint?.isAiCategoryAccepted 
    ? complaint.category 
    : (complaint?.aiSuggestedCategory || complaint?.category || 'Other');

  useEffect(() => {
    if (open && complaint) {
      setSelectedPriority(complaint.priority || 'MEDIUM');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [open, complaint]);

  useEffect(() => {
    const loadRegisteredWorkers = async () => {
      try {
        const users = await adminService.getUsers();
        const registered = users.filter((u) => u.role === 'WORKER' && (u.status || 'ACTIVE') === 'ACTIVE');
        
        if (registered.length > 0 && complaint) {
          const finalCategory = activeCategory;
          
          const enhancedWorkers = registered.map(w => {
            const activeTasksNum = allComplaints.filter(c => String(c.assignedWorkerId) === String(w.id) && c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
            const dueTodayNum = allComplaints.filter(c => String(c.assignedWorkerId) === String(w.id) && c.status !== 'RESOLVED' && c.status !== 'REJECTED' && c.dueDate && String(c.dueDate).startsWith(new Date().toISOString().split('T')[0])).length;
            
            const isCategoryMatch = w.ward === finalCategory || (w.specialization && w.specialization === finalCategory);
            const isWardMatch = complaint.ward ? matchesWard(w.ward, complaint.ward) : false;
            
            let score = 0;
            if (isCategoryMatch) score += 100;
            if (isWardMatch) score += 50;
            score -= (activeTasksNum * 10);
            
            return {
              ...w,
              activeTasksNum,
              dueTodayNum,
              isCategoryMatch,
              isWardMatch,
              score,
              workload: activeTasksNum > 5 ? 'HIGH' : activeTasksNum > 2 ? 'MEDIUM' : 'LOW'
            };
          });

          const sortedWorkers = [...enhancedWorkers].sort((a, b) => b.score - a.score);
          setWorkersList(sortedWorkers);
          if (sortedWorkers.length > 0) {
            setSelectedWorkerId(sortedWorkers[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (open && complaint) {
      loadRegisteredWorkers();
    }
  }, [open, complaint, activeCategory, allComplaints]);

  const handleConfirm = async () => {
    if (!selectedWorkerId) {
      alert('Please select an active registered technician to assign.');
      return;
    }
    const worker = workersList.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    setLoading(true);
    try {
      // Background Silently Accept AI Recommendation
      if (complaint && complaint.aiSuggestedCategory && !complaint.isAiCategoryAccepted) {
        try {
          await complaintService.reviewAiCategory(complaint.id, complaint.aiSuggestedCategory);
        } catch(e) {
           console.error('Failed to auto-accept AI category in DB', e);
        }
      }
      
      await onConfirm(worker.id, worker.fullName, selectedPriority, dueDate);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateLink = async (isLink: boolean) => {
    if (!complaint || !complaint.possibleDuplicateId) return;
    setAiLoading(true);
    try {
      await complaintService.linkDuplicate(complaint.id, complaint.possibleDuplicateId, isLink);
      if (isLink) {
        window.location.reload();
      } else {
        // Just refresh the component logic if needed
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth 
      scroll="paper"
      PaperProps={{ 
        sx: { 
          borderRadius: '16px', 
          border: '1px solid #E5E8E4', 
          maxHeight: '90vh',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.15)'
        } 
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#FFFFFF', 
        borderBottom: '1px solid #F3F5F2', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 4, py: 2.5 
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#202522', letterSpacing: '-0.01em' }}>
            Assign Worker
          </Typography>
          <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 500 }}>
            Review complaint details and select a worker for assignment.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#68706B', bgcolor: '#F8F9F7', '&:hover': { bgcolor: '#E5E8E4' } }}>
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, bgcolor: '#FFFFFF', overflowX: 'hidden' }}>
        
        {complaint.possibleDuplicateId && !complaint.isDuplicateConfirmed ? (
          <Box sx={{ px: 4, py: 3, bgcolor: '#FFFBEB', borderBottom: '1px solid #FDE68A' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
               <LinkIcon sx={{ color: '#D97706', fontSize: 24 }} />
               <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#92400E' }}>Duplicate Profile Detected</Typography>
            </Box>
            <Box sx={{ ml: '36px' }}>
               <Typography variant="body2" sx={{ color: '#B45309', mb: 2 }}>
                 Algorithm detected a <b>{Math.round((complaint.duplicateSimilarityScore || 0)*100)}%</b> match with active task: <b>{complaint.possibleDuplicateId}</b>.
               </Typography>
               <Box sx={{ display: 'flex', gap: 2 }}>
                 <Button variant="contained" onClick={() => handleDuplicateLink(true)} disabled={aiLoading} sx={{ bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' }, textTransform: 'none', fontWeight: 600 }}>
                   Link to Duplicate
                 </Button>
                 <Button variant="outlined" onClick={() => handleDuplicateLink(false)} disabled={aiLoading} sx={{ color: '#D97706', borderColor: '#D97706', textTransform: 'none', fontWeight: 600 }}>
                   Retain as Unique
                 </Button>
                 <Button variant="outlined" href={`/citizen/complaints/${complaint.possibleDuplicateId}`} target="_blank" disabled={aiLoading} sx={{ color: '#92400E', borderColor: '#92400E', textTransform: 'none', fontWeight: 600 }}>
                   View Duplicate
                 </Button>
               </Box>
            </Box>
          </Box>
        ) : (
          !complaint.isDuplicateConfirmed && (
            <Box sx={{ px: 4, py: 2.5, bgcolor: '#ECFDF5', borderBottom: '1px solid #6EE7B7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                 <AutoAwesomeIcon sx={{ color: '#059669', fontSize: 24 }} />
                 <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#065F46' }}>Unique Complaint Verified</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#047857', mt: 0.5, ml: '36px' }}>
                Algorithm confirmed no identical active tasks in this ward. Safe to proceed.
              </Typography>
            </Box>
          )
        )}

        <Grid container sx={{ minHeight: '100%' }}>
          {/* Left Column: Complaint Details */}
          <Grid item xs={12} md={5} sx={{ p: 4, display: 'flex', flexDirection: 'column', borderRight: { md: '1px solid #F3F5F2' } }}>
             <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                <Chip label={complaint.trackingNumber} size="small" sx={{ bgcolor: '#EBF5FF', color: '#1E40AF', fontWeight: 700, borderRadius: '6px' }} />
                <Chip label={new Date(complaint.createdAt).toLocaleDateString()} size="small" sx={{ bgcolor: '#F8F9F7', color: '#68706B', fontWeight: 600, borderRadius: '6px' }} />
             </Box>
             
             <Typography variant="h5" sx={{ fontWeight: 700, color: '#202522', mb: 2, mt: 1, lineHeight: 1.3 }}>
                {complaint.title}
             </Typography>
             
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex' }}>
                   <Typography variant="caption" sx={{ color: '#68706B', width: '80px', fontWeight: 600, mr: 2 }}>CATEGORY</Typography>
                   {complaint.aiSuggestedCategory && !complaint.isAiCategoryAccepted ? (
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700 }}>{activeCategory}</Typography>
                       <Chip 
                          icon={<AutoAwesomeIcon sx={{ fontSize: '12px !important' }} />} 
                          label={`AI Auto-Triage (${Math.round((complaint.aiConfidence || 0)*100)}%)`} 
                          size="small" 
                          sx={{ height: '20px', fontSize: '10px', bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, ml: 1 }} 
                       />
                     </Box>
                   ) : (
                     <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>{activeCategory}</Typography>
                   )}
                </Box>
                <Box sx={{ display: 'flex' }}>
                   <Typography variant="caption" sx={{ color: '#68706B', width: '80px', fontWeight: 600, mr: 2 }}>WARD</Typography>
                   <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>{complaint.ward}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                   <Typography variant="caption" sx={{ color: '#68706B', width: '80px', fontWeight: 600, mr: 2 }}>LOCATION</Typography>
                   <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>{complaint.locationAddress}</Typography>
                </Box>
             </Box>

             <Divider sx={{ mb: 3 }} />
             
             <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, mb: 1, display: 'block' }}>
               CITIZEN REPORT
             </Typography>
             <Box sx={{ bgcolor: '#F8F9F7', p: 2.5, borderRadius: '8px', border: '1px solid #F3F5F2', mb: 3 }}>
               <Typography variant="body2" sx={{ color: '#304B3A', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                 "{complaint.description}"
               </Typography>
             </Box>

             {complaint.images && complaint.images.length > 0 && complaint.images[0] !== '' && (
               <Box>
                 <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, mb: 1, display: 'block' }}>
                   ATTACHED EVIDENCE
                 </Typography>
                 <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                   {complaint.images.map((img, idx) => (
                     <Box key={idx} component="img" src={img} sx={{ height: 110, width: 'auto', minWidth: 110, objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E8E4' }} />
                   ))}
                 </Box>
               </Box>
             )}
          </Grid>

          {/* Right Column: AI & Action Engine */}
          <Grid item xs={12} md={7} sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#68706B', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Assignment Parameters
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Box sx={{ flex: 1, minWidth: '200px' }}>
                    <CustomTextField select label="Priority / Risk Level" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value as any)} fullWidth>
                      <MenuItem value="LOW"><span style={{marginRight: '8px'}}>🟢</span> Low Priority</MenuItem>
                      <MenuItem value="MEDIUM"><span style={{marginRight: '8px'}}>🔵</span> Standard Alert</MenuItem>
                      <MenuItem value="HIGH"><span style={{marginRight: '8px'}}>🟠</span> High Priority</MenuItem>
                      <MenuItem value="URGENT"><span style={{marginRight: '8px'}}>🔴</span> URGENT EMERGENCY</MenuItem>
                    </CustomTextField>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: '200px' }}>
                    <CustomTextField type="date" label="Expected SLA Deadline" value={dueDate} onChange={(e) => setDueDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                  </Box>
                </Box>

                {selectedPriority === 'URGENT' && (
                  <Box sx={{ mb: 4, p: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box sx={{ color: '#EF4444', height: 10, width: 10, borderRadius: '50%', minWidth: 10, bgcolor: '#EF4444' }} />
                    <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 600 }}>
                      Urgent Emergency triggers an external SMS escalation to the assigned technician natively.
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ mb: 3, mx: -4 }} />
                
                <Typography variant="subtitle2" sx={{ color: '#68706B', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1 }}>
                  Unit Assignment Protocol
                </Typography>

                {workersList.length > 0 ? (
                  <Box sx={{ mb: 3, p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #10B981', borderRadius: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669' }}><PersonIcon /></Avatar>
                          <Box>
                             <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                               AI Matched Specialist
                             </Typography>
                             <Typography variant="h6" sx={{ fontWeight: 700, color: '#202522', lineHeight: 1.2 }}>
                               {workersList[0].fullName}
                             </Typography>
                          </Box>
                       </Box>
                       <Chip label={`${workersList[0].ward || 'General'}`} size="small" sx={{ fontWeight: 600, bgcolor: '#F8F9F7' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F3F5F2', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                         <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600 }}>Active Tasks:</Typography>
                         <Typography variant="subtitle2" sx={{ color: '#202522', fontWeight: 700 }}>{workersList[0].activeTasksNum}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F3F5F2', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                         <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600 }}>Due Today:</Typography>
                         <Typography variant="subtitle2" sx={{ color: '#202522', fontWeight: 700 }}>{workersList[0].dueTodayNum}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                   <Typography variant="body2" sx={{ color: '#B45D59', mb: 3, p: 2, bgcolor: '#FDE8E8', borderRadius: '8px' }}>
                     No qualified engineers or field operatives are registered within the municipal database.
                   </Typography>
                )}

                <Box sx={{ flexGrow: 1 }} />
                
                <Box sx={{ mt: 'auto' }}>
                  <CustomTextField
                    select
                    label="Select Worker"
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    fullWidth
                    disabled={workersList.length === 0}
                    SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 350 } } } as any }}
                    sx={{ mb: 1 }}
                  >
                    {workersList.map((w, idx) => (
                      <MenuItem key={w.id} value={w.id} sx={{ py: 1.5, borderBottom: '1px solid #F8F9F7' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                           <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#202522' }}>
                                {w.fullName} {idx === 0 && <span style={{ color: '#059669' }}>★ Top Match</span>}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#68706B' }}>
                                Unit: {w.ward || 'General'}
                              </Typography>
                           </Box>
                           <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>Active: {w.activeTasksNum}</Typography>
                              <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>Due: {w.dueTodayNum}</Typography>
                           </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </CustomTextField>
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    Select an operative to permanently delegate this work order. Updates are fully logged.
                  </Typography>
                </Box>
              </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #F3F5F2' }}>
        <Button onClick={onClose} sx={{ color: '#68706B', fontWeight: 700, textTransform: 'none', px: 3 }}>
          Cancel
        </Button>
        <CustomButton
          loading={loading}
          disabled={!selectedWorkerId}
          onClick={handleConfirm}
          sx={{ 
            bgcolor: '#202522', 
            color: '#FFF', 
            px: 4, 
            py: 1.25,
            fontWeight: 700,
            textTransform: 'none', 
            borderRadius: '8px',
            fontFamily: 'system-ui',
            '&:hover': { bgcolor: '#000000', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } 
          }}
        >
          Assign Worker
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
