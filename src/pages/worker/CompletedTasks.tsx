import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Grid, Chip, CardMedia, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CompletedTasks: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completedList, setCompletedList] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await complaintService.getComplaints({
          status: 'RESOLVED',
        });
        const myCompleted = data.filter((c) => {
          if (!user) return false;
          if (c.assignedWorkerId && (c.assignedWorkerId === user.id || c.assignedWorkerId === user.email)) return true;
          if (c.assignedWorkerName && user.fullName) {
            const cleanAssigned = c.assignedWorkerName.toLowerCase().replace(/\(.*?\)/g, '').trim();
            const cleanUser = user.fullName.toLowerCase().trim();
            if (cleanAssigned.includes(cleanUser) || cleanUser.includes(cleanAssigned)) return true;
          }
          return false;
        });
        setCompletedList(myCompleted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner message="Fetching archived completed work orders..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#202522' }}>
            Completed Work Archive
          </Typography>
          <Chip
            label={`${completedList.length} Verified Resolved`}
            sx={{ fontWeight: 600, bgcolor: '#E8EFE9', color: '#304B3A' }}
          />
        </Box>
        <Typography variant="body1" sx={{ color: '#68706B' }}>
          Historical registry of resolved civic maintenance work orders verified with mandatory photo evidence.
        </Typography>
      </Box>

      {completedList.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '8px',
            border: '1.5px dashed #D0D7D1',
            backgroundColor: '#F8F9F7',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 280,
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
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', mb: 0.5 }}>
            No Completed Work Orders Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#68706B', maxWidth: 420 }}>
            Resolved work orders with mandatory photo proof will appear in this registry once approved by the ward councillor.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2.5 }}>
          {completedList.map((item) => (
            <Card
              key={item.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E5E8E4',
                borderTop: '4px solid #16A34A',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.15s ease',
                '&:hover': {
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={item.trackingNumber} size="small" sx={{ fontWeight: 700, bgcolor: '#E8EFE9', color: '#304B3A' }} />
                  <Chip icon={<CheckCircleIcon />} label="RESOLVED & COUNCILLOR VERIFIED" color="success" size="small" sx={{ fontWeight: 700, height: 24, fontSize: '0.7rem' }} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                  {item.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6, mb: 2 }}>
                  {item.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2, bgcolor: '#F8F9F7', p: 1, px: 1.5, borderRadius: '6px', width: 'fit-content' }}>
                  <LocationOnIcon fontSize="small" sx={{ color: '#496A57' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#202522' }}>
                    {item.locationAddress} ({item.ward})
                  </Typography>
                </Box>

                {/* Evidence Section: BEFORE & AFTER */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9F7', borderRadius: '8px', border: '1px solid #E5E8E4', mb: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#68706B', display: 'block', mb: 0.75 }}>
                        BEFORE PHOTO
                      </Typography>
                      {item.beforeImage ? (
                        <CardMedia
                          component="img"
                          image={item.beforeImage}
                          alt="Before Photo"
                          sx={{ borderRadius: '6px', height: 140, objectFit: 'cover', border: '1px solid #E5E8E4' }}
                        />
                      ) : item.images && item.images.length > 0 ? (
                        <CardMedia
                          component="img"
                          image={item.images[0]}
                          alt="Before Photo"
                          sx={{ borderRadius: '6px', height: 140, objectFit: 'cover', border: '1px solid #E5E8E4' }}
                        />
                      ) : (
                        <Box sx={{ height: 140, border: '1px dashed #CCC', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFF' }}>
                          <Typography variant="caption" color="text.secondary">N/A</Typography>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#16A34A', display: 'block', mb: 0.75 }}>
                        AFTER / RESOLVED PHOTO
                      </Typography>
                      {(item.afterImage || item.completionImage) ? (
                        <CardMedia
                          component="img"
                          image={item.afterImage || item.completionImage}
                          alt="Resolved Photo"
                          sx={{ borderRadius: '6px', height: 140, objectFit: 'cover', border: '2px solid #16A34A' }}
                        />
                      ) : (
                        <Box sx={{ height: 140, border: '1px dashed #16A34A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFF' }}>
                          <Typography variant="caption" color="success.main">Required Photo</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {item.workerNotes && (
                    <Box sx={{ pt: 1.5, borderTop: '1px solid #E5E8E4' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#304B3A', display: 'block', mb: 0.25 }}>
                        TECHNICIAN COMPLETION NOTE
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500, fontSize: '0.875rem' }}>
                        "{item.workerNotes}"
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F3F5F2' }}>
                <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 500 }}>
                  Verified on: {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <Typography variant="caption" sx={{ color: '#304B3A', fontWeight: 600 }}>
                  Assigned Worker: {item.assignedWorkerName || user?.fullName || 'Field Worker'}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CompletedTasks;
