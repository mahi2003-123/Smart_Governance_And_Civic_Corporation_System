import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  MenuItem,
  Button
} from '@mui/material';
import { Complaint, ComplaintPriority } from '../../types';
import { CustomTextField } from '../common/CustomTextField';
import { CustomButton } from '../common/CustomButton';
import { adminService } from '../../services/adminService';
import { matchesWard } from '../../utils/wardUtils';

interface AssignWorkerModalProps {
  open: boolean;
  complaint: Complaint | null;
  onClose: () => void;
  onConfirm: (workerId: string, workerName: string, priority: ComplaintPriority) => Promise<void>;
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  open,
  complaint,
  onClose,
  onConfirm,
}) => {
  const [workersList, setWorkersList] = useState<{ id: string; fullName: string; name: string; ward?: string }[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<ComplaintPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRegisteredWorkers = async () => {
      try {
        const users = await adminService.getUsers();
        const registered = users.filter((u) => u.role === 'WORKER' && (u.status || 'ACTIVE') === 'ACTIVE');
        
        if (registered.length > 0) {
          // Sort workers so those matching the complaint ward appear first, but ALL database workers remain available
          const sortedWorkers = [...registered].sort((a, b) => {
            const aMatch = complaint && complaint.ward ? matchesWard(a.ward, complaint.ward) : false;
            const bMatch = complaint && complaint.ward ? matchesWard(b.ward, complaint.ward) : false;
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return (a.fullName || '').localeCompare(b.fullName || '');
          });

          const list = sortedWorkers.map((w) => {
            const isWardMatch = complaint && complaint.ward ? matchesWard(w.ward, complaint.ward) : false;
            return {
              id: w.id,
              fullName: w.fullName,
              name: `${w.fullName} (${w.ward || 'Field Technician'})${isWardMatch ? ' ★ Ward Worker' : ''}`,
              ward: w.ward,
            };
          });
          
          setWorkersList(list);
          setSelectedWorkerId(list[0].id);

          if (complaint) {
            const cat = complaint.category?.toLowerCase() || '';
            const matched = list.find((w) => {
              const nameLower = w.name.toLowerCase();
              if ((cat.includes('water') || cat.includes('drainage') || cat.includes('sewage')) && nameLower.includes('water')) return true;
              if ((cat.includes('electric') || cat.includes('light') || cat.includes('power')) && nameLower.includes('electric')) return true;
              if ((cat.includes('waste') || cat.includes('sanitation') || cat.includes('garbage')) && nameLower.includes('sanitation')) return true;
              return false;
            });
            if (matched) setSelectedWorkerId(matched.id);
          }
        } else {
          setWorkersList([]);
          setSelectedWorkerId('');
        }
      } catch (e) {
        console.error('Failed to load registered workers from database:', e);
        setWorkersList([]);
        setSelectedWorkerId('');
      }
    };

    if (open) {
      loadRegisteredWorkers();
    }
  }, [open, complaint]);

  useEffect(() => {
    if (complaint) {
      setSelectedPriority(complaint.priority || 'MEDIUM');
      if (complaint.assignedWorkerId && workersList.some((w) => w.id === complaint.assignedWorkerId)) {
        setSelectedWorkerId(complaint.assignedWorkerId);
      }
    }
  }, [complaint, workersList]);

  const handleConfirm = async () => {
    if (!selectedWorkerId) {
      alert('Please select an active registered technician to assign.');
      return;
    }

    const worker = workersList.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    setLoading(true);
    try {
      await onConfirm(worker.id, worker.fullName, selectedPriority);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: '#202522', fontSize: '1.15rem' }}>
        Review Grievance & Assign Technician
      </DialogTitle>
      <DialogContent>
        {complaint && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#304B3A', fontWeight: 600, mb: 0.5 }}>
              {complaint.trackingNumber}: {complaint.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#68706B', mb: 3 }}>
              Category: {complaint.category} | Ward: {complaint.ward} | Location: {complaint.locationAddress}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <CustomTextField
                select
                label="Assign Priority / Risk Level"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as ComplaintPriority)}
                fullWidth
              >
                <MenuItem value="LOW">Low Priority</MenuItem>
                <MenuItem value="MEDIUM">Medium Priority</MenuItem>
                <MenuItem value="HIGH">High Priority</MenuItem>
                <MenuItem value="URGENT">Urgent Risk</MenuItem>
              </CustomTextField>

              <CustomTextField
                select
                label="Select Available Technician"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                fullWidth
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 280,
                        borderRadius: '8px',
                        border: '1px solid #E5E8E4',
                      },
                    },
                  },
                } as any}
              >
                {workersList.length === 0 ? (
                  <MenuItem disabled value="">
                    No active registered technicians available in database
                  </MenuItem>
                ) : (
                  workersList.map((w) => (
                    <MenuItem key={w.id} value={w.id} sx={{ py: 1, fontWeight: 500, fontSize: '0.85rem' }}>
                      {w.name}
                    </MenuItem>
                  ))
                )}
              </CustomTextField>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: '8px', textTransform: 'none', color: '#68706B', fontWeight: 500 }}>
          Cancel
        </Button>
        <CustomButton
          loading={loading}
          disabled={workersList.length === 0 || !selectedWorkerId}
          onClick={handleConfirm}
          sx={{ backgroundColor: '#496A57', '&:hover': { backgroundColor: '#304B3A' } }}
        >
          Confirm Triage & Assign
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
