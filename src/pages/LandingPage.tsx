import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import Civic3DHero from '../components/landing/Civic3DHero';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAF8F5', color: '#1A232A', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* 1. TOP NAVBAR */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E6EA',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Brand Logo */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '6px',
                  backgroundColor: '#0F4C5C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <AccountBalanceOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A232A', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  SGCS
                </Typography>
                <Typography variant="caption" sx={{ color: '#5A6672', fontSize: '0.7rem', display: 'block', letterSpacing: '0.05em', fontWeight: 600 }}>
                  MUNICIPAL CIVIC PORTAL
                </Typography>
              </Box>
            </Box>

            {/* Nav Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
              <Typography variant="body2" onClick={() => navigate('/login')} sx={{ color: '#5A6672', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#0F4C5C' } }}>
                Citizen Services
              </Typography>
              <Typography variant="body2" onClick={() => navigate('/login')} sx={{ color: '#5A6672', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#0F4C5C' } }}>
                Ward Jurisdiction
              </Typography>
              <Typography variant="body2" onClick={() => navigate('/citizen/track')} sx={{ color: '#5A6672', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#0F4C5C' } }}>
                Track Grievance
              </Typography>
            </Box>

            {/* Auth Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  color: '#1A232A',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  px: 2,
                }}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="contained"
                sx={{
                  borderRadius: '6px',
                  backgroundColor: '#0F4C5C',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.9,
                  '&:hover': { backgroundColor: '#0A343F' },
                }}
              >
                Register Account
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. HERO SECTION WITH PURPOSEFUL 3D VISUAL */}
      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 6, md: 9 }, backgroundColor: '#FAF8F5' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, gap: 5, alignItems: 'center' }}>
            {/* Left Content Column */}
            <Box>
              <Chip
                label="OFFICIAL MUNICIPAL CIVIC SERVICE SYSTEM"
                size="small"
                sx={{
                  backgroundColor: '#E0F2F1',
                  color: '#0F4C5C',
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  letterSpacing: '0.06em',
                  py: 0.5,
                  px: 1.5,
                  mb: 2.5,
                  borderRadius: '4px',
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', sm: '2.85rem', md: '3.25rem' },
                  fontWeight: 800,
                  color: '#1A232A',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  mb: 2.5,
                }}
              >
                Smart Governance & Civic Corporation System
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#5A6672',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.65,
                  mb: 4,
                }}
              >
                Directly connect citizens with municipal ward councillors and field work teams. Report public grievances, track repair progress, and inspect official announcements.
              </Typography>

              {/* Action Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: '6px',
                    backgroundColor: '#C85A32',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.2,
                    '&:hover': { backgroundColor: '#A03F1B' },
                  }}
                >
                  Access Citizen Portal
                </Button>
                <Button
                  onClick={() => navigate('/citizen/track')}
                  variant="outlined"
                  sx={{
                    borderRadius: '6px',
                    borderColor: '#E2E6EA',
                    color: '#1A232A',
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.2,
                    backgroundColor: '#FFFFFF',
                    '&:hover': { borderColor: '#0F4C5C', backgroundColor: '#F4F1EA' },
                  }}
                >
                  Track Grievance Status
                </Button>
              </Box>

              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', color: '#5A6672', fontSize: '0.85rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckOutlinedIcon sx={{ fontSize: 16, color: '#0F4C5C' }} /> Verified Ward Routing
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckOutlinedIcon sx={{ fontSize: 16, color: '#0F4C5C' }} /> 100+ Municipal Wards
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckOutlinedIcon sx={{ fontSize: 16, color: '#0F4C5C' }} /> High Contrast Accessibility
                </Box>
              </Stack>
            </Box>

            {/* Right Column: 3D Visual Hero */}
            <Box>
              <Civic3DHero />
            </Box>
          </Box>
        </Container>
      </Box>

      <Divider sx={{ borderColor: '#E2E6EA' }} />

      {/* 3. CORE ROLES & CAPABILITIES */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: '#F4F1EA' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#5A6672', fontWeight: 700, display: 'block', mb: 1 }}>
              SYSTEM ARCHITECTURE
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: '#1A232A', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Four Integrated Stakeholder Portals
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {/* Portal 1 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E2E6EA', borderLeft: '4px solid #0F4C5C', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '6px', backgroundColor: '#E0F2F1', color: '#0F4C5C', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <PeopleOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1A232A', fontSize: '1.1rem', mb: 1 }}>
                Citizen Portal
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A6672', lineHeight: 1.6 }}>
                Submit civic complaints, attach photos, track real-time resolution status, and participate in ward proposals.
              </Typography>
            </Paper>

            {/* Portal 2 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E2E6EA', borderLeft: '4px solid #C85A32', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '6px', backgroundColor: '#FDF2EE', color: '#C85A32', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <GavelOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1A232A', fontSize: '1.1rem', mb: 1 }}>
                Councillor Hub
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A6672', lineHeight: 1.6 }}>
                Review incoming ward complaints, assign tasks to department field teams, publish official notices, and manage budget allocations.
              </Typography>
            </Paper>

            {/* Portal 3 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E2E6EA', borderLeft: '4px solid #0F4C5C', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '6px', backgroundColor: '#E0F2F1', color: '#0F4C5C', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <AssignmentTurnedInOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1A232A', fontSize: '1.1rem', mb: 1 }}>
                Field Worker App
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A6672', lineHeight: 1.6 }}>
                Receive assigned work orders, update repair progress on-site, upload completion photos, and mark tasks resolved.
              </Typography>
            </Paper>

            {/* Portal 4 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E2E6EA', borderLeft: '4px solid #C85A32', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '6px', backgroundColor: '#FDF2EE', color: '#C85A32', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <SecurityOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1A232A', fontSize: '1.1rem', mb: 1 }}>
                Corporation Admin
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A6672', lineHeight: 1.6 }}>
                Monitor municipal-wide SLA metrics, manage ward boundaries, audit department efficiency, and oversee system settings.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* 4. FOOTER */}
      <Box component="footer" sx={{ backgroundColor: '#1A232A', color: '#A0A8A3', py: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '4px', backgroundColor: '#0F4C5C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                SGCS Municipal Corporation System
              </Typography>
            </Box>

            <Stack direction="row" spacing={3}>
              <Typography variant="caption" sx={{ color: '#A0A8A3' }}>
                Privacy Policy
              </Typography>
              <Typography variant="caption" sx={{ color: '#A0A8A3' }}>
                Terms of Service
              </Typography>
              <Typography variant="caption" sx={{ color: '#A0A8A3' }}>
                Ward Office Directory
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ color: '#A0A8A3' }}>
              © 2026 Smart Governance & Civic Corporation System
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
