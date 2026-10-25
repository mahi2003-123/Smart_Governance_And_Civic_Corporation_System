import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  MenuItem,
  Button,
  Chip,
  Divider,
  IconButton,
  Grid,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Complaint, ComplaintPriority } from '../../types';
import { CustomTextField } from '../common/CustomTextField';
import { CustomButton } from '../common/CustomButton';
import { StatusBadge } from '../common/StatusBadge';
import { adminService } from '../../services/adminService';
import { complaintService } from '../../services/complaintService';
import { matchesWard } from '../../utils/wardUtils';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LinkIcon from '@mui/icons-material/Link';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface AssignWorkerModalProps {
  open: boolean;
  complaint: Complaint | null;
  allComplaints?: Complaint[];
  onClose: () => void;
  onConfirm: (workerId: string, workerName: string, priority: ComplaintPriority, dueDate?: string) => Promise<void>;
  onComplaintUpdated?: (complaint: Complaint) => void;
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  open,
  complaint,
  allComplaints = [],
  onClose,
  onConfirm,
  onComplaintUpdated,
}) => {
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(complaint);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ROAD');
  const [selectedPriority, setSelectedPriority] = useState<ComplaintPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Popup / Snackbar notification
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // View Duplicate Preview Modal state
  const [viewDuplicateOpen, setViewDuplicateOpen] = useState(false);
  const [duplicateComplaintData, setDuplicateComplaintData] = useState<Complaint | null>(null);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentComplaint(complaint);
  }, [complaint]);

  // Auto-resolve working category natively silently
  const activeCategory = currentComplaint?.isAiCategoryAccepted 
    ? currentComplaint.category 
    : (currentComplaint?.aiSuggestedCategory || currentComplaint?.category || 'Other');

  useEffect(() => {
    if (open && currentComplaint) {
      setSelectedPriority(currentComplaint.priority || 'MEDIUM');
      setSelectedCategory(currentComplaint.category || currentComplaint.aiSuggestedCategory || 'ROAD');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [open, currentComplaint]);

  useEffect(() => {
    const loadRegisteredWorkers = async () => {
      try {
        let registered = await adminService.getWorkers(currentComplaint?.ward);
        if (!registered || registered.length === 0) {
          try {
            const users = await adminService.getUsers();
            registered = users.filter((u) => u.role === 'WORKER' && (u.status || 'ACTIVE') === 'ACTIVE');
          } catch {}
        }
        
        if (registered.length > 0 && currentComplaint) {
          const finalCategory = activeCategory;
          
          const enhancedWorkers = registered.map(w => {
            const activeTasksNum = allComplaints.filter(c => String(c.assignedWorkerId) === String(w.id) && c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
            const dueTodayNum = allComplaints.filter(c => String(c.assignedWorkerId) === String(w.id) && c.status !== 'RESOLVED' && c.status !== 'REJECTED' && c.dueDate && String(c.dueDate).startsWith(new Date().toISOString().split('T')[0])).length;
            
            const isCategoryMatch = w.ward === finalCategory || (w.specialization && w.specialization === finalCategory);
            const isWardMatch = currentComplaint.ward ? matchesWard(w.ward, currentComplaint.ward) : false;
            
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

    if (open && currentComplaint) {
      loadRegisteredWorkers();
    }
  }, [open, currentComplaint, activeCategory, allComplaints]);

  const handleConfirm = async () => {
    if (!selectedWorkerId) {
      alert('Please select an active registered technician to assign.');
      return;
    }
    const worker = workersList.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    setLoading(true);
    try {
      // Councillor decides and sets the civic category
      if (currentComplaint && selectedCategory) {
        try {
          await complaintService.reviewAiCategory(currentComplaint.id, selectedCategory);
        } catch (err) {
          console.error('Failed to update category in DB', err);
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

  const handleOpenViewDuplicate = async () => {
    const dupId = currentComplaint?.possibleDuplicateId || currentComplaint?.masterComplaintId;
    if (!dupId) return;
    setViewDuplicateOpen(true);
    setDuplicateLoading(true);
    setDuplicateError(null);
    try {
      const found = allComplaints.find(c => c.id === dupId || c.trackingNumber === dupId);
      if (found) {
        setDuplicateComplaintData(found);
      } else {
        const fetched = await complaintService.getComplaintById(dupId);
        setDuplicateComplaintData(fetched);
      }
    } catch (err: any) {
      console.error('Failed to load duplicate complaint details:', err);
      setDuplicateError(err.message || 'Could not load duplicate complaint details.');
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleDuplicateLink = async (isLink: boolean) => {
    if (!currentComplaint) return;
    const targetMasterId = currentComplaint.possibleDuplicateId || currentComplaint.masterComplaintId;
    if (isLink && !targetMasterId) return;

    setAiLoading(true);
    try {
      const updated = await complaintService.linkDuplicate(
        currentComplaint.id,
        targetMasterId || '',
        isLink
      );
      setCurrentComplaint(updated);
      onComplaintUpdated?.(updated);

      if (isLink) {
        setViewDuplicateOpen(false);
        setSnackbar({
          open: true,
          message: `Complaint linked to duplicate ticket #${updated.masterComplaintId || targetMasterId}. Status set to LINKED.`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Complaint marked as unique verified grievance. Duplicate alert cleared.',
          severity: 'success',
        });
      }
    } catch (e: any) {
      console.error('Duplicate link error:', e);
      setSnackbar({
        open: true,
        message: e.message || 'Failed to update complaint duplicate status.',
        severity: 'error',
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (!currentComplaint) return null;

  return (
    <>
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
          
          {currentComplaint.status === 'LINKED' || currentComplaint.isDuplicateConfirmed ? (
            <Box sx={{ px: 4, py: 2.5, bgcolor: '#EFF6FF', borderBottom: '1px solid #BFDBFE' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                   <LinkIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                   <Box>
                     <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E40AF' }}>
                       Linked to Duplicate Master Ticket
                     </Typography>
                     <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                       This complaint is linked to master ticket: <b>{currentComplaint.masterComplaintId || currentComplaint.possibleDuplicateId}</b>. Status is <b>LINKED</b>.
                     </Typography>
                   </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenViewDuplicate}
                  sx={{ color: '#1E40AF', borderColor: '#BFDBFE', textTransform: 'none', fontWeight: 600 }}
                >
                  View Master Ticket
                </Button>
              </Box>
            </Box>
          ) : currentComplaint.possibleDuplicateId ? (
            <Box sx={{ px: 4, py: 3, bgcolor: '#FFFBEB', borderBottom: '1px solid #FDE68A' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                 <LinkIcon sx={{ color: '#D97706', fontSize: 24 }} />
                 <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#92400E' }}>Duplicate Profile Detected</Typography>
              </Box>
              <Box sx={{ ml: '36px' }}>
                 <Typography variant="body2" sx={{ color: '#B45309', mb: 2 }}>
                   Algorithm detected a <b>{Math.round((currentComplaint.duplicateSimilarityScore || 0)*100)}%</b> match with active task: <b>{currentComplaint.possibleDuplicateId}</b>.
                 </Typography>
                 <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                   <Button
                     variant="contained"
                     onClick={() => handleDuplicateLink(true)}
                     disabled={aiLoading}
                     sx={{ bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' }, textTransform: 'none', fontWeight: 600 }}
                   >
                     {aiLoading ? 'Linking...' : 'Link to Duplicate'}
                   </Button>
                   <Button
                     variant="outlined"
                     onClick={() => handleDuplicateLink(false)}
                     disabled={aiLoading}
                     sx={{ color: '#D97706', borderColor: '#D97706', textTransform: 'none', fontWeight: 600 }}
                   >
                     Retain as Unique
                   </Button>
                   <Button
                     variant="outlined"
                     onClick={handleOpenViewDuplicate}
                     disabled={aiLoading}
                     sx={{ color: '#92400E', borderColor: '#92400E', textTransform: 'none', fontWeight: 600 }}
                   >
                     View Duplicate
                   </Button>
                 </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ px: 4, py: 2.5, bgcolor: '#ECFDF5', borderBottom: '1px solid #6EE7B7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                 <AutoAwesomeIcon sx={{ color: '#059669', fontSize: 24 }} />
                 <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#065F46' }}>Unique Complaint Verified</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#047857', mt: 0.5, ml: '36px' }}>
                Algorithm confirmed no identical active tasks in this ward. Safe to proceed.
              </Typography>
            </Box>
          )}

          <Grid container sx={{ minHeight: '100%' }}>
            {/* Left Column: Complaint Details */}
            <Grid item xs={12} md={5} sx={{ p: 4, display: 'flex', flexDirection: 'column', borderRight: { md: '1px solid #F3F5F2' } }}>
               <Box sx={{ mb: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip label={currentComplaint.trackingNumber} size="small" sx={{ bgcolor: '#EBF5FF', color: '#1E40AF', fontWeight: 700, borderRadius: '6px' }} />
                  <Chip label={new Date(currentComplaint.createdAt).toLocaleDateString()} size="small" sx={{ bgcolor: '#F8F9F7', color: '#68706B', fontWeight: 600, borderRadius: '6px' }} />
                  {currentComplaint.status === 'LINKED' && (
                    <Chip label="LINKED DUPLICATE" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, borderRadius: '6px' }} />
                  )}
               </Box>
               
               <Typography variant="h5" sx={{ fontWeight: 700, color: '#202522', mb: 2, mt: 1, lineHeight: 1.3 }}>
                  {currentComplaint.title}
               </Typography>
               
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  <Box sx={{ display: 'flex' }}>
                     <Typography variant="caption" sx={{ color: '#68706B', width: '80px', fontWeight: 600, mr: 2 }}>CATEGORY</Typography>
                     {currentComplaint.aiSuggestedCategory && !currentComplaint.isAiCategoryAccepted ? (
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700 }}>{activeCategory}</Typography>
                         <Chip 
                            icon={<AutoAwesomeIcon sx={{ fontSize: '12px !important' }} />} 
                            label={`AI Auto-Triage (${Math.round((currentComplaint.aiConfidence || 0)*100)}%)`} 
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
                     <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>{currentComplaint.ward}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                     <Typography variant="caption" sx={{ color: '#68706B', width: '80px', fontWeight: 600, mr: 2 }}>LOCATION</Typography>
                     <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>{currentComplaint.locationAddress}</Typography>
                  </Box>
               </Box>

               <Divider sx={{ mb: 3 }} />
               
               <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, mb: 1, display: 'block' }}>
                 CITIZEN REPORT
               </Typography>
               <Box sx={{ bgcolor: '#F8F9F7', p: 2.5, borderRadius: '8px', border: '1px solid #F3F5F2', mb: 3 }}>
                 <Typography variant="body2" sx={{ color: '#304B3A', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                   "{currentComplaint.description}"
                 </Typography>
               </Box>

               {currentComplaint.images && currentComplaint.images.length > 0 && currentComplaint.images[0] !== '' && (
                 <Box>
                   <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, mb: 1, display: 'block' }}>
                     ATTACHED EVIDENCE
                   </Typography>
                   <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                     {currentComplaint.images.map((img, idx) => (
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
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2.5, mb: 4 }}>
                    <Box sx={{ minWidth: '180px' }}>
                      <CustomTextField
                        select
                        label="Civic Category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="ROAD">Road Damage & Potholes</MenuItem>
                        <MenuItem value="WATER_SUPPLY">Water Supply & Leakage</MenuItem>
                        <MenuItem value="WASTE_MANAGEMENT">Garbage & Waste Disposal</MenuItem>
                        <MenuItem value="DRAINAGE">Drainage & Sewage Overflow</MenuItem>
                        <MenuItem value="STREET_LIGHT">Street Light Failure</MenuItem>
                        <MenuItem value="PUBLIC_SPACE">Public Spaces & Parks</MenuItem>
                        <MenuItem value="OTHER">Other / General Maintenance</MenuItem>
                      </CustomTextField>
                    </Box>
                    <Box sx={{ minWidth: '180px' }}>
                      <CustomTextField select label="Priority / Risk Level" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value as any)} fullWidth>
                        <MenuItem value="LOW"><span style={{marginRight: '8px'}}>🟢</span> Low Priority</MenuItem>
                        <MenuItem value="MEDIUM"><span style={{marginRight: '8px'}}>🔵</span> Standard Alert</MenuItem>
                        <MenuItem value="HIGH"><span style={{marginRight: '8px'}}>🟠</span> High Priority</MenuItem>
                        <MenuItem value="URGENT"><span style={{marginRight: '8px'}}>🔴</span> URGENT EMERGENCY</MenuItem>
                      </CustomTextField>
                    </Box>
                    <Box sx={{ minWidth: '180px' }}>
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

      {/* View Duplicate Complaint Details Modal */}
      <Dialog
        open={viewDuplicateOpen}
        onClose={() => setViewDuplicateOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', border: '1px solid #E5E8E4', boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.2)' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #F3F5F2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LinkIcon sx={{ color: '#D97706', fontSize: 26 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#202522' }}>
                Duplicate Complaint Review
              </Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>
                Inspect the matched active ticket details before linking or retaining as unique.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setViewDuplicateOpen(false)} size="small" sx={{ color: '#68706B', bgcolor: '#F8F9F7', '&:hover': { bgcolor: '#E5E8E4' } }}>
            <CloseOutlinedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 4, bgcolor: '#FFFFFF' }}>
          {duplicateLoading ? (
            <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={40} sx={{ color: '#D97706' }} />
              <Typography variant="body2" sx={{ color: '#68706B', fontWeight: 500 }}>
                Loading duplicate task details...
              </Typography>
            </Box>
          ) : duplicateError ? (
            <Alert severity="error" sx={{ my: 2 }}>{duplicateError}</Alert>
          ) : duplicateComplaintData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <Chip label={`Ticket #${duplicateComplaintData.trackingNumber || duplicateComplaintData.id}`} size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }} />
                    <Chip label={duplicateComplaintData.category} size="small" sx={{ bgcolor: '#F3F5F2', color: '#202522', fontWeight: 600 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#202522', lineHeight: 1.3 }}>
                    {duplicateComplaintData.title}
                  </Typography>
                </Box>
                <StatusBadge status={duplicateComplaintData.status} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, bgcolor: '#F8F9F7', p: 2.5, borderRadius: '8px', border: '1px solid #F3F5F2' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block' }}>MUNICIPAL WARD</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>{duplicateComplaintData.ward}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block' }}>REPORTED DATE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>{new Date(duplicateComplaintData.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block' }}>ASSIGNED WORKER</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>{duplicateComplaintData.assignedWorkerName || 'Unassigned'}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  SPECIFIC LOCATION
                </Typography>
                <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>
                  {duplicateComplaintData.locationAddress}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  COMPLAINT DESCRIPTION
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: '#F8F9F7', borderRadius: '8px', border: '1px solid #E5E8E4' }}>
                  <Typography variant="body2" sx={{ color: '#304B3A', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                    {duplicateComplaintData.description}
                  </Typography>
                </Box>
              </Box>

              {duplicateComplaintData.images && duplicateComplaintData.images.length > 0 && duplicateComplaintData.images[0] !== '' && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
                    ATTACHED EVIDENCE
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                    {duplicateComplaintData.images.map((img, idx) => (
                      <Box key={idx} component="img" src={img} sx={{ height: 110, width: 110, objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E8E4' }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#68706B' }}>No complaint data found for this identifier.</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #F3F5F2', justifyContent: 'space-between' }}>
          <Button onClick={() => setViewDuplicateOpen(false)} sx={{ color: '#68706B', textTransform: 'none', fontWeight: 600 }}>
            Back to Assignment
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {duplicateComplaintData && (
              <Button
                variant="outlined"
                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                onClick={() => window.open(`/councillor/complaints/${duplicateComplaintData.id}`, '_blank')}
                sx={{ color: '#496A57', borderColor: '#496A57', textTransform: 'none', fontWeight: 600 }}
              >
                Open Full Page
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => handleDuplicateLink(true)}
              disabled={aiLoading}
              sx={{ bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' }, textTransform: 'none', fontWeight: 600 }}
            >
              {aiLoading ? 'Linking...' : 'Link to this Duplicate Ticket'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Popup Message Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
