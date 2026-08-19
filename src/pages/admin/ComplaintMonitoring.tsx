import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ComplaintMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading Global Complaint Monitoring Registry..." />;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800}>
          Global Complaint Registry & Audit
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor real-time civic complaint resolution across all municipal wards.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tracking Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Complaint Title & Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ward</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Field Worker</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Chip label={row.trackingNumber} size="small" sx={{ fontWeight: 800 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {row.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.category}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.ward}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.priority}
                      size="small"
                      sx={{
                        bgcolor: PRIORITY_COLORS[row.priority].bg,
                        color: PRIORITY_COLORS[row.priority].text,
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.assignedWorkerName || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[row.status].bg,
                        color: STATUS_COLORS[row.status].text,
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Full Timeline">
                      <IconButton color="primary" onClick={() => navigate(`/citizen/history/${row.id}`)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
