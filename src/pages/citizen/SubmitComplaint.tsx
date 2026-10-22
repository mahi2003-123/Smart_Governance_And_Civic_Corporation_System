import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Paper,
  InputAdornment,
  MenuItem,
  Chip
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { WardSelector } from '../../components/common/WardSelector';
import { ImageUpload } from '../../components/common/ImageUpload';
import { ComplaintPriority } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  ROAD: 'Road Damage & Potholes',
  WATER_SUPPLY: 'Water Supply & Leakage',
  WASTE_MANAGEMENT: 'Garbage & Waste Disposal',
  DRAINAGE: 'Drainage & Sewage Overflow',
  STREET_LIGHT: 'Street Light Failure',
  PUBLIC_SPACE: 'Public Spaces & Parks',
  Other: 'Other Grievance',
  OTHER: 'Other Grievance',
};

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('AUTO');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(user?.ward || 'Ward 1 - Central Town');
  const [locationAddress, setLocationAddress] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [liveAiPrediction, setLiveAiPrediction] = useState<{
    category: string;
    confidence: number;
    priority?: string;
  } | null>(null);

  useEffect(() => {
    const text = (title + ' ' + description).trim();
    if (text.length < 3) {
      setLiveAiPrediction(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const pred = await complaintService.predictCategory(title, description);
        if (pred && pred.category && pred.category !== 'OTHER') {
          setLiveAiPrediction(pred);
          if (pred.priority === 'URGENT' && priority === 'MEDIUM') {
            setPriority('URGENT');
          }
        } else {
          setLiveAiPrediction(null);
        }
      } catch {
        setLiveAiPrediction(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [title, description]);

  const [submittedData, setSubmittedData] = useState<{
    trackingNumber: string;
    ward: string;
    date: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationAddress.trim()) {
      setError('Please complete all required fields (Title, Description, Address).');
      return;
    }

    if (!ward) {
      setError('Please select a ward from the dropdown.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const effectiveCategory = (category === 'AUTO' && liveAiPrediction?.category)
        ? liveAiPrediction.category
        : (category === 'AUTO' ? 'Other' : category);

      const created = await complaintService.createComplaint({
        title: title.trim(),
        category: effectiveCategory as any,
        description: description.trim(),
        ward,
        locationAddress: locationAddress.trim(),
        priority,
        images,
        citizenId: user?.id || 'usr_citizen_01',
        citizenName: user?.fullName || 'Citizen Resident',
        citizenPhone: user?.phone || '+91 98765 43210',
        aiSuggestedCategory: liveAiPrediction?.category,
        aiConfidence: liveAiPrediction?.confidence,
      });

      setSubmittedData({
        trackingNumber: created.trackingNumber,
        ward: created.ward,
        date: new Date(created.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      });
    } catch {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: '8px',
            border: '1px solid #E5E8E4',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#E8EFE9',
              color: '#304B3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <CheckCircleOutlinedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 600, color: '#202522', mb: 1, fontSize: '1.5rem' }}>
            Grievance Registered Successfully
          </Typography>
          <Typography variant="body1" sx={{ color: '#68706B', mb: 4 }}>
            Your complaint has been submitted and routed to your municipal ward councillor for inspection.
          </Typography>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '6px', backgroundColor: '#F8F9F7', border: '1px solid #E5E8E4', mb: 4, textAlign: 'left' }}>
             <Box sx={{ textAlign: 'center', mb: 2.5, pb: 2, borderBottom: '1px solid #E5E8E4' }}>
              <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
                COMPLAINT REFERENCE NUMBER
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#496A57', letterSpacing: '0.04em' }}>
                {submittedData.trackingNumber}
              </Typography>
             </Box>
             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, fontSize: '0.875rem' }}>
               <Box>
                 <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>Municipal Ward</Typography>
                 <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>{submittedData.ward}</Typography>
               </Box>
               <Box>
                 <Typography variant="caption" sx={{ color: '#68706B', display: 'block' }}>Submitted On</Typography>
                 <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522' }}>{submittedData.date}</Typography>
               </Box>
             </Box>
          </Paper>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => navigate(`/citizen/track?ref=${submittedData.trackingNumber}`)} sx={{ backgroundColor: '#496A57' }}>
              Track Status
            </Button>
            <Button variant="outlined" onClick={() => navigate('/citizen/complaints')} sx={{ borderColor: '#E5E8E4', color: '#202522' }}>
              My Complaints
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', pb: 8 }}>
      <Button
        startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
        onClick={() => {
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate('/citizen/dashboard');
          }
        }}
        sx={{ mb: 2, color: '#496A57', fontWeight: 600, textTransform: 'none', px: 0, '&:hover': { bgcolor: 'transparent', color: '#304B3A' } }}
      >
        Back to Dashboard
      </Button>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1, letterSpacing: '-0.015em' }}>
          Report a Civic Grievance
        </Typography>
        <Typography variant="body1" sx={{ color: '#68706B' }}>
          Submit public grievances directly to your municipal ward councillor for inspection and repair work assignment.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '6px' }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: { xs: 3, sm: 5 }, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}
      >
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Complaint Title *"
            placeholder="e.g. Deep Pothole near Central Market Gate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Grievance Description"
            placeholder="Describe the condition in detail, including street landmarks, severity, and any public safety hazard..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
            <TextField
              select
              fullWidth
              label="Civic Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              helperText="Select category or keep Auto-Detect (AI Classification)"
            >
              <MenuItem value="AUTO">🤖 Auto-Detect (AI Classification)</MenuItem>
              <MenuItem value="ROAD">Road Damage & Potholes</MenuItem>
              <MenuItem value="WATER_SUPPLY">Water Supply & Leakage</MenuItem>
              <MenuItem value="WASTE_MANAGEMENT">Garbage & Waste Disposal</MenuItem>
              <MenuItem value="DRAINAGE">Drainage & Sewage Overflow</MenuItem>
              <MenuItem value="STREET_LIGHT">Street Light Failure</MenuItem>
              <MenuItem value="PUBLIC_SPACE">Public Spaces & Parks</MenuItem>
              <MenuItem value="Other">Other Grievance</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Urgency / Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              helperText="Mark URGENT for critical public hazards"
            >
              <MenuItem value="LOW">Low - Routine</MenuItem>
              <MenuItem value="MEDIUM">Medium - Normal</MenuItem>
              <MenuItem value="HIGH">High - Important</MenuItem>
              <MenuItem value="URGENT">🚨 URGENT - Immediate Hazard</MenuItem>
            </TextField>
          </Box>

          {category === 'AUTO' && liveAiPrediction && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#166534', fontSize: '0.82rem' }}>
                  🤖 AI Detected:
                </Typography>
                <Chip
                  label={CATEGORY_LABELS[liveAiPrediction.category] || liveAiPrediction.category}
                  size="small"
                  sx={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                  }}
                />
                <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                  ({Math.round(liveAiPrediction.confidence * 100)}% accuracy)
                </Typography>
              </Box>
              {liveAiPrediction.priority === 'URGENT' && (
                <Chip
                  label="🚨 Critical Public Hazard Detected"
                  size="small"
                  sx={{ backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: 700, fontSize: '0.72rem' }}
                />
              )}
            </Box>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr' }, gap: 2.5 }}>
            <WardSelector
              value={ward}
              onChange={(val) => setWard(val)}
              label="Ward Jurisdiction *"
              required
              helperText="Select municipal ward for this complaint"
            />
          </Box>

          <TextField
            fullWidth
            label="Specific Location / Street Address"
            placeholder="e.g. Opposite City Bank, Main Street"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnOutlinedIcon sx={{ color: '#68706B', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <ImageUpload
            images={images}
            onChange={(newImages) => setImages(newImages)}
            maxImages={3}
            label="Attach Photo Evidence (Optional)"
            helperText="Upload clear images of the site condition"
          />

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            startIcon={<AssignmentTurnedInOutlinedIcon />}
            sx={{
              py: 1.3,
              borderRadius: '8px',
              backgroundColor: '#496A57',
              color: '#FFFFFF',
              fontWeight: 500,
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: '#304B3A',
              },
            }}
          >
            {loading ? 'Submitting Grievance...' : 'Submit Civic Complaint'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SubmitComplaint;
