import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Divider,
  Stack,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { noticeService } from '../../services/noticeService';
import { WardNotice } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WARDS_LIST } from '../../constants';

export const Notices: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<WardNotice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<WardNotice | null>(null);

  // Filters
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Water Supply', 'Road Work', 'Power Outage', 'Public Health', 'General Alert'];

  const loadNotices = async () => {
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
    loadNotices();
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesWard = wardFilter === 'ALL' || n.ward === wardFilter;
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    return matchesWard && matchesCategory;
  });

  if (loading) return <LoadingSpinner message="Loading Official Bulletins..." />;

  return (
    <Box sx={{ pb: 8, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1, letterSpacing: '-0.015em' }}>
          Ward Notices & Bulletins
        </Typography>
        <Typography variant="body1" sx={{ color: '#68706B' }}>
          Official municipal announcements, water shutdown alerts, scheduled roadwork, and public health advisories.
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ p: 2, mb: 4, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter by Ward"
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCityIcon sx={{ color: '#68706B', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          >
            <MenuItem value="ALL">All Municipal Wards</MenuItem>
            {WARDS_LIST.map((w) => (
              <MenuItem key={w} value={w}>
                {w}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon sx={{ color: '#68706B', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Editorial Notices List */}
      {filteredNotices.length === 0 ? (
        <Box sx={{ p: 6, textAlign: 'center', borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
          <Typography variant="body1" sx={{ color: '#68706B' }}>
            No municipal notices match your selected filters.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0} sx={{ border: '1px solid #E5E8E4', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
          {filteredNotices.map((item, idx) => {
            const isEmergency = item.priority === 'EMERGENCY';
            const formattedDate = new Date(item.publishDate)
              .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
              .toUpperCase();

            return (
              <Box
                key={item.id}
                onClick={() => setSelectedNotice(item)}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderBottom: idx < filteredNotices.length - 1 ? '1px solid #E5E8E4' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: '#F8F9F7',
                    '& .notice-title': { color: '#496A57' },
                  },
                }}
              >
                {/* Meta line: NOTICE • DATE • WARD */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isEmergency ? '#B45D59' : '#496A57', letterSpacing: '0.06em' }}>
                    {isEmergency ? 'EMERGENCY ALERT' : 'NOTICE'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    • {formattedDate}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    • {item.ward}
                  </Typography>
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', fontSize: '0.725rem', height: 20 }}
                  />
                </Box>

                {/* Title */}
                <Typography
                  className="notice-title"
                  variant="h3"
                  sx={{
                    fontWeight: 600,
                    color: '#202522',
                    mb: 1,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item.title}
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
                    overflow: 'hidden',
                  }}
                >
                  {item.content}
                </Typography>

                {/* Action & Attachment Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#304B3A', fontWeight: 600 }}>
                    📢 Published by {item.publishedBy} • ({item.ward})
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1}>
                    {item.attachmentName && (
                      <Chip
                        label={item.attachmentName}
                        size="small"
                        sx={{ backgroundColor: '#F8F9F7', border: '1px solid #E5E8E4', color: '#496A57', fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                    <Typography variant="body2" sx={{ color: '#496A57', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      View notice <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Notice Detail Dialog */}
      <Dialog
        open={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '12px', p: 1 },
          },
        }}
      >
        {selectedNotice && (
          <>
            <DialogTitle sx={{ fontWeight: 600, color: '#202522', pt: 3 }}>
              {selectedNotice.title}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={selectedNotice.ward} size="small" sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', fontWeight: 600 }} />
                <Chip label={selectedNotice.category} size="small" sx={{ backgroundColor: '#F8F9F7', color: '#68706B' }} />
                <Chip
                  label={new Date(selectedNotice.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  size="small"
                  sx={{ backgroundColor: '#F8F9F7', color: '#68706B' }}
                />
              </Box>

              <Typography variant="body1" sx={{ color: '#202522', lineHeight: 1.7, mb: 3 }}>
                {selectedNotice.content}
              </Typography>

              {/* Attachment Display */}
              {selectedNotice.attachmentUrl && (
                <Box mb={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                    Attached Poster / Circular Document:
                  </Typography>
                  {selectedNotice.attachmentType === 'image' ? (
                    <Box
                      component="img"
                      src={selectedNotice.attachmentUrl}
                      alt={selectedNotice.attachmentName || 'Notice Poster'}
                      sx={{ width: '100%', maxHeight: 350, objectFit: 'contain', borderRadius: '8px', border: '1px solid #E5E8E4' }}
                    />
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#F8F9F7', textAlign: 'center' }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522', mb: 1 }}>
                        📄 {selectedNotice.attachmentName || 'Ward_Circular_Form.pdf'}
                      </Typography>
                      <Button
                        component="a"
                        href={selectedNotice.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        sx={{ borderRadius: '6px', borderColor: '#496A57', color: '#496A57' }}
                      >
                        Open / Download Attached PDF Form
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
                  {selectedNotice.publishedBy} ({selectedNotice.ward})
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                onClick={() => setSelectedNotice(null)}
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#496A57',
                  px: 4,
                  fontWeight: 500,
                  '&:hover': { backgroundColor: '#304B3A' },
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

export default Notices;
