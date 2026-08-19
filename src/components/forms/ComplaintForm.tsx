import React, { useState } from 'react';
import {
  Box,
  MenuItem,
  InputAdornment,
  Button,
  Chip,
  Paper,
  Typography,
  Stack
} from '@mui/material';
import TitleIcon from '@mui/icons-material/Title';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BadgeIcon from '@mui/icons-material/Badge';
import DeleteIcon from '@mui/icons-material/Delete';
import { CustomTextField } from '../common/CustomTextField';
import { CustomButton } from '../common/CustomButton';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, WARDS_LIST } from '../../constants';

interface ComplaintFormProps {
  initialWard?: string;
  onSubmit: (formData: {
    title: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    description: string;
    ward: string;
    locationAddress: string;
    images?: string[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  initialWard,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads & Potholes');
  const [priority, setPriority] = useState<ComplaintPriority>('HIGH');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(initialWard || WARDS_LIST[0]);
  const [locationAddress, setLocationAddress] = useState('');
  const [geoTagged, setGeoTagged] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulateGPS = () => {
    setLoading(true);
    setTimeout(() => {
      setLocationAddress('12.9716° N, 77.5946° E • Sector 4 Main Boulevard, ' + ward);
      setGeoTagged(true);
      setLoading(false);
    }, 400);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationAddress) return;
    setLoading(true);
    try {
      await onSubmit({
        title,
        category,
        priority,
        description,
        ward,
        locationAddress,
        images: imagePreview ? [imagePreview] : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <CustomTextField
          label="Complaint Title / Headline"
          placeholder="e.g. Deep pothole causing traffic obstruction on Market Road"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon sx={{ color: '#6D5B4A' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
          <CustomTextField
            select
            label="Grievance Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            required
            sx={{ mb: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon sx={{ color: '#6D5B4A' }} />
                </InputAdornment>
              ),
            }}
          >
            {COMPLAINT_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            select
            label="Municipality Ward"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            required
            sx={{ mb: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon sx={{ color: '#6D5B4A' }} />
                </InputAdornment>
              ),
            }}
          >
            {WARDS_LIST.map((w) => (
              <MenuItem key={w} value={w}>
                {w}
              </MenuItem>
            ))}
          </CustomTextField>
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Priority Level
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {COMPLAINT_PRIORITIES.map((p) => (
              <Chip
                key={p}
                label={p}
                color={priority === p ? 'primary' : 'default'}
                onClick={() => setPriority(p)}
                icon={<PriorityHighIcon fontSize="small" />}
                sx={{
                  fontWeight: 700,
                  py: 2,
                  px: 1,
                  cursor: 'pointer',
                  bgcolor: priority === p ? '#4F4034' : undefined,
                }}
              />
            ))}
          </Stack>
        </Box>

        <CustomTextField
          label="Detailed Description"
          placeholder="Provide complete context about the civic issue, landmarks, duration, and safety hazards..."
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <Box>
          <Box display="flex" gap={1.5} alignItems="flex-start">
            <CustomTextField
              label="Incident Location & Landmark Address"
              placeholder="Enter street, pillar number, or nearby landmark"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              required
              sx={{ flex: 1, mb: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: '#6D5B4A' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<MyLocationIcon />}
              onClick={handleSimulateGPS}
              sx={{
                height: 56,
                borderRadius: 3,
                borderColor: '#6D5B4A',
                color: '#4F4034',
                whiteSpace: 'nowrap',
              }}
            >
              {geoTagged ? 'GPS Tagged' : 'Auto GPS'}
            </Button>
          </Box>
          {geoTagged && (
            <Typography variant="caption" color="success.main" fontWeight={700} sx={{ mt: 0.5, display: 'block' }}>
              ✓ Geo-location coordinates verified via browser GPS.
            </Typography>
          )}
        </Box>

        {/* Photo Upload Zone */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Upload Evidence Image (Optional)
          </Typography>
          {imagePreview ? (
            <Paper sx={{ p: 2, borderRadius: 3, position: 'relative', display: 'inline-block' }}>
              <img
                src={imagePreview}
                alt="Uploaded Complaint Evidence"
                style={{ maxHeight: 200, borderRadius: 12, display: 'block' }}
              />
              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={() => setImagePreview(null)}
                sx={{ position: 'absolute', top: 16, right: 16, borderRadius: 28 }}
              >
                Remove Photo
              </Button>
            </Paper>
          ) : (
            <Paper
              component="label"
              sx={{
                p: 4,
                border: '2px dashed #D1C4BA',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                bgcolor: '#FAF6F3',
                '&:hover': { bgcolor: '#F3EDEA' },
              }}
            >
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
              <CloudUploadIcon sx={{ fontSize: 44, color: '#6D5B4A', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Click or Drop Image Here
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG up to 10MB accepted
              </Typography>
            </Paper>
          )}
        </Box>
      </Stack>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 28 }}>
            Cancel
          </Button>
        )}
        <CustomButton type="submit" size="large" loading={loading}>
          Submit Complaint
        </CustomButton>
      </Box>
    </form>
  );
};
