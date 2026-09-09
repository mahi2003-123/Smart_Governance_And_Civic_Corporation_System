import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export interface SlideContent {
  pose: number;
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  subtext: string;
  metricValue: string;
  metricLabel: string;
  statusText: string;
}

export const SLIDES_CONFIG: SlideContent[] = [
  {
    pose: 0,
    badge: '[ 001 / SGCS MUNICIPAL INFRASTRUCTURE ]',
    headlineLine1: 'Smarter Services.',
    headlineLine2: 'Better // Communities.',
    subtext: 'Connecting citizens, intelligent services, and digital governance through one unified platform for transparent ward tracking and automated triage.',
    metricValue: '⚡ < 4.2 Hours',
    metricLabel: 'Average Ward Resolution Speed',
    statusText: 'SGCS MUNICIPAL SYSTEM ONLINE',
  },
  {
    pose: 1,
    badge: '[ 002 / REAL-TIME GRIEVANCE TRIAGE ]',
    headlineLine1: 'Instant Triage.',
    headlineLine2: 'Transparent // Action.',
    subtext: 'Automated AI grievance classification routes infrastructure complaints directly to assigned ward councillors and field technicians.',
    metricValue: '🎯 99.4% Accuracy',
    metricLabel: 'Automated Ward Jurisdiction Routing',
    statusText: 'AI DISPATCH & TRIAGE PIPELINE LIVE',
  },
  {
    pose: 2,
    badge: '[ 003 / COMMUNITY PARTICIPATION & VOTING ]',
    headlineLine1: 'Empowered Wards.',
    headlineLine2: 'Direct // Democracy.',
    subtext: 'Citizens participate in neighborhood budget proposals, public safety notices, and municipal voting in real time.',
    metricValue: '🗳️ 34 Wards Connected',
    metricLabel: 'Public Citizen Participation Rate',
    statusText: 'WARD PROPOSAL & VOTING NETWORK LIVE',
  },
  {
    pose: 3,
    badge: '[ 004 / UNIFIED MUNICIPAL DASHBOARD ]',
    headlineLine1: 'One Platform.',
    headlineLine2: 'Complete // Governance.',
    subtext: 'Unifying Citizens, Ward Councillors, Field Workers, and Super Admins into one high-performance civic governance operating system.',
    metricValue: '🛡️ 100% Operational',
    metricLabel: 'Super Admin & Councillor Real-Time Sync',
    statusText: 'SGCS SMART GOVERNANCE SYSTEM READY',
  },
];

interface HeroOverlayProps {
  currentPose: number;
  onPoseSelect: (pose: number) => void;
  onOpenMobileDrawer: () => void;
  onScrollToSection: (id: string) => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  currentPose,
  onPoseSelect,
  onOpenMobileDrawer,
  onScrollToSection,
}) => {
  const navigate = useNavigate();
  const slide = SLIDES_CONFIG[currentPose] || SLIDES_CONFIG[0];

  return (
    <>
      {/* 1. CLEAN STUDIO NAVBAR */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 4, md: 5 }, position: 'relative', zIndex: 10 }}>
        
        {/* Brand Logo Mark */}
        <Typography
          variant="body2"
          onClick={() => navigate('/')}
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: '0.05em',
            color: '#111827',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          ( SGCS_CIVIC )
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
          <Typography
            onClick={() => onScrollToSection('civic-services')}
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#4B5563',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              '&:hover': { color: '#111827' },
            }}
          >
            civic services <span style={{ fontSize: '0.75rem', verticalAlign: 'super' }}>↗</span>
          </Typography>
          <Typography
            onClick={() => onScrollToSection('how-it-works')}
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#4B5563',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              '&:hover': { color: '#111827' },
            }}
          >
            how it works <span style={{ fontSize: '0.75rem', verticalAlign: 'super' }}>↗</span>
          </Typography>
          <Typography
            onClick={() => navigate('/login')}
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#4B5563',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              '&:hover': { color: '#111827' },
            }}
          >
            contact us <span style={{ fontSize: '0.75rem', verticalAlign: 'super' }}>↗</span>
          </Typography>
        </Box>

        {/* Header Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => navigate('/login')}
            variant="outlined"
            sx={{
              borderRadius: '50px',
              borderColor: '#111827',
              color: '#111827',
              fontWeight: 700,
              fontSize: '0.8rem',
              fontFamily: '"JetBrains Mono", monospace',
              textTransform: 'none',
              px: 2.5,
              py: 0.75,
              borderWidth: '1.5px',
              backgroundColor: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#111827',
                color: '#FFFFFF',
                borderColor: '#111827',
              },
            }}
          >
            ( SIGN IN )
          </Button>

          <IconButton
            onClick={onOpenMobileDrawer}
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#111827' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

      </Box>

      {/* 2. SGCS HERO CONTENT OVERLAY */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          my: 'auto',
          maxWidth: 820,
          py: { xs: 2, md: 3 },
        }}
      >
        {/* Phase Badge */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: '0.82rem',
            color: '#111827',
            letterSpacing: '0.08em',
            display: 'inline-block',
            mb: 2.5,
            backgroundColor: '#F3F4F6',
            px: 2.2,
            py: 0.65,
            borderRadius: '50px',
            border: '1px solid #E5E7EB',
          }}
        >
          {slide.badge}
        </Typography>

        {/* SGCS Display Headline */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.6rem', md: '4.8rem' },
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.035em',
            lineHeight: 1.08,
            mb: 2.5,
            userSelect: 'none',
          }}
        >
          {slide.headlineLine1} <br />
          <span dangerouslySetInnerHTML={{ __html: slide.headlineLine2.replace('//', '<span style="color: #D97706;">//</span>') }} />
        </Typography>

        {/* Subtext Paragraph */}
        <Typography
          variant="body1"
          sx={{
            color: '#4B5563',
            fontSize: { xs: '1.02rem', md: '1.15rem' },
            lineHeight: 1.65,
            maxWidth: 640,
            mb: 3.5,
            fontWeight: 500,
          }}
        >
          {slide.subtext}
        </Typography>

        {/* Static Live Metric Card */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: '#FAFAFA',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            px: 2.5,
            py: 1.2,
            mb: 4,
          }}
        >
          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '1.02rem', color: '#111827' }}>
            {slide.metricValue}
          </Typography>
          <Box sx={{ width: '1px', height: 20, backgroundColor: '#D1D5DB' }} />
          <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#4B5563' }}>
            {slide.metricLabel}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Button
            onClick={() => navigate('/register')}
            variant="contained"
            disableElevation
            sx={{
              borderRadius: '50px',
              backgroundColor: '#111827',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: '"JetBrains Mono", monospace',
              textTransform: 'none',
              px: 4,
              py: 1.3,
              '&:hover': {
                backgroundColor: '#1F2937',
              },
            }}
          >
            ( GET STARTED ↗ )
          </Button>
          <Button
            onClick={() => onScrollToSection('civic-services')}
            variant="outlined"
            sx={{
              borderRadius: '50px',
              borderColor: '#D1D5DB',
              color: '#374151',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: '"JetBrains Mono", monospace',
              textTransform: 'none',
              px: 3.5,
              py: 1.3,
              borderWidth: '1.5px',
              backgroundColor: '#FFFFFF',
              '&:hover': {
                borderColor: '#111827',
                color: '#111827',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            ( EXPLORE SERVICES )
          </Button>
        </Stack>
      </Box>

      {/* 3. STATIC FEATURE SELECTOR & STATUS FOOTER */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          mt: 3,
          pt: 3,
          borderTop: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Live Status Indicator */}
        <Box
          sx={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '50px',
            px: 2.2,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706' }} />
          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>
            {slide.statusText}
          </Typography>
        </Box>

        {/* Feature Tab Selectors */}
        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
          {SLIDES_CONFIG.map((item) => {
            const isActive = item.pose === currentPose;
            return (
              <Box
                key={item.pose}
                onClick={() => onPoseSelect(item.pose)}
                sx={{
                  cursor: 'pointer',
                  px: 1.8,
                  py: 0.5,
                  borderRadius: '50px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: isActive ? '#111827' : '#F3F4F6',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  border: isActive ? '1px solid #111827' : '1px solid #E5E7EB',
                  '&:hover': {
                    backgroundColor: isActive ? '#111827' : '#E5E7EB',
                  },
                }}
              >
                0{item.pose + 1}
              </Box>
            );
          })}
        </Stack>

      </Box>
    </>
  );
};

export default HeroOverlay;
