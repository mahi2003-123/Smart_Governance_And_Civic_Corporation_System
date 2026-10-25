import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { ImageUpload } from '../../components/common/ImageUpload';

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const ward = user?.ward || 'Ward 1 - Central Town';
  const [locationAddress, setLocationAddress] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    const complaintWard = user?.ward || ward || 'Ward 1 - Central Town';

    setLoading(true);
    setError('');

    try {
      const created = await complaintService.createComplaint({
        title: title.trim(),
        category: 'OTHER',
        description: description.trim(),
        ward: complaintWard,
        locationAddress: locationAddress.trim(),
        priority: 'MEDIUM',
        images,
        citizenId: user?.id || 'usr_citizen_01',
        citizenName: user?.fullName || 'Citizen Resident',
        citizenPhone: user?.phone || '+91 98765 43210',
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
          Submit public grievances directly to your municipal ward councillor. Your ward councillor will assess the grievance, determine the civic category and urgency level, and dispatch repair field staff.
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
            id="complaint-title-input"
            fullWidth
            label="Complaint Title *"
            placeholder="e.g. Deep Pothole near Central Market Gate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            id="complaint-description-input"
            fullWidth
            multiline
            rows={4}
            label="Grievance Description"
            placeholder="Describe the condition in detail, including street landmarks, severity, and any public safety hazard..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />



          <TextField
            id="complaint-location-input"
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
            id="complaint-submit-btn"
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
