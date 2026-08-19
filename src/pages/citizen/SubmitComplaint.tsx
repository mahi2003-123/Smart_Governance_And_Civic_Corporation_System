import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { WardSelector } from '../../components/common/WardSelector';
import { ImageUpload } from '../../components/common/ImageUpload';
import { ComplaintCategory, ComplaintPriority } from '../../types';

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads & Potholes');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(user?.ward || 'Ward 1 - Central Town');
  const [locationAddress, setLocationAddress] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [submittedData, setSubmittedData] = useState<{
    trackingNumber: string;
    ward: string;
    category: string;
    date: string;
    status: string;
  } | null>(null);

  const categories: ComplaintCategory[] = [
    'Roads & Potholes',
    'Water Supply',
    'Waste Management',
    'Sewage & Drainage',
    'Street Lighting',
    'Parks & Recreation',
    'Public Safety',
    'Other',
  ];

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
      const created = await complaintService.createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        ward,
        locationAddress: locationAddress.trim(),
        priority,
        images,
        citizenId: user?.id || 'usr_citizen_01',
        citizenName: user?.fullName || 'Rahul Sharma',
        citizenPhone: user?.phone || '+91 98765 43210',
      });

      setSubmittedData({
        trackingNumber: created.trackingNumber,
        ward: created.ward,
        category: created.category,
        date: new Date(created.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: created.status,
      });
    } catch {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', py: 6, px: 2 }}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircleOutlinedIcon sx={{ fontSize: 48 }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
            Complaint Submitted Successfully
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', mb: 3 }}>
            Your civic complaint has been registered and routed to your ward councillor.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              mb: 4,
              textAlign: 'left',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                REFERENCE NUMBER
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB', letterSpacing: '0.04em' }}>
                {submittedData.trackingNumber}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, fontSize: '0.9rem' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                  Ward
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {submittedData.ward}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                  Category
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {submittedData.category}
                </Typography>
              </Box>

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                  Submitted Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {submittedData.date}
                </Typography>
              </Box>

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                  Current Status
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#D97706' }}>
                  PENDING
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() => navigate(`/citizen/track?ref=${submittedData.trackingNumber}`)}
              sx={{
                borderRadius: '20px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': { backgroundColor: '#1D4ED8' },
              }}
            >
              Track Complaint
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/citizen/complaints')}
              sx={{
                borderRadius: '20px',
                borderColor: '#E2E8F0',
                color: '#0F172A',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                textTransform: 'none',
                backgroundColor: '#FFFFFF',
                '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
              }}
            >
              My Complaints
            </Button>

            <Button
              variant="text"
              onClick={() => {
                setSubmittedData(null);
                setTitle('');
                setDescription('');
                setLocationAddress('');
                setImages([]);
              }}
              sx={{
                color: '#64748B',
                fontWeight: 600,
                py: 1.2,
                textTransform: 'none',
              }}
            >
              Report Another Issue
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
          Report a Civic Issue
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Submit public grievances directly to your municipal ward councillor for inspection and repair.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Title */}
            <TextField
              fullWidth
              id="complaint-title-field"
              label="Complaint Title"
              placeholder="e.g. Deep Pothole near Central Market Gate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={textFieldStyles}
            />

            {/* Category & Manual Ward Dropdown */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                select
                fullWidth
                id="complaint-category-field"
                label="Complaint Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                required
                sx={textFieldStyles}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              {/* MANUAL WARD SELECTION */}
              <WardSelector
                value={ward}
                onChange={(val) => setWard(val)}
                label="Ward"
                required
                helperText="Select your municipal ward manually"
              />
            </Box>

            {/* Description */}
            <TextField
              fullWidth
              multiline
              rows={4}
              id="complaint-description-field"
              label="Description"
              placeholder="Describe the complaint in detail, including physical condition, time observed, and any safety hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              sx={textFieldStyles}
            />

            {/* Location Address */}
            <TextField
              fullWidth
              id="complaint-location-field"
              label="Location / Address"
              placeholder="e.g. Opposite City Bank, Main Street"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={textFieldStyles}
            />

            {/* Photo Attachment UI */}
            <ImageUpload
              images={images}
              onChange={(newImages) => setImages(newImages)}
              maxImages={3}
              label="Photo (Attach complaint image)"
              helperText="Upload clear images of the site condition"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              startIcon={<AssignmentTurnedInIcon />}
              sx={{
                py: 1.6,
                borderRadius: '16px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': {
                  backgroundColor: '#1D4ED8',
                },
              }}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    fontSize: '0.925rem',
    '& fieldset': {
      borderColor: '#E2E8F0',
    },
    '&:hover fieldset': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748B',
    fontSize: '0.925rem',
    '&.Mui-focused': {
      color: '#2563EB',
      fontWeight: 600,
    },
  },
};

export default SubmitComplaint;
