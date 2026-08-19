import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TablePagination,
  Tooltip,
  Typography,
  Box
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import { Complaint } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';

interface ComplaintTableProps {
  complaints: Complaint[];
  onViewDetails: (id: string) => void;
  onAssignWorker?: (complaint: Complaint) => void;
  showAssignAction?: boolean;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onViewDetails,
  onAssignWorker,
  showAssignAction = false,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedList = complaints.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tracking ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title & Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ward & Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Filing Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedList.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Chip label={row.trackingNumber} size="small" sx={{ fontWeight: 700, bgcolor: '#F6DECD', color: '#25190F' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {row.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.category}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.ward}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap maxWidth={180} display="block">
                    {row.locationAddress}
                  </Typography>
                </TableCell>
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
                <TableCell>
                  <Typography variant="caption">
                    {new Date(row.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="View Case Details">
                      <IconButton color="primary" onClick={() => onViewDetails(row.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    {showAssignAction && onAssignWorker && (
                      <Tooltip title="Assign Technician">
                        <IconButton color="secondary" onClick={() => onAssignWorker(row)}>
                          <BuildIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={complaints.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};
