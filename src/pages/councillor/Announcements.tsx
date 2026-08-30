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
  Alert,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth } from '../../context/AuthContext';
import { noticeService } from '../../services/noticeService';
import { WardNotice, NoticePriority } from '../../types';
import { CustomTextField } from '../../components/common/CustomTextField';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const WARDS_SCOPE_OPTIONS = [
  'System Wide (All Registered Users)',
  'Ward 1 - Central Town',
  'Ward 2 - Riverside North',
  'Ward 3 - Heritage Hill',
  'Ward 4 - Green Valley South',
  'Ward 5 - Industrial Park East',
  'Ward 6 - Metro Station West',
  'Ward 7 - Suburbia Heights'
];

const CATEGORY_OPTIONS = [
  'Utility Maintenance',
  'Water Supply Advisory',
  'Public Health & Sanitation',
  'Civic Townhall Meeting',
  'Infrastructure & Roadwork',
  'Monsoon / Weather Alert',
  'Emergency Circular'
];

export const Announcements: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<WardNotice[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Utility Maintenance');
  const [targetScope, setTargetScope] = useState(
    user?.ward ? `Ward 1 - Central Town` : 'System Wide (All Registered Users)'
  );
  const [priority, setPriority] = useState<NoticePriority>('IMPORTANT');
  const [content, setContent] = useState('');

  // Attachment states
  const [attachmentFile, setAttachmentFile] = useState<{
    name: string;
    url: string;
    type: 'image' | 'pdf' | 'other';
  } | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState('');
  const [previewNotice, setPreviewNotice] = useState<WardNotice | null>(null);

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

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.includes('pdf')
      ? 'pdf'
      : file.type.includes('image')
      ? 'image'
      : 'other';

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentFile({
        name: file.name,
        url: event.target?.result as string,
        type: fileType
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setPublishing(true);
    try {
      const councillorName = user?.fullName || 'Councillor Rajesh Kumar';

      const newNotice = await noticeService.createNotice({
        title,
        category,
        ward: targetScope,
        priority,
        content,
        publishedBy: councillorName,
        publishedByRole: 'Ward Councillor',
        attachmentUrl: attachmentFile?.url,
        attachmentName: attachmentFile?.name,
        attachmentType: attachmentFile?.type
      });

      setNotices([newNotice, ...notices]);
      setSuccess(`Official Bulletin broadcasted successfully to all users! Notification alerts sent.`);
      setTitle('');
      setContent('');
      setAttachmentFile(null);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Ward Broadcast Engine..." />;

  const isCouncillorOrAdmin = user?.role === 'COUNCILLOR' || user?.role === 'ADMIN';

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Chip
            icon={<VerifiedUserIcon style={{ fontSize: 16, color: '#304B3A' }} />}
            label="Official Councillor Portal"
            size="small"
            sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', fontWeight: 600 }}
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#202522', letterSpacing: '-0.015em' }}>
          Publish Ward Announcements & Bulletins
        </Typography>
        <Typography variant="body2" sx={{ color: '#68706B', mt: 0.5 }}>
          Broadcast official civic notices, maintenance circulars, and emergency alerts to all registered citizens.
        </Typography>
      </Box>

      {!isCouncillorOrAdmin && (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          You are currently viewing the Notice Publisher in preview mode. Formal publishing privileges are reserved for Ward Councillors.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column: Broadcast Creation Form */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '12px',
              border: '1px solid #E5E8E4',
              backgroundColor: '#FFFFFF'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  backgroundColor: '#E8EFE9',
                  color: '#496A57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CampaignIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', fontSize: '1.1rem' }}>
                  Create Official Broadcast Notice
                </Typography>
                <Typography variant="caption" sx={{ color: '#68706B' }}>
                  Notifies all registered residents via notification alerts
                </Typography>
              </Box>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handlePublishNotice}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    label="Bulletin Headline / Notice Title"
                    placeholder="e.g. Scheduled Main Feeder Pipe Replacement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    label="Notice Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NoticePriority)}
                    required
                    fullWidth
                  >
                    <MenuItem value="NORMAL">Normal Bulletin</MenuItem>
                    <MenuItem value="IMPORTANT">Important Advisory</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency Alert</MenuItem>
                  </CustomTextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    label="Target Audience / Ward Scope"
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                    required
                    fullWidth
                  >
                    {WARDS_SCOPE_OPTIONS.map((w) => (
                      <MenuItem key={w} value={w}>
                        {w}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    select
                    label="Category Classification"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    fullWidth
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    label="Full Notice Description & About Details"
                    placeholder="Provide clear details regarding timings, affected areas, guidelines, and helpline contacts..."
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>

                {/* File Attachment Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                    Attach Circular Form / Poster / Image (PDF or Image)
                  </Typography>

                  {attachmentFile ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        border: '1px solid #496A57',
                        backgroundColor: '#E8EFE9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {attachmentFile.type === 'pdf' ? (
                          <PictureAsPdfIcon sx={{ color: '#B45D59' }} />
                        ) : (
                          <ImageIcon sx={{ color: '#496A57' }} />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                            {attachmentFile.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#68706B' }}>
                            {attachmentFile.type.toUpperCase()} Document Ready to Broadcast
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => setAttachmentFile(null)} sx={{ color: '#B45D59' }}>
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ) : (
                    <Box
                      component="label"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        borderRadius: '8px',
                        border: '1.5px dashed #C3CBC5',
                        backgroundColor: '#F8F9F7',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: '#496A57',
                          backgroundColor: '#E8EFE9'
                        }
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 32, color: '#496A57', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        Click to Upload Form, Poster, or Circular
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        Supports PDF, PNG, JPG (e.g., Application Forms, Ward Posters)
                      </Typography>

                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                      />
                    </Box>
                  )}
                </Grid>

                {/* Issuing Councillor Signature Info */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid #E5E8E4',
                      backgroundColor: '#F8F9F7'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block' }}>
                      ISSUING COUNCILLOR SIGNATURE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                      Published by: {user?.fullName || 'Councillor Rajesh Kumar'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#496A57' }}>
                      {user?.ward || 'Ward 1 - Central Town'} Councillor Desk
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <CustomButton
                    type="submit"
                    startIcon={<CampaignIcon />}
                    loading={publishing}
                    sx={{
                      backgroundColor: '#496A57',
                      px: 4,
                      py: 1.2,
                      fontSize: '0.9rem',
                      '&:hover': { backgroundColor: '#304B3A' }
                    }}
                  >
                    Broadcast Notice to All Users
                  </CustomButton>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>

        {/* Right Column: Published Bulletins Feed */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522' }}>
              Published Ward Bulletins Feed
            </Typography>
            <Chip label={`${notices.length} Active`} size="small" sx={{ bgcolor: '#E8EFE9', color: '#304B3A', fontWeight: 600 }} />
          </Box>

          <Stack spacing={2.5}>
            {notices.map((n) => {
              const isEmergency = n.priority === 'EMERGENCY';
              const isImportant = n.priority === 'IMPORTANT';

              return (
                <Card
                  key={n.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '10px',
                    border: '1px solid #E5E8E4',
                    backgroundColor: '#FFFFFF',
                    transition: 'box-shadow 0.15s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <CardContent sx={{ p: '0 !important' }}>
                    {/* Header line */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={n.priority}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 22,
                            backgroundColor: isEmergency ? '#FDE8E8' : isImportant ? '#FBF4E8' : '#E8EFE9',
                            color: isEmergency ? '#B45D59' : isImportant ? '#B58A45' : '#304B3A'
                          }}
                        />
                        <Chip
                          label={n.category}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: '#E5E8E4', color: '#68706B', fontSize: '0.7rem', height: 22 }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {new Date(n.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Box>

                    {/* Title */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 1, lineHeight: 1.3 }}>
                      {n.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#68706B',
                        mb: 2,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {n.content}
                    </Typography>

                    {/* Attachment preview if present */}
                    {n.attachmentName && (
                      <Paper
                        elevation={0}
                        onClick={() => setPreviewNotice(n)}
                        sx={{
                          p: 1.5,
                          mb: 2,
                          borderRadius: '6px',
                          border: '1px solid #E5E8E4',
                          backgroundColor: '#F8F9F7',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          '&:hover': { backgroundColor: '#E8EFE9' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {n.attachmentType === 'pdf' ? (
                            <PictureAsPdfIcon sx={{ color: '#B45D59', fontSize: 20 }} />
                          ) : (
                            <ImageIcon sx={{ color: '#496A57', fontSize: 20 }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#202522', fontSize: '0.85rem' }}>
                            {n.attachmentName}
                          </Typography>
                        </Box>

                        <Chip
                          label="View Attachment"
                          size="small"
                          icon={<OpenInNewIcon style={{ fontSize: 14 }} />}
                          sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#FFFFFF', border: '1px solid #E5E8E4' }}
                        />
                      </Paper>
                    )}

                    {/* Councillor attribution footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #F3F5F2' }}>
                      <Typography variant="caption" sx={{ color: '#304B3A', fontWeight: 600 }}>
                        📢 Published by {n.publishedBy} • ({n.ward})
                      </Typography>

                      <Button
                        size="small"
                        onClick={() => setPreviewNotice(n)}
                        endIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                        sx={{ color: '#496A57', textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', p: 0 }}
                      >
                        Read Notice
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Grid>
      </Grid>

      {/* Notice Preview & Attachment Dialog */}
      <Dialog
        open={Boolean(previewNotice)}
        onClose={() => setPreviewNotice(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}
      >
        {previewNotice && (
          <>
            <DialogTitle sx={{ fontWeight: 600, color: '#202522', pt: 3 }}>
              {previewNotice.title}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={previewNotice.ward} size="small" sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', fontWeight: 600 }} />
                <Chip label={previewNotice.category} size="small" sx={{ backgroundColor: '#F8F9F7', color: '#68706B' }} />
                <Chip
                  label={new Date(previewNotice.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  size="small"
                  sx={{ backgroundColor: '#F8F9F7', color: '#68706B' }}
                />
              </Box>

              <Typography variant="body1" sx={{ color: '#202522', lineHeight: 1.7, mb: 3 }}>
                {previewNotice.content}
              </Typography>

              {/* Attachment Display */}
              {previewNotice.attachmentUrl && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                    Attached Poster / Circular Form:
                  </Typography>
                  {previewNotice.attachmentType === 'image' ? (
                    <Box
                      component="img"
                      src={previewNotice.attachmentUrl}
                      alt={previewNotice.attachmentName || 'Notice Attachment'}
                      sx={{ width: '100%', maxHeight: 350, objectFit: 'contain', borderRadius: '8px', border: '1px solid #E5E8E4' }}
                    />
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#F8F9F7', textAlign: 'center' }}
                    >
                      <PictureAsPdfIcon sx={{ fontSize: 44, color: '#B45D59', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                        {previewNotice.attachmentName}
                      </Typography>
                      <Button
                        component="a"
                        href={previewNotice.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        startIcon={<OpenInNewIcon />}
                        sx={{ mt: 2, borderRadius: '6px', borderColor: '#496A57', color: '#496A57' }}
                      >
                        Open / Download PDF Document
                      </Button>
                    </Paper>
                  )}
                </Box>
              )}

              <Paper elevation={0} sx={{ p: 2, borderRadius: '8px', backgroundColor: '#F8F9F7', border: '1px solid #E5E8E4' }}>
                <Typography variant="caption" sx={{ color: '#68706B', display: 'block', fontWeight: 600 }}>
                  ISSUING AUTHORITATIVE COUNCILLOR
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                  {previewNotice.publishedBy} ({previewNotice.ward})
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                onClick={() => setPreviewNotice(null)}
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#496A57',
                  px: 4,
                  fontWeight: 500,
                  '&:hover': { backgroundColor: '#304B3A' }
                }}
              >
                Close Bulletin
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Announcements;
