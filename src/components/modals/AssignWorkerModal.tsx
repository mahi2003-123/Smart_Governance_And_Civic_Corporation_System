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

interface AssignWorkerModalProps {
  open: boolean;
  complaint: Complaint | null;
  onClose: () => void;
  onConfirm: (workerId: string, workerName: string, priority: ComplaintPriority) => Promise<void>;
}

const DEFAULT_WORKERS = [
  { id: 'usr_worker_01', name: 'Amit Kumar (Public Works Dept)' },
  { id: 'usr_worker_02', name: 'Suresh Patil (Water & Drainage Dept)' },
  { id: 'usr_worker_03', name: 'Vikas Singh (Electrical Maintenance)' },
];

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  open,
  complaint,
  onClose,
  onConfirm,
}) => {
  const [workersList, setWorkersList] = useState<{ id: string; name: string }[]>(DEFAULT_WORKERS);
  const [selectedWorkerId, setSelectedWorkerId] = useState(DEFAULT_WORKERS[0].id);
  const [selectedPriority, setSelectedPriority] = useState<ComplaintPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRegisteredWorkers = async () => {
      try {
        const users = await adminService.getUsers();
        const registered = users.filter((u) => u.role === 'WORKER');
        
        if (registered.length > 0) {
          const map = new Map<string, { id: string; name: string }>();
          
          // Add registered workers
          registered.forEach((w) => {
            map.set(w.id, {
              id: w.id,
              name: `${w.fullName} (${w.ward || 'Field Technician'})`,
            });
          });
          
          // Fallback defaults if map is missing any
          DEFAULT_WORKERS.forEach((dw) => {
            if (!map.has(dw.id)) {
              map.set(dw.id, dw);
            }
          });
          
          const combined = Array.from(map.values());
          setWorkersList(combined);

          // Auto-select match if complaint has category
          if (complaint) {
            const cat = complaint.category?.toLowerCase() || '';
            if (cat.includes('water') || cat.includes('drainage') || cat.includes('sewage')) {
              const matched = combined.find((w) => w.name.toLowerCase().includes('suresh') || w.name.toLowerCase().includes('water'));
              if (matched) setSelectedWorkerId(matched.id);
            } else if (cat.includes('electric') || cat.includes('light')) {
              const matched = combined.find((w) => w.name.toLowerCase().includes('vikas') || w.name.toLowerCase().includes('electric'));
              if (matched) setSelectedWorkerId(matched.id);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load registered workers:', e);
      }
    };

    if (open) {
      loadRegisteredWorkers();
    }
  }, [open, complaint]);

  useEffect(() => {
    if (complaint) {
      setSelectedPriority(complaint.priority || 'MEDIUM');
      if (complaint.assignedWorkerId) {
        setSelectedWorkerId(complaint.assignedWorkerId);
      }
    }
  }, [complaint]);

  const handleConfirm = async () => {
    const worker = workersList.find((w) => w.id === selectedWorkerId) || DEFAULT_WORKERS[0];
    if (!worker) return;

    setLoading(true);
    try {
      await onConfirm(worker.id, worker.name, selectedPriority);
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
              Category: {complaint.category} | Location: {complaint.locationAddress}
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
                {workersList.map((w) => (
                  <MenuItem key={w.id} value={w.id} sx={{ py: 1, fontWeight: 500, fontSize: '0.85rem' }}>
                    {w.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: '8px', textTransform: 'none', color: '#68706B', fontWeight: 500 }}>
          Cancel
        </Button>
        <CustomButton loading={loading} onClick={handleConfirm} sx={{ backgroundColor: '#496A57', '&:hover': { backgroundColor: '#304B3A' } }}>
          Confirm Triage & Assign
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
