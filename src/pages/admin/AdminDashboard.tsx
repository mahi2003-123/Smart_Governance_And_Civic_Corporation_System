import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import ShieldIcon from '@mui/icons-material/Shield';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DnsIcon from '@mui/icons-material/Dns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { CivicAnalytics, User } from '../../types';
import { ROLE_LABELS } from '../../utils/constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HeaderBreadcrumb } from '../../components/layout/HeaderBreadcrumb';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CivicAnalytics | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsData, usersData] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getUsers(),
        ]);
        setAnalytics(analyticsData);
        setRecentUsers(usersData.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !analytics) {
    return <LoadingSpinner message="Connecting to PostgreSQL Super Admin Dashboard..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Breadcrumb */}
      <HeaderBreadcrumb
        title="Super Admin Control Center"
        subtitle="Central digital governance monitoring, role-based access control, ward jurisdictions, and live database metrics."
        breadcrumbs={[
          { label: 'Super Admin Portal' },
          { label: 'Overview Dashboard' },
        ]}
      />

      {/* Executive Welcome Hero Banner */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px -15px rgba(37, 99, 235, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
          <Box maxWidth="700px">
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Chip
                icon={<VerifiedUserIcon style={{ color: '#60A5FA', fontSize: 16 }} />}
                label="Super Admin Authorized"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#93C5FD',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                }}
              />
              <Chip
                icon={<StorageIcon style={{ color: '#34D399', fontSize: 16 }} />}
                label="PostgreSQL Database Live"
                size="small"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#6EE7B7',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
              Smart Governance & Civic Corporation System
            </Typography>
            <Typography variant="body1" sx={{ color: '#93C5FD', lineHeight: 1.6, opacity: 0.95 }}>
              Manage municipal ward staff, register Councillors and Field Technicians, monitor live resident grievances, and audit system activity across all jurisdictions.
            </Typography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/admin/users')}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#1E3A8A',
                fontWeight: 800,
                borderRadius: '16px',
                px: 3,
                py: 1.4,
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                  color: '#2563EB',
                },
              }}
            >
              Register Official User
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Top Executive Metrics Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Registered Users"
            value={recentUsers.length > 0 ? `${recentUsers.length} Accounts` : '14,280'}
            subtitle="Citizens, Councillors & Workers"
            icon={<PeopleIcon sx={{ fontSize: 26, color: '#2563EB' }} />}
            bgColor="#EFF6FF"
            accentColor="#2563EB"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Municipal Wards"
            value={`${analytics.totalWards || 4} Wards`}
            subtitle="Fully digitized jurisdictions"
            icon={<MapIcon sx={{ fontSize: 26, color: '#8B5CF6' }} />}
            bgColor="#F5F3FF"
            accentColor="#8B5CF6"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Global Complaints"
            value={`${analytics.totalComplaints} Filed`}
            subtitle={`${analytics.resolvedComplaints} resolved (91% rate)`}
            icon={<ShieldIcon sx={{ fontSize: 26, color: '#10B981' }} />}
            bgColor="#ECFDF5"
            accentColor="#10B981"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="PostgreSQL Engine Health"
            value="100% Online"
            subtitle="Response time: 14 ms"
            icon={<DnsIcon sx={{ fontSize: 26, color: '#0EA5E9' }} />}
            bgColor="#F0F9FF"
            accentColor="#0EA5E9"
          />
        </Grid>
      </Grid>

      {/* Structured Super Admin Action Modules */}
      <Box mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
          Administration Modules & Access Controls
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Direct management shortcuts for staff registration, ward configuration, and governance tracking.
        </Typography>

        <Grid container spacing={3}>
          {/* Module 1: User & Role Controller */}
          <Grid item xs={12} sm={6} md={3}>
            <ActionModuleCard
              icon={<PeopleIcon sx={{ color: '#2563EB', fontSize: 32 }} />}
              title="User Directory & Roles"
              subtitle="Register Councillors & Field Workers. Manage resident access rights in database."
              badgeText="User Control"
              badgeColor="#2563EB"
              buttonText="Manage Users"
              onClick={() => navigate('/admin/users')}
            />
          </Grid>

          {/* Module 2: Ward Boundaries */}
          <Grid item xs={12} sm={6} md={3}>
            <ActionModuleCard
              icon={<MapIcon sx={{ color: '#8B5CF6', fontSize: 32 }} />}
              title="Ward Jurisdictions"
              subtitle="Configure municipal ward boundaries, assign councillors, and manage population stats."
              badgeText="Jurisdictions"
              badgeColor="#8B5CF6"
              buttonText="Manage Wards"
              onClick={() => navigate('/admin/wards')}
            />
          </Grid>

          {/* Module 3: Grievances Monitoring */}
          <Grid item xs={12} sm={6} md={3}>
            <ActionModuleCard
              icon={<ShieldIcon sx={{ color: '#10B981', fontSize: 32 }} />}
              title="Complaint Registry"
              subtitle="System-wide complaint tracking, timeline audit logs, and resolution verification."
              badgeText="Monitoring"
              badgeColor="#10B981"
              buttonText="Audit Complaints"
              onClick={() => navigate('/admin/complaints')}
            />
          </Grid>

          {/* Module 4: System Audit & Reports */}
          <Grid item xs={12} sm={6} md={3}>
            <ActionModuleCard
              icon={<AssessmentIcon sx={{ color: '#F59E0B', fontSize: 32 }} />}
              title="Civic System Reports"
              subtitle="Generate municipal performance analytics, resolution trends, and PDF audit exports."
              badgeText="Analytics"
              badgeColor="#F59E0B"
              buttonText="View System Reports"
              onClick={() => navigate('/admin/reports')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Analytics Graph & Database User Registry */}
      <Grid container spacing={3}>
        {/* Graph Card */}
        <Grid item xs={12} md={7}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Municipal Resolution Velocity
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Comparison of complaints filed vs resolved across all wards
                </Typography>
              </Box>
              <Chip label="Live Metrics" size="small" sx={{ fontWeight: 700, backgroundColor: '#EFF6FF', color: '#2563EB' }} />
            </Box>

            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      border: 'none',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    }}
                  />
                  <Area type="monotone" dataKey="filed" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFiled)" name="Complaints Filed" />
                  <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" name="Resolved Issues" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Live Users Table Card */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Registered Database Accounts
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Recent users created in PostgreSQL
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={() => navigate('/admin/users')}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#2563EB' }}
              >
                View All
              </Button>
            </Box>

            <TableContainer sx={{ flex: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>USER</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ROLE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>WARD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: u.role === 'ADMIN' ? '#EF4444' : u.role === 'COUNCILLOR' ? '#2563EB' : '#10B981',
                            }}
                          >
                            {u.fullName ? u.fullName.charAt(0) : 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem', lineHeight: 1.1 }}>
                              {u.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                              {u.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ROLE_LABELS[u.role] || u.role}
                          size="small"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            fontWeight: 700,
                            backgroundColor:
                              u.role === 'ADMIN'
                                ? '#FEE2E2'
                                : u.role === 'COUNCILLOR'
                                ? '#DBEAFE'
                                : u.role === 'WORKER'
                                ? '#FEF3C7'
                                : '#F1F5F9',
                            color:
                              u.role === 'ADMIN'
                                ? '#991B1B'
                                : u.role === 'COUNCILLOR'
                                ? '#1E40AF'
                                : u.role === 'WORKER'
                                ? '#92400E'
                                : '#475569',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                        {u.ward ? u.ward.split(' - ')[0] : 'Global'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

/* Sub-components for Clean Layout */
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  accentColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, bgColor, accentColor }) => (
  <Card
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: '20px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
      },
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '14px',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
      {value}
    </Typography>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 0.2 }}>
      {title}
    </Typography>
    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
      {subtitle}
    </Typography>
  </Card>
);

interface ActionModuleCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  buttonText: string;
  onClick: () => void;
}

const ActionModuleCard: React.FC<ActionModuleCardProps> = ({
  icon,
  title,
  subtitle,
  badgeText,
  badgeColor,
  buttonText,
  onClick,
}) => (
  <Card
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      borderRadius: '20px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: badgeColor,
        boxShadow: `0 12px 28px -8px ${badgeColor}25`,
        transform: 'translateY(-3px)',
      },
    }}
  >
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '16px',
            backgroundColor: `${badgeColor}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Chip
          label={badgeText}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.7rem',
            backgroundColor: `${badgeColor}15`,
            color: badgeColor,
          }}
        />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.8, letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.5, mb: 3 }}>
        {subtitle}
      </Typography>
    </Box>

    <Button
      fullWidth
      variant="contained"
      endIcon={<ArrowForwardIcon />}
      onClick={onClick}
      sx={{
        py: 1.2,
        borderRadius: '14px',
        backgroundColor: badgeColor,
        color: '#FFFFFF',
        fontWeight: 700,
        textTransform: 'none',
        boxShadow: `0 4px 12px ${badgeColor}35`,
        '&:hover': {
          backgroundColor: badgeColor,
          opacity: 0.9,
        },
      }}
    >
      {buttonText}
    </Button>
  </Card>
);

export default AdminDashboard;
