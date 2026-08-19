import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Chip,
  Avatar,
  Paper,
  Stack,
  LinearProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import LanguageIcon from '@mui/icons-material/Language';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* 1. TOP NAVBAR */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  backgroundColor: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                SGCS
                <Typography component="span" variant="h6" sx={{ fontWeight: 400, color: '#3B82F6' }}>
                  Gov
                </Typography>
              </Typography>
            </Box>

            {/* Nav Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', cursor: 'pointer', '&:hover': { color: '#3B82F6' } }}>
                Services
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', cursor: 'pointer', '&:hover': { color: '#3B82F6' } }}>
                Municipal Wards
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', cursor: 'pointer', '&:hover': { color: '#3B82F6' } }}>
                Civic Analytics
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', cursor: 'pointer', '&:hover': { color: '#3B82F6' } }}>
                Councillors
              </Typography>
            </Box>

            {/* Auth Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: '20px',
                  '&:hover': { backgroundColor: '#F1F5F9' },
                }}
              >
                Sign in
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="contained"
                sx={{
                  borderRadius: '20px',
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.8,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                  '&:hover': { backgroundColor: '#2563EB' },
                }}
              >
                Get started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. HERO SECTION */}
      <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          {/* Trust Badge Pill */}
          <Chip
            label="TRUSTED BY 2M+ CITIZENS & 100+ MUNICIPAL WARDS WORLDWIDE"
            size="small"
            sx={{
              backgroundColor: '#EFF6FF',
              color: '#3B82F6',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              py: 1.5,
              px: 1,
              border: '1px solid #DBEAFE',
              mb: 4,
            }}
          />

          {/* Main Title */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.75rem', md: '4.5rem' },
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              mb: 3,
            }}
          >
            Smart Civic
            <Box component="span" sx={{ display: 'block', my: 1 }}>
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%)',
                  color: '#FFFFFF',
                  px: 3,
                  py: 0.5,
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                }}
              >
                infrastructure
              </Box>
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              color: '#64748B',
              fontSize: { xs: '1.05rem', md: '1.25rem' },
              maxWidth: 680,
              mx: 'auto',
              lineHeight: 1.6,
              mb: 5,
            }}
          >
            Report grievances, track resolution in real-time, send community proposals, and manage civic services online. SGCS handles thousands of daily transactions for modern cities.
          </Typography>

          {/* CTA Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            <Button
              onClick={() => navigate('/register')}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '24px',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                px: 3.5,
                py: 1.4,
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.25)',
                '&:hover': { backgroundColor: '#2563EB' },
              }}
            >
              Start now
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outlined"
              sx={{
                borderRadius: '24px',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                px: 3.5,
                py: 1.4,
                backgroundColor: '#FFFFFF',
                '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
              }}
            >
              Explore Citizen Portal
            </Button>
          </Box>

          {/* Trust Checkmarks */}
          <Stack direction="row" spacing={3} sx={{ justifyContent: 'center', flexWrap: 'wrap', color: '#64748B', fontSize: '0.85rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckIcon sx={{ fontSize: 16, color: '#3B82F6' }} /> ISO 27001 Certified
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckIcon sx={{ fontSize: 16, color: '#3B82F6' }} /> 100+ Municipal Wards
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckIcon sx={{ fontSize: 16, color: '#3B82F6' }} /> 99.99% Resolution Uptime
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* 3. FEATURE SHOWCASE SECTION (CIVIC SERVICES) */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 8, alignItems: 'center', mb: 10 }}>
            {/* Left Content */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#3B82F6', letterSpacing: '0.08em', display: 'block', mb: 1 }}>
                CIVIC SERVICES
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '2rem', md: '2.75rem' }, letterSpacing: '-0.02em', mb: 2 }}>
                A unified civic governance platform
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748B', mb: 4, fontSize: '1.05rem', lineHeight: 1.7 }}>
                From one-time pothole reports to community budget proposals and ward announcements, SGCS handles every civic scenario your municipal corporation needs.
              </Typography>

              <Stack spacing={2}>
                {[
                  'Support for 40+ municipal service categories',
                  'Smart AI routing boosts grievance resolution speed by 45%',
                  'Real-time SLA tracking powered by Machine Learning',
                  'Transparent Ward budget calculation & auditing',
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        color: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 14 }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Right Card Mockup (Metrics floating card) */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Metric 1 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Grievance Resolution Volume
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        24.8K
                      </Typography>
                      <Chip label="+18%" size="small" sx={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }} />
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={82} sx={{ height: 6, borderRadius: 3, backgroundColor: '#EFF6FF', '& .MuiLinearProgress-bar': { backgroundColor: '#3B82F6' } }} />
                </Box>

                {/* Metric 2 */}
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                      SLA Resolution Success Rate
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        99.2%
                      </Typography>
                      <Chip label="+0.3%" size="small" sx={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }} />
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={95} sx={{ height: 6, borderRadius: 3, backgroundColor: '#DCFCE7', '& .MuiLinearProgress-bar': { backgroundColor: '#10B981' } }} />
                </Box>

                {/* Metric 3 */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Avg Resolution Time
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        1.2 days
                      </Typography>
                      <Chip label="-0.5d" size="small" sx={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }} />
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={45} sx={{ height: 6, borderRadius: 3, backgroundColor: '#F3E8FF', '& .MuiLinearProgress-bar': { backgroundColor: '#8B5CF6' } }} />
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* 4 Feature Cards Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {/* Card 1 */}
            <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <Avatar sx={{ width: 44, height: 44, backgroundColor: '#EFF6FF', color: '#3B82F6', mb: 2 }}>
                <LanguageIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Ward Coverage
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6 }}>
                100+ municipal wards & civic bodies connected in real-time.
              </Typography>
            </Card>

            {/* Card 2 */}
            <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <Avatar sx={{ width: 44, height: 44, backgroundColor: '#FEF3C7', color: '#D97706', mb: 2 }}>
                <FlashOnIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Instant Routing
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Automated field worker assignment within 15 minutes of reporting.
              </Typography>
            </Card>

            {/* Card 3 */}
            <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <Avatar sx={{ width: 44, height: 44, backgroundColor: '#FEE2E2', color: '#DC2626', mb: 2 }}>
                <ShieldOutlinedIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Evidence Verification
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6 }}>
                AI models verify geo-tagged photos and completion proof 24/7.
              </Typography>
            </Card>

            {/* Card 4 */}
            <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <Avatar sx={{ width: 44, height: 44, backgroundColor: '#F3E8FF', color: '#8B5CF6', mb: 2 }}>
                <EqualizerIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Civic Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Comprehensive dashboards for councillors and municipal leaders.
              </Typography>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* 4. BIG STAT & FLOATING TESTIMONIAL SECTION */}
      <Box sx={{ py: { xs: 10, md: 14 }, backgroundColor: '#F8FAFC', textAlign: 'center' }}>
        <Container maxWidth="md">
          {/* Big Stat */}
          <Typography variant="h1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '3rem', md: '5rem' }, letterSpacing: '-0.04em', mb: 1 }}>
            100,000+
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.2rem', mb: 6 }}>
            complaints resolved annually on SGCS
          </Typography>

          {/* Testimonial Floating Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            {/* Stars */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 2.5 }}>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} sx={{ color: '#F59E0B', fontSize: 22 }} />
              ))}
            </Box>

            {/* Quote */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', fontStyle: 'italic', lineHeight: 1.6, mb: 3 }}>
              "SGCS reduced our complaint resolution times by 45% and increased citizen trust significantly in our first quarter."
            </Typography>

            {/* Author */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Avatar sx={{ backgroundColor: '#3B82F6', color: '#FFFFFF', fontWeight: 700, width: 44, height: 44 }}>
                E
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Emily Zhang
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Chief Councillor, Central Ward
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 5. VIBRANT LIGHTER BLUE CTA BANNER */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{ fontWeight: 900, fontSize: { xs: '2.25rem', md: '3.5rem' }, letterSpacing: '-0.03em', mb: 2 }}
          >
            Ready to get involved?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '1.05rem', md: '1.25rem' }, mb: 4 }}>
            Join 2 million citizens already using SGCS to build cleaner, safer cities.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              onClick={() => navigate('/register')}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                px: 4,
                py: 1.4,
                '&:hover': { backgroundColor: '#F8FAFC' },
              }}
            >
              Create account
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outlined"
              sx={{
                borderRadius: '24px',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                color: '#FFFFFF !important',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                px: 4,
                py: 1.4,
                backgroundColor: 'transparent',
                '&:hover': { border: '1.5px solid #FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.15)' },
              }}
            >
              Contact Ward Office
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 6. DARK FOOTER */}
      <Box component="footer" sx={{ backgroundColor: '#0B132B', color: '#94A3B8', py: 6, borderTop: '1px solid #1E293B' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  backgroundColor: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                SGCS
              </Typography>
            </Box>

            {/* Links */}
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                Privacy
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                Terms
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                Security
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                Cookies
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                Status
              </Typography>
            </Stack>

            {/* Copyright */}
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              © 2026 SGCS Inc.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
