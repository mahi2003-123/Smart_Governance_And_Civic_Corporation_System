import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAuth } from '../../context/AuthContext';
import { noticeService } from '../../services/noticeService';
import { WardNotice, NoticePriority } from '../../types';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WARDS_LIST } from '../../utils/constants';

export const Announcements: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<WardNotice[]>([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Utility Maintenance');
  const [ward, setWard] = useState(user?.ward || WARDS_LIST[0]);
  const [priority, setPriority] = useState<NoticePriority>('IMPORTANT');
  const [content, setContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await noticeService.getNotices();
      setNotices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setPublishing(true);
    try {
      const newN = await noticeService.createNotice({
        title,
        category,
        ward,
        priority,
        content,
        publishedBy: user?.fullName || 'Hon. Priya Verma',
      });
      setNotices([newN, ...notices]);
      setSuccess('Ward Notice successfully published to citizen portals!');
      setTitle('');
      setContent('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Ward Broadcast Bulletin..." />;

  return (
    <Box maxWidth="lg" mx="auto">
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800}>
          Publish Ward Announcements & Bulletins
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Broadcast civic notices directly to citizen dashboards and mobile alert feeds.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Broadcast Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Create Broadcast Notice
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handlePublishNotice}>
              <CustomTextField
                label="Bulletin Headline / Title"
                placeholder="e.g. Scheduled Water Supply Interruption"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    select
                    label="Notice Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NoticePriority)}
                    required
                  >
                    <MenuItem value="NORMAL">NORMAL</MenuItem>
                    <MenuItem value="IMPORTANT">IMPORTANT</MenuItem>
                    <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    select
                    label="Target Ward"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    required
                  >
                    {WARDS_LIST.map((w) => (
                      <MenuItem key={w} value={w}>
                        {w}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
              </Grid>

              <CustomTextField
                label="Category Tag"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

              <CustomTextField
                label="Full Notice Details"
                multiline
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />

              <Box display="flex" justifyContent="flex-end">
                <CustomButton type="submit" startIcon={<CampaignIcon />} loading={publishing}>
                  Publish Announcement
                </CustomButton>
              </Box>
            </form>
          </Card>
        </Grid>

        {/* Right Column: Published Notices List */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Recent Active Bulletins
          </Typography>

          <Stack spacing={2}>
            {notices.map((n) => (
              <Card key={n.id} sx={{ p: 2.5, borderRadius: 3 }}>
                <CardContent sx={{ p: '0 !important' }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Chip label={n.priority} size="small" color={n.priority === 'EMERGENCY' ? 'error' : 'warning'} sx={{ fontWeight: 700 }} />
                    <Chip label={n.ward} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {n.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {n.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Published: {new Date(n.publishDate).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
