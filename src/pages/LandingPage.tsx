import React from 'react';
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
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#202522', fontFamily: "'Inter', sans-serif" }}>
      {/* 1. TOP NAVBAR */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E8E4',
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
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  backgroundColor: '#496A57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <AccountBalanceOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#202522', fontSize: '1rem', lineHeight: 1.2 }}>
                  SGCS
                </Typography>
                <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.7rem', display: 'block', letterSpacing: '0.04em' }}>
                  MUNICIPAL PORTAL
                </Typography>
              </Box>
            </Box>

            {/* Nav Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
              <Typography variant="body2" onClick={() => navigate('/login')} sx={{ color: '#68706B', cursor: 'pointer', '&:hover': { color: '#496A57' } }}>
                Citizen Services
              </Typography>
              <Typography variant="body2" onClick={() => navigate('/login')} sx={{ color: '#68706B', cursor: 'pointer', '&:hover': { color: '#496A57' } }}>
                Ward Jurisdiction
              </Typography>
              <Typography variant="body2" onClick={() => navigate('/citizen/track')} sx={{ color: '#68706B', cursor: 'pointer', '&:hover': { color: '#496A57' } }}>
                Track Grievance
              </Typography>
            </Box>

            {/* Auth Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  color: '#202522',
                  fontWeight: 500,
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
                  borderRadius: '8px',
                  backgroundColor: '#496A57',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.8,
                  '&:hover': { backgroundColor: '#304B3A' },
                }}
              >
                Register Account
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. HERO SECTION - Editorial White-First */}
      <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip
            label="OFFICIAL MUNICIPAL CIVIC SERVICE SYSTEM"
            size="small"
            sx={{
              backgroundColor: '#E8EFE9',
              color: '#304B3A',
              fontWeight: 600,
              fontSize: '0.725rem',
              letterSpacing: '0.06em',
              py: 0.5,
              px: 1.5,
              mb: 3,
              borderRadius: '4px',
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.25rem', sm: '3.25rem', md: '3.75rem' },
              fontWeight: 600,
              color: '#202522',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              mb: 3,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Smart Governance & Civic Corporation System
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#68706B',
              fontSize: { xs: '1.05rem', md: '1.15rem' },
              maxWidth: 680,
              mx: 'auto',
              lineHeight: 1.65,
              mb: 5,
            }}
          >
            Directly connect citizens with municipal ward councillors and field work teams. Report public grievances, track repair progress, and inspect official announcements.
          </Typography>

          {/* Action Row */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 6 }}>
            <Button
              onClick={() => navigate('/register')}
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '8px',
                backgroundColor: '#496A57',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '0.925rem',
                textTransform: 'none',
                px: 3.5,
                py: 1.2,
                '&:hover': { backgroundColor: '#304B3A' },
              }}
            >
              Access Citizen Portal
            </Button>
            <Button
              onClick={() => navigate('/citizen/track')}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                borderColor: '#E5E8E4',
                color: '#202522',
                fontWeight: 500,
                fontSize: '0.925rem',
                textTransform: 'none',
                px: 3.5,
                py: 1.2,
                backgroundColor: '#FFFFFF',
                '&:hover': { borderColor: '#496A57', backgroundColor: '#F3F5F2' },
              }}
            >
              Track Grievance Status
            </Button>
          </Box>

          <Stack direction="row" spacing={4} sx={{ justifyContent: 'center', flexWrap: 'wrap', color: '#68706B', fontSize: '0.85rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> Verified Ward Routing
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> 100+ Municipal Wards
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> ISO 27001 Data Security
            </Box>
          </Stack>
        </Container>
      </Box>

      <Divider sx={{ borderColor: '#E5E8E4' }} />

      {/* 3. CORE ROLES & CAPABILITIES */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: '#F8F9F7' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
              SYSTEM ARCHITECTURE
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#202522', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Four Integrated Stakeholder Portals
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {/* Portal 1 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: '#E8EFE9', color: '#304B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <PeopleOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', fontSize: '1.1rem', mb: 1 }}>
                Citizen Portal
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Submit civic complaints, attach photos, track real-time resolution status, and participate in ward proposals.
              </Typography>
            </Paper>

            {/* Portal 2 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: '#E8EFE9', color: '#304B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <GavelOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', fontSize: '1.1rem', mb: 1 }}>
                Councillor Hub
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Review incoming ward complaints, assign tasks to department field teams, publish official notices, and manage budget allocations.
              </Typography>
            </Paper>

            {/* Portal 3 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: '#E8EFE9', color: '#304B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <AssignmentTurnedInOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', fontSize: '1.1rem', mb: 1 }}>
                Field Worker App
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Receive assigned work orders, update repair progress on-site, upload completion photos, and mark tasks resolved.
              </Typography>
            </Paper>

            {/* Portal 4 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: '#E8EFE9', color: '#304B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <SecurityOutlinedIcon />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', fontSize: '1.1rem', mb: 1 }}>
                Corporation Admin
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Monitor municipal-wide SLA metrics, manage ward boundaries, audit department efficiency, and oversee system settings.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* 4. FOOTER */}
      <Box component="footer" sx={{ backgroundColor: '#202522', color: '#A0A8A3', py: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '4px', backgroundColor: '#496A57', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBalanceOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
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
