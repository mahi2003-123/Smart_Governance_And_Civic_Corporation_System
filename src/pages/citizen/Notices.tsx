import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
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
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationCityIcon from '@mui/icons-material/LocationCity';
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

  if (loading) return <LoadingSpinner message="Loading Ward Announcements..." />;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
          Ward Notices & Bulletins
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Official municipal announcements, water shutdown alerts, roadwork notices, and ward bulletins.
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: '20px', border: '1px solid #E2E8F0' }}>
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
                    <LocationCityIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={textFieldStyles}
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
                    <FilterListIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={textFieldStyles}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Notices Grid */}
      {filteredNotices.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
            No ward notices match your selected filters.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {filteredNotices.map((item) => (
            <Card
              key={item.id}
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#BFDBFE',
                  boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 700, borderRadius: '8px' }}
                    />
                    <Chip
                      label={item.priority}
                      size="small"
                      icon={item.priority === 'EMERGENCY' ? <PriorityHighIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: item.priority === 'EMERGENCY' ? '#FEE2E2' : '#F1F5F9',
                        color: item.priority === 'EMERGENCY' ? '#DC2626' : '#64748B',
                        borderRadius: '8px',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                    <CalendarTodayIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {new Date(item.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    mb: 3,
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.content}
                </Typography>
              </Box>

              <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block' }}>
                    {item.ward}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Issued by: {item.publishedBy}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  onClick={() => setSelectedNotice(item)}
                  startIcon={<InfoOutlinedIcon fontSize="small" />}
                  sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'none' }}
                >
                  Read Notice
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Notice Detail Dialog */}
      <Dialog
        open={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 1 },
          },
        }}
      >
        {selectedNotice && (
          <>
            <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pt: 3 }}>
              {selectedNotice.title}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={selectedNotice.ward}
                  size="small"
                  sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 700 }}
                />
                <Chip
                  label={selectedNotice.category}
                  size="small"
                  sx={{ backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: 600 }}
                />
                <Chip
                  label={new Date(selectedNotice.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  size="small"
                  sx={{ backgroundColor: '#F8FAFC', color: '#64748B' }}
                />
              </Box>

              <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, mb: 3 }}>
                {selectedNotice.content}
              </Typography>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                  ISSUING AUTHORITY
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {selectedNotice.publishedBy} ({selectedNotice.ward})
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                onClick={() => setSelectedNotice(null)}
                variant="contained"
                sx={{
                  borderRadius: '16px',
                  backgroundColor: '#2563EB',
                  px: 4,
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#1D4ED8' },
                }}
              >
                Close Notice
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9rem',
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
};

export default Notices;
