import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Grid, Chip, CardMedia } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
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
          assignedWorkerId: user?.id || 'usr_worker_01',
          status: 'RESOLVED',
        });
        setCompletedList(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner message="Fetching archived completed tasks..." />;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800}>
          Completed Work Archive
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historical registry of resolved civic maintenance work orders.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {completedList.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#FFFFFF', borderTop: '4px solid #2E7D32' }}>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Chip label={item.trackingNumber} size="small" sx={{ fontWeight: 700 }} />
                <Chip icon={<CheckCircleIcon />} label="RESOLVED" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Box>

              <Typography variant="h6" fontWeight={700} gutterBottom>
                {item.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                {item.description}
              </Typography>

              {item.completionImage && (
                <Box mt={1} mb={2}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Verified Completion Proof:
                  </Typography>
                  <CardMedia
                    component="img"
                    image={item.completionImage}
                    alt="Proof"
                    sx={{ borderRadius: 2, height: 160, objectFit: 'cover' }}
                  />
                </Box>
              )}

              <Typography variant="caption" color="text.secondary">
                Resolved on: {new Date(item.updatedAt).toLocaleString()}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
