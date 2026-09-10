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
  Paper
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
  const [roleFilter, setRoleFilter] = useState('ALL');

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
    const userName = act.userName || act.user || 'System';
    const action = act.action || '';
    const details = act.details || '';
    const ref = act.reference || '';
    const userRole = (act.userRole || act.role || '').toUpperCase();

    const matchesSearch =
      userName.toLowerCase().includes(search.toLowerCase()) ||
      action.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase()) ||
      ref.toLowerCase().includes(search.toLowerCase());

    const matchesModule = moduleFilter === 'ALL' || act.module === moduleFilter;
    const matchesRole = roleFilter === 'ALL' || userRole === roleFilter;

    return matchesSearch && matchesModule && matchesRole;
  });

  const filterOptions: FilterOption[] = [
    {
      id: 'module',
      label: 'Module',
      value: moduleFilter,
      options: [
        { label: 'All Modules', value: 'ALL' },
        { label: 'Complaints & Tasks', value: 'COMPLAINT' },
        { label: 'Worker Daily Tasks', value: 'WORKER_TASK' },
        { label: 'Proposals', value: 'PROPOSAL' },
        { label: 'Civic Notices', value: 'NOTICE' },
        { label: 'Authentication', value: 'AUTH' },
        { label: 'Admin Management', value: 'ADMIN' },
      ],
      onChange: setModuleFilter,
    },
    {
      id: 'role',
      label: 'User Role',
      value: roleFilter,
      options: [
        { label: 'All Roles', value: 'ALL' },
        { label: 'Citizen', value: 'CITIZEN' },
        { label: 'Councillor', value: 'COUNCILLOR' },
        { label: 'Worker', value: 'WORKER' },
        { label: 'Admin', value: 'ADMIN' },
      ],
      onChange: setRoleFilter,
    },
  ];

  const formatTimestamp = (act: SystemActivityLog) => {
    if (act.timestamp) return act.timestamp;
    if (act.createdAt) {
      try {
        const d = new Date(act.createdAt);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }) + ' — ' + d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        return act.createdAt;
      }
    }
    return 'Recently';
  };

  const getRoleColor = (role?: string) => {
    const r = (role || '').toUpperCase();
    switch (r) {
      case 'ADMIN': return { bg: '#FDE8E8', text: '#9B1C1C' };
      case 'COUNCILLOR': return { bg: '#E1EFFE', text: '#1E40AF' };
      case 'WORKER': return { bg: '#FEF08A', text: '#854D0E' };
      case 'CITIZEN': return { bg: '#E8EFE9', text: '#304B3A' };
      default: return { bg: '#F3F5F2', text: '#68706B' };
    }
  };

  if (loading) return <LoadingSpinner message="Loading Municipal Audit Log Stream..." />;

  return (
    <Box sx={{ pb: 6 }}>
      <AdminPageHeader
        title="System Activity & Audit Log"
        description="Immutable record of user authentication, complaint status changes, worker task updates, proposals and administrative actions."
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter logs by user, reference (e.g. TRK-1042), action or details..."
        filters={filterOptions}
      />

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #E5E8E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ backgroundColor: '#F8F9F7' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#202522', fontSize: '0.8rem' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#202522', fontSize: '0.8rem' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#202522', fontSize: '0.8rem' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#202522', fontSize: '0.8rem' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#202522', fontSize: '0.8rem' }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#202522', fontSize: '0.8rem' }}>Reference</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#202522', fontSize: '0.8rem' }}>Details & Audit Info</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#68706B' }}>
                  No system audit records found matching the specified filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((act) => {
                const uRole = (act.userRole || act.role || 'USER').toUpperCase();
                const roleColors = getRoleColor(uRole);
                const userName = act.userName || act.user || 'System';

                return (
                  <TableRow key={act.id} sx={{ '&:hover': { backgroundColor: '#F8F9F7' }, borderBottom: '1px solid #E5E8E4' }}>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#68706B', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {formatTimestamp(act)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#202522', fontSize: '0.85rem' }}>
                      {userName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={uRole}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.675rem',
                          backgroundColor: roleColors.bg,
                          color: roleColors.text,
                          borderRadius: '4px',
                          height: '22px',
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
                    <TableCell sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#304B3A' }}>
                      {act.reference || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#4A524D' }}>
                      {act.details}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SystemActivity;
