import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  InputBase,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Lucide / Feather Style Minimalist Thin Line Icons (1.5px stroke aesthetic)
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// SGCS Brand Palette Tokens (as specified)
const BRAND_GREEN = '#1F4D3A'; // Primary Dark Forest Green accent
const BRAND_GREEN_HOVER = '#16382A';
const BRAND_GREEN_LIGHT = '#E8F3EE'; // Soft light green for badges
const BRAND_GREEN_BORDER = '#C3E0D2';
const BRAND_ORANGE = '#E67E22'; // Soft orange secondary accent

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const singleCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FBFDFB',
        color: '#1C2A24',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      {/* 1. HEADER */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid #E2EAF0',
          py: 1.8,
          width: '100%',
        }}
      >
        <Box sx={{ px: { xs: 2.5, sm: 4, md: 6, lg: 8 }, width: '100%', boxSizing: 'border-box' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Left: Square logo icon in dark green + SGCS title + subtitle */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '10px',
                  backgroundColor: BRAND_GREEN,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(31, 77, 58, 0.25)',
                }}
              >
                <AccountBalanceOutlinedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: '#1C2A24',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    fontSize: '1.25rem',
                  }}
                >
                  SGCS
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    display: 'block',
                    textTransform: 'uppercase',
                  }}
                >
                  MUNICIPAL CORPORATION SYSTEM
                </Typography>
              </Box>
            </Box>

            {/* Center Nav: Home, Civic Services, Community, How It Works, About */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4.5 }}>
              <Typography
                onClick={() => navigate('/')}
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: BRAND_GREEN,
                  cursor: 'pointer',
                  position: 'relative',
                  pb: 0.5,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    backgroundColor: BRAND_GREEN,
                    borderRadius: '2px',
                  },
                }}
              >
                Home
              </Typography>
              <Typography
                onClick={() => scrollToSection('complaints')}
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  '&:hover': { color: BRAND_GREEN },
                }}
              >
                Civic Services
              </Typography>
              <Typography
                onClick={() => scrollToSection('proposals')}
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  '&:hover': { color: BRAND_GREEN },
                }}
              >
                Community
              </Typography>
              <Typography
                onClick={() => scrollToSection('notices')}
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  '&:hover': { color: BRAND_GREEN },
                }}
              >
                How It Works
              </Typography>
              <Typography
                onClick={() => scrollToSection('analytics')}
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  '&:hover': { color: BRAND_GREEN },
                }}
              >
                About
              </Typography>
            </Box>

            {/* Right: Search icon, Sign In link, Create Account button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {searchActive ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '20px',
                    px: 1.8,
                    py: 0.4,
                  }}
                >
                  <SearchIcon sx={{ color: '#64748B', fontSize: 18, mr: 0.8 }} />
                  <InputBase
                    autoFocus
                    placeholder="Search civic services..."
                    sx={{ fontSize: '0.85rem', width: 160 }}
                    onBlur={() => setSearchActive(false)}
                  />
                </Box>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => setSearchActive(true)}
                  sx={{ color: '#475569', '&:hover': { color: BRAND_GREEN } }}
                >
                  <SearchIcon sx={{ fontSize: 22 }} />
                </IconButton>
              )}

              <Button
                onClick={() => navigate('/login')}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  color: '#1C2A24',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  px: 2.2,
                  '&:hover': { backgroundColor: 'transparent', color: BRAND_GREEN },
                }}
              >
                Sign In
              </Button>

              <Button
                onClick={() => navigate('/register')}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: '8px',
                  backgroundColor: BRAND_GREEN,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  px: 3,
                  py: 1.1,
                  '&:hover': {
                    backgroundColor: BRAND_GREEN_HOVER,
                  },
                }}
              >
                Create Account
              </Button>

              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ display: { xs: 'flex', md: 'none' }, color: '#1C2A24' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 2. HERO SECTION WITH EXACT BACKGROUND IMAGE & COLOR-GRADED HARMONY */}
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          backgroundImage:
            'linear-gradient(to right, #FAFCFA 0%, rgba(250, 252, 250, 0.85) 30%, rgba(250, 252, 250, 0.2) 55%, rgba(250, 252, 250, 0) 75%), url(/sgcs_hero_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'top center', md: 'calc(50% - 110px) 70%' },
          backgroundRepeat: 'no-repeat',
          py: { xs: 6, sm: 8, md: 9, lg: 10 },
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 2.5, sm: 4, md: 6, lg: 8 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '48% 52%' },
              gap: { xs: 4, lg: '24px' },
              alignItems: 'center',
            }}
          >
            {/* Left Half: Text Content Overlay */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Box sx={{ pr: { lg: 2 } }}>
                {/* Pill/Badge */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: '#E8F3ED',
                    border: '1px solid #D1E5DA',
                    borderRadius: '50px',
                    px: 2.2,
                    py: 0.7,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: '#2C5E48',
                      letterSpacing: '0.08em',
                      fontSize: '0.725rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    CITIZEN • COUNCILLOR • CLEANER • A BETTER CITY
                  </Typography>
                </Box>

                {/* Large 3-line Headline */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.4rem', md: '4rem' },
                    fontWeight: 900,
                    color: '#18231E',
                    letterSpacing: '-0.035em',
                    lineHeight: 1.08,
                    mb: 2.5,
                  }}
                >
                  Your City.<br />
                  <Box component="span" sx={{ color: '#18231E' }}>
                    Your Voice.<br />
                  </Box>
                  <Box component="span" sx={{ color: '#236B4E' }}>
                    Better Governance.
                  </Box>
                </Typography>

                {/* Supporting Paragraph */}
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: { xs: '0.98rem', md: '1.1rem' },
                    lineHeight: 1.6,
                    maxWidth: 500,
                    mb: 4,
                  }}
                >
                  Report civic issues, track resolution progress, participate in community proposals, and stay informed — together for a cleaner, safer and brighter city.
                </Typography>

                {/* Two CTA Buttons Side by Side */}
                <Stack direction="row" spacing={2} sx={{ mb: 4.5, flexWrap: 'wrap', gap: 1.5 }}>
                  <Button
                    onClick={() => navigate('/register')}
                    variant="contained"
                    disableElevation
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: '8px',
                      backgroundColor: '#236B4E',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      px: 3.6,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#1C563E',
                      },
                    }}
                  >
                    Report an Issue
                  </Button>

                  <Button
                    onClick={() => scrollToSection('complaints')}
                    variant="outlined"
                    sx={{
                      borderRadius: '8px',
                      borderColor: '#D1DCD6',
                      color: '#18231E',
                      backgroundColor: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      px: 3.2,
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#236B4E',
                        backgroundColor: '#E8F3ED',
                        color: '#236B4E',
                      },
                    }}
                  >
                    Explore Civic Services
                  </Button>
                </Stack>

                {/* Row of 4 Thin Line Feature Icons with Labels */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 2,
                    pt: 3,
                    borderTop: '1px solid #D1DCD6',
                    maxWidth: 520,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GppGoodOutlinedIcon sx={{ color: '#236B4E', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#52665B', fontSize: '0.75rem', lineHeight: 1.2 }}>
                      Verified Citizens
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupsOutlinedIcon sx={{ color: '#236B4E', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#52665B', fontSize: '0.75rem', lineHeight: 1.2 }}>
                      Direct Field Dispatch
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionOutlinedIcon sx={{ color: '#236B4E', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#52665B', fontSize: '0.75rem', lineHeight: 1.2 }}>
                      Transparent Tracking
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ParkOutlinedIcon sx={{ color: '#236B4E', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#52665B', fontSize: '0.75rem', lineHeight: 1.2 }}>
                      Stronger Communities
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Box>

      {/* 3. CIVIC MODULE CARDS */}
      <Box id="complaints" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FFFFFF', position: 'relative', borderTop: '1px solid #E2EAF0' }}>
        <Box sx={{ px: { xs: 2.5, sm: 4, md: 6, lg: 8 }, width: '100%', boxSizing: 'border-box' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
          >
            <Box sx={{ textAlign: 'center', maxWidth: 660, mx: 'auto', mb: 7 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: BRAND_GREEN, letterSpacing: '0.1em', display: 'block', mb: 1.5, textTransform: 'uppercase' }}>
                CIVIC SERVICES & CAPABILITIES
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#1C2A24', fontSize: { xs: '2rem', md: '2.6rem' }, letterSpacing: '-0.03em', mb: 2 }}>
                End-to-End Municipal Infrastructure Triage
              </Typography>
              <Typography variant="body1" sx={{ color: '#5F7367', fontSize: '1.05rem', lineHeight: 1.65 }}>
                Engineered to handle citizen issue reporting, councillor ward assignments, field worker task completion, and public notice publishing.
              </Typography>
            </Box>
          </motion.div>

          <Box
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={cardContainerVariants}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3.5,
              width: '100%',
            }}
          >
            {[
              {
                icon: <ReportProblemOutlinedIcon sx={{ fontSize: 26 }} />,
                title: 'Grievance Reporting',
                desc: 'Citizens upload photo evidence with automatic GPS location tagging and precise ward mapping.',
                bg: BRAND_GREEN_LIGHT,
                badgeBg: BRAND_GREEN,
              },
              {
                icon: <HowToVoteOutlinedIcon sx={{ fontSize: 26 }} />,
                title: 'Councillor Triage',
                desc: 'Ward councillors inspect incoming complaints, set priority SLAs, and assign local workers.',
                bg: '#FDF2E9',
                badgeBg: BRAND_ORANGE,
              },
              {
                icon: <EngineeringOutlinedIcon sx={{ fontSize: 26 }} />,
                title: 'Worker Verification',
                desc: 'Field workers execute repairs and submit mandatory completion photos before ticket closure.',
                bg: '#F5F3FF',
                badgeBg: '#8B5CF6',
              },
              {
                icon: <CampaignOutlinedIcon sx={{ fontSize: 26 }} />,
                title: 'Public Bulletins',
                desc: 'Councillors publish ward notices, maintenance schedules, and budget proposals transparently.',
                bg: '#EBF5FB',
                badgeBg: '#2980B9',
              },
            ].map((card, idx) => (
              <Box
                key={idx}
                component={motion.div}
                variants={singleCardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    borderRadius: '16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2EAF0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: '0 14px 32px rgba(0, 0, 0, 0.06)',
                      borderColor: card.badgeBg,
                    },
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '12px',
                        backgroundColor: card.bg,
                        color: card.badgeBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                      }}
                    >
                      {card.icon}
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: '#1C2A24',
                        mb: 1,
                        fontSize: '1.15rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#5F7367',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {card.desc}
                    </Typography>
                  </Box>

                  <Button
                    onClick={() => navigate('/register')}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      mt: 3,
                      justifyContent: 'flex-start',
                      px: 0,
                      color: card.badgeBg,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      '&:hover': { backgroundColor: 'transparent', opacity: 0.8 },
                    }}
                  >
                    Explore Service
                  </Button>
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 4. CIVIC PROPOSALS & NOTICES SECTION */}
      <Box id="proposals" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F2F7F4', borderTop: '1px solid #E2EAF0' }}>
        <Box sx={{ px: { xs: 2.5, sm: 4, md: 6, lg: 8 }, width: '100%', boxSizing: 'border-box' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 6,
              alignItems: 'center',
            }}
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeInUp}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: BRAND_GREEN, letterSpacing: '0.1em', display: 'block', mb: 1.5, textTransform: 'uppercase' }}>
                COMMUNITY VOTING & PROPOSALS
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#1C2A24', fontSize: { xs: '2rem', md: '2.5rem' }, mb: 2.5, letterSpacing: '-0.03em' }}>
                Vote on Local Ward Development Projects
              </Typography>
              <Typography variant="body1" sx={{ color: '#5F7367', fontSize: '1.05rem', lineHeight: 1.65, mb: 4 }}>
                SGCS enables citizens to participate directly in municipal planning. Review proposed road repairs, park renovations, and streetlighting upgrades, and cast your vote.
              </Typography>
              <Button
                onClick={() => navigate('/register')}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: '8px',
                  backgroundColor: BRAND_GREEN,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  px: 3.8,
                  py: 1.4,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: BRAND_GREEN_HOVER },
                }}
              >
                Explore Active Proposals
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeInUp}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '20px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2EAF0',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.04)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      backgroundColor: BRAND_GREEN_LIGHT,
                      color: BRAND_GREEN,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <HowToVoteOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1C2A24', fontSize: '1.05rem' }}>
                      Ward 12 Solar Streetlight Installation
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5F7367' }}>
                      Proposed by Councillor Rajesh Kumar • 420 Votes
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}>
                  Installation of 85 solar LED streetlights along MG Road main thoroughfare to improve night security and energy efficiency.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', p: 2, borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: BRAND_GREEN }}>
                    STATUS: COMMUNITY REVIEW (84% APPROVAL)
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => navigate('/login')} sx={{ textTransform: 'none', borderRadius: '6px', borderColor: BRAND_GREEN, color: BRAND_GREEN }}>
                    Cast Vote
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </Box>
      </Box>

      {/* 5. FOOTER */}
      <Box component="footer" sx={{ backgroundColor: '#1C2A24', color: '#94A3B8', py: 6 }}>
        <Box sx={{ px: { xs: 2.5, sm: 4, md: 6, lg: 8 }, width: '100%', boxSizing: 'border-box' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '7px',
                  backgroundColor: BRAND_GREEN,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <AccountBalanceOutlinedIcon sx={{ fontSize: 21 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                SGCS Municipal Corporation System
              </Typography>
            </Box>

            <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }} onClick={() => scrollToSection('complaints')}>
                Civic Services
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }} onClick={() => scrollToSection('proposals')}>
                Community Proposals
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }} onClick={() => navigate('/login')}>
                Portal Login
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }} onClick={() => navigate('/register')}>
                Citizen Registration
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>
              © 2026 Smart Governance & Civic Corporation System. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 280, p: 3, backgroundColor: '#FFFFFF' } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C2A24' }}>
            SGCS
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => scrollToSection('complaints')}>
              <ListItemText primary={<Typography sx={{ fontWeight: 600, color: '#1C2A24' }}>Civic Services</Typography>} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => scrollToSection('proposals')}>
              <ListItemText primary={<Typography sx={{ fontWeight: 600, color: '#1C2A24' }}>Community</Typography>} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setMobileDrawerOpen(false); navigate('/login'); }}>
              <ListItemText primary={<Typography sx={{ fontWeight: 600, color: '#1C2A24' }}>Sign In</Typography>} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setMobileDrawerOpen(false); navigate('/register'); }}>
              <ListItemText primary={<Typography sx={{ fontWeight: 700, color: BRAND_GREEN }}>Create Account</Typography>} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default LandingPage;
