import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { adminService } from '../../services/adminService';
import { SystemActivityLog } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FilterBar, FilterOption } from '../../components/admin/FilterBar';

export const SystemActivity: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<SystemActivityLog[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminService.getActivityLogs();
        setActivities(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.user.toLowerCase().includes(search.toLowerCase()) ||
      act.action.toLowerCase().includes(search.toLowerCase()) ||
      act.details.toLowerCase().includes(search.toLowerCase());

    const matchesModule = moduleFilter === 'ALL' || act.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const filterOptions: FilterOption[] = [
    {
      id: 'module',
      label: 'System Module',
      value: moduleFilter,
      options: [
        { label: 'All Modules', value: 'ALL' },
        { label: 'Complaint', value: 'COMPLAINT' },
        { label: 'Proposal', value: 'PROPOSAL' },
        { label: 'Notice', value: 'NOTICE' },
        { label: 'User Management', value: 'USER' },
        { label: 'Ward', value: 'WARD' },
        { label: 'System', value: 'SYSTEM' },
      ],
      onChange: setModuleFilter,
    },
  ];

  if (loading) return <LoadingSpinner message="Loading System Activity Audit Logs..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="System Activity"
        description="Audit log of all user activities, complaint updates and system events."
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search logs by user, action or description..."
        filters={filterOptions}
      />

      <TableContainer
        sx={{
          border: '1px solid #E5E8E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#F8F9F7' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.8rem' }}>Details & Audit Info</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No system activity logs found matching filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((act) => (
                <TableRow key={act.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                  <TableCell sx={{ fontSize: '0.825rem', color: '#68706B', whitespace: 'nowrap' }}>
                    {act.timestamp}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.85rem' }}>
                    {act.user}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={act.role}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.675rem',
                        backgroundColor: '#F3F5F2',
                        color: '#68706B',
                        borderRadius: '4px',
                        height: '20px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#496A57', fontSize: '0.85rem' }}>
                    {act.action}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={act.module}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.675rem',
                        backgroundColor: '#E8EFE9',
                        color: '#304B3A',
                        borderRadius: '4px',
                        height: '20px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: '#4A524D' }}>
                    {act.details}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SystemActivity;
