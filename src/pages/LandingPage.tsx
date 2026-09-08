import React, { useState } from 'react';
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
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import CivicEditorialHeroVisual from '../components/landing/Civic3DHero';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#202522', fontFamily: '"Inter", sans-serif' }}>
      
      {/* 1. HEADER */}
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
            {/* Left: SGCS Identity / Logo */}
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
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#202522', fontSize: '1.05rem', lineHeight: 1.1 }}>
                  SGCS
                </Typography>
                <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.7rem', display: 'block', letterSpacing: '0.04em', fontWeight: 600 }}>
                  MUNICIPAL CORPORATION SYSTEM
                </Typography>
              </Box>
            </Box>

            {/* Center/Right Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3.5 }}>
              <Typography
                variant="body2"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{ color: '#68706B', fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#496A57' } }}
              >
                How It Works
              </Typography>
              <Typography
                variant="body2"
                onClick={() => {
                  const el = document.getElementById('civic-services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{ color: '#68706B', fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#496A57' } }}
              >
                Civic Services
              </Typography>
              <Typography
                variant="body2"
                onClick={() => {
                  const el = document.getElementById('community');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{ color: '#68706B', fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#496A57' } }}
              >
                Community
              </Typography>
              <Typography
                variant="body2"
                onClick={() => {
                  const el = document.getElementById('transparency');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{ color: '#68706B', fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#496A57' } }}
              >
                About
              </Typography>
            </Box>

            {/* Right CTAs */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  color: '#202522',
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
                  backgroundColor: '#496A57',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.85,
                  '&:hover': { backgroundColor: '#304B3A' },
                }}
              >
                Create Account
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. HERO SECTION */}
      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 6, md: 9 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, gap: 6, alignItems: 'center' }}>
            
            {/* Left Content */}
            <Box>
              <Chip
                label="MUNICIPAL DIGITAL CIVIC SERVICE"
                size="small"
                sx={{
                  backgroundColor: '#E8EFE9',
                  color: '#304B3A',
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  letterSpacing: '0.05em',
                  py: 0.5,
                  px: 1.5,
                  mb: 2.5,
                  borderRadius: '4px',
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.3rem', sm: '3rem', md: '3.4rem' },
                  fontWeight: 800,
                  color: '#202522',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  mb: 2.5,
                }}
              >
                Your City.<br />
                Your Voice.<br />
                <span style={{ color: '#496A57' }}>Better Governance.</span>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#68706B',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.65,
                  mb: 4,
                  maxWidth: 520,
                }}
              >
                Report public grievances, track ward resolution progress, participate in community proposals, and receive verified announcements from your local councillor.
              </Typography>

              {/* CTAs */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: '6px',
                    backgroundColor: '#496A57',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.2,
                    '&:hover': { backgroundColor: '#304B3A' },
                  }}
                >
                  Report an Issue
                </Button>
                <Button
                  onClick={() => {
                    const el = document.getElementById('civic-services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  variant="outlined"
                  sx={{
                    borderRadius: '6px',
                    borderColor: '#E5E8E4',
                    color: '#202522',
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.2,
                    backgroundColor: '#FFFFFF',
                    '&:hover': { borderColor: '#496A57', backgroundColor: '#F8F9F7' },
                  }}
                >
                  Explore Civic Services
                </Button>
              </Box>

              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', color: '#68706B', fontSize: '0.85rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> Verified Ward Routing
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> Direct Field Dispatch
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> Transparent History
                </Box>
              </Stack>
            </Box>

            {/* Right Content: Editorial Civic Visual */}
            <Box>
              <CivicEditorialHeroVisual />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 3. TRUST / PURPOSE SECTION */}
      <Box sx={{ py: { xs: 7, md: 9 }, backgroundColor: '#F8F9F7', borderTop: '1px solid #E5E8E4', borderBottom: '1px solid #E5E8E4' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#496A57', fontWeight: 700, display: 'block', mb: 1 }}>
              MUNICIPAL PURPOSE
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: '#202522', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              One platform for everyday civic participation.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            
            {/* Action 1: Report */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '4px', backgroundColor: '#E8EFE9', color: '#496A57', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <ReportProblemOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 0.75 }}>
                Report
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.55 }}>
                Submit civic grievances directly with photo evidence and ward specification.
              </Typography>
            </Paper>

            {/* Action 2: Track */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '4px', backgroundColor: '#E8EFE9', color: '#496A57', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <TrackChangesOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 0.75 }}>
                Track
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.55 }}>
                Monitor work order assignments, status updates, and repair progress step-by-step.
              </Typography>
            </Paper>

            {/* Action 3: Participate */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '4px', backgroundColor: '#E8EFE9', color: '#496A57', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <HowToVoteOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 0.75 }}>
                Participate
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.55 }}>
                Submit local development proposals and vote on community initiatives in your ward.
              </Typography>
            </Paper>

            {/* Action 4: Stay Informed */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '4px', backgroundColor: '#E8EFE9', color: '#496A57', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <CampaignOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 0.75 }}>
                Stay Informed
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.55 }}>
                Receive official bulletins, maintenance advisories, and councillor notices directly.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* 4. HOW IT WORKS */}
      <Box id="how-it-works" sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#496A57', fontWeight: 700, display: 'block', mb: 1 }}>
              SERVICE FLOW
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: '#202522', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              How Civic Complaints Are Resolved
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            
            {/* Step 1 */}
            <Box sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#F8F9F7' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#496A57', fontSize: '1.5rem', mb: 1.5 }}>
                01
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                Report a civic issue
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Submit a complaint specifying your municipal ward, location details, category, and issue photo.
              </Typography>
            </Box>

            {/* Step 2 */}
            <Box sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#F8F9F7' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#496A57', fontSize: '1.5rem', mb: 1.5 }}>
                02
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                Ward team reviews it
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Your local ward councillor and administration triage the issue and issue a work order.
              </Typography>
            </Box>

            {/* Step 3 */}
            <Box sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#F8F9F7' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#496A57', fontSize: '1.5rem', mb: 1.5 }}>
                03
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                Local worker handles task
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Assigned field technicians inspect the location, perform necessary repairs, and upload completion proof.
              </Typography>
            </Box>

            {/* Step 4 */}
            <Box sx={{ p: 3, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#F8F9F7' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#496A57', fontSize: '1.5rem', mb: 1.5 }}>
                04
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 1 }}>
                Track the resolution
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6 }}>
                Receive immediate status update notifications and inspect the verified resolution record.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 5. CIVIC SERVICES */}
      <Box id="civic-services" sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#F8F9F7', borderTop: '1px solid #E5E8E4', borderBottom: '1px solid #E5E8E4' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#496A57', fontWeight: 700, display: 'block', mb: 1 }}>
              DIGITAL PORTAL MODULES
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: '#202522', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Comprehensive Municipal Civic Services
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3.5 }}>
            
            <Paper elevation={0} sx={{ p: 4, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#496A57', fontSize: '1.1rem', mb: 1 }}>
                Civic Complaints & Grievance Triage
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6, mb: 2 }}>
                Report infrastructure defects including damaged roads, broken street lighting, drainage blockages, or sanitation issues. Every complaint is tracked under a unique reference ID.
              </Typography>
              <Button
                onClick={() => navigate('/register')}
                size="small"
                sx={{ color: '#496A57', fontWeight: 700, p: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
              >
                Submit New Complaint →
              </Button>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#496A57', fontSize: '1.1rem', mb: 1 }}>
                Community Proposals & Budgeting
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6, mb: 2 }}>
                Propose ward improvement projects like public parks, pedestrian walkways, or street lighting extensions. Vote on community proposals submitted by fellow residents.
              </Typography>
              <Button
                onClick={() => navigate('/register')}
                size="small"
                sx={{ color: '#496A57', fontWeight: 700, p: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
              >
                View Ward Proposals →
              </Button>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#496A57', fontSize: '1.1rem', mb: 1 }}>
                Official Ward Bulletins & Notices
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6, mb: 2 }}>
                Stay up to date with official announcements published directly by your elected ward councillor. Access downloadable municipal attachments and public notices.
              </Typography>
              <Button
                onClick={() => navigate('/login')}
                size="small"
                sx={{ color: '#496A57', fontWeight: 700, p: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
              >
                Browse Ward Notices →
              </Button>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '6px', border: '1px solid #E5E8E4', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#496A57', fontSize: '1.1rem', mb: 1 }}>
                Field Work & Development Tracking
              </Typography>
              <Typography variant="body2" sx={{ color: '#68706B', lineHeight: 1.6, mb: 2 }}>
                Dedicated digital portals for municipal field workers and department supervisors to manage task queues, log completion metrics, and maintain operational transparency.
              </Typography>
              <Button
                onClick={() => navigate('/login')}
                size="small"
                sx={{ color: '#496A57', fontWeight: 700, p: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
              >
                Staff Portal Sign In →
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* 6. COMMUNITY PARTICIPATION */}
      <Box id="community" sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <Chip
                label="CITIZEN EMPOWERMENT"
                size="small"
                sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', fontWeight: 700, fontSize: '0.725rem', mb: 2, borderRadius: '4px' }}
              />
              <Typography variant="h2" sx={{ fontWeight: 800, color: '#202522', mb: 2 }}>
                Help shape what happens in your ward.
              </Typography>
              <Typography variant="body1" sx={{ color: '#68706B', lineHeight: 1.65, mb: 3 }}>
                Democratic ward management requires direct public input. Through SGCS, citizens can submit actionable proposals for local infrastructure projects and endorse initiatives that benefit their neighborhood.
              </Typography>
              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CheckCircleOutlinedIcon sx={{ color: '#496A57', fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>
                    Submit detailed proposal descriptions with estimated ward impact
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CheckCircleOutlinedIcon sx={{ color: '#496A57', fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>
                    Upvote proposals to demonstrate community support to your councillor
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CheckCircleOutlinedIcon sx={{ color: '#496A57', fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" sx={{ color: '#202522', fontWeight: 500 }}>
                    Track approved projects from budget allocation to ground execution
                  </Typography>
                </Box>
              </Stack>
              <Button
                onClick={() => navigate('/register')}
                variant="contained"
                sx={{ backgroundColor: '#496A57', color: '#FFFFFF', fontWeight: 700, px: 3.5, py: 1.1, '&:hover': { backgroundColor: '#304B3A' } }}
              >
                Join Ward Community
              </Button>
            </Box>

            <Box sx={{ p: 4, borderRadius: '8px', border: '1px solid #E5E8E4', backgroundColor: '#F8F9F7' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', mb: 2 }}>
                Active Ward Proposal Example
              </Typography>
              <Box sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E8E4', borderRadius: '6px', p: 3, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Chip label="PROPOSAL #PR-104" size="small" sx={{ backgroundColor: '#E8EFE9', color: '#496A57', fontWeight: 700, fontSize: '0.7rem' }} />
                  <Chip label="148 Community Votes" size="small" sx={{ backgroundColor: '#F3F5F2', color: '#202522', fontWeight: 600, fontSize: '0.7rem' }} />
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#202522', fontSize: '1rem', mb: 1 }}>
                  Installation of Solar Street Lights along Riverside Park
                </Typography>
                <Typography variant="body2" sx={{ color: '#68706B', mb: 2 }}>
                  Proposed by Ward 2 Residents Council for improved night safety and energy efficiency.
                </Typography>
                <Box sx={{ height: 6, backgroundColor: '#E5E8E4', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: '75%', height: '100%', backgroundColor: '#496A57' }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 7. TRANSPARENCY / TRACKING */}
      <Box id="transparency" sx={{ py: { xs: 7, md: 9 }, backgroundColor: '#F8F9F7', borderTop: '1px solid #E5E8E4', borderBottom: '1px solid #E5E8E4' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 5 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#496A57', fontWeight: 700, display: 'block', mb: 1 }}>
              GOVERNANCE TRANSPARENCY
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: '#202522', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Real-Time Grievance Pipeline
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, textAlign: 'center' }}>
            <Box sx={{ p: 3, backgroundColor: '#FFFFFF', border: '1px solid #E5E8E4', borderRadius: '6px' }}>
              <Chip label="STEP 1" size="small" sx={{ mb: 1, backgroundColor: '#F3F5F2', color: '#68706B', fontWeight: 700 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522' }}>Submitted</Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>Registered in database</Typography>
            </Box>
            <Box sx={{ p: 3, backgroundColor: '#FFFFFF', border: '1px solid #E5E8E4', borderRadius: '6px' }}>
              <Chip label="STEP 2" size="small" sx={{ mb: 1, backgroundColor: '#F3F5F2', color: '#68706B', fontWeight: 700 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522' }}>Under Review</Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>Councillor triage</Typography>
            </Box>
            <Box sx={{ p: 3, backgroundColor: '#FFFFFF', border: '1px solid #E5E8E4', borderRadius: '6px' }}>
              <Chip label="STEP 3" size="small" sx={{ mb: 1, backgroundColor: '#FFFBF0', color: '#B87A29', fontWeight: 700 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522' }}>In Progress</Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>Worker on site</Typography>
            </Box>
            <Box sx={{ p: 3, backgroundColor: '#FFFFFF', border: '1px solid #E5E8E4', borderRadius: '6px' }}>
              <Chip label="STEP 4" size="small" sx={{ mb: 1, backgroundColor: '#E8EFE9', color: '#304B3A', fontWeight: 700 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522' }}>Resolved</Typography>
              <Typography variant="caption" sx={{ color: '#68706B' }}>Closed with proof</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 8. FINAL CTA */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: '#FFFFFF', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#202522', mb: 2, fontSize: { xs: '1.85rem', md: '2.4rem' } }}>
            Make your voice part of better governance.
          </Typography>
          <Typography variant="body1" sx={{ color: '#68706B', mb: 4, maxWidth: 540, mx: 'auto', lineHeight: 1.6 }}>
            Register your citizen account today to connect with your municipal ward team and monitor local civic infrastructure repairs.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              onClick={() => navigate('/register')}
              variant="contained"
              sx={{ backgroundColor: '#496A57', color: '#FFFFFF', fontWeight: 700, px: 4, py: 1.2, '&:hover': { backgroundColor: '#304B3A' } }}
            >
              Report an Issue
            </Button>
            <Button
              onClick={() => navigate('/register')}
              variant="outlined"
              sx={{ borderColor: '#E5E8E4', color: '#202522', fontWeight: 600, px: 4, py: 1.2, '&:hover': { borderColor: '#496A57', backgroundColor: '#F8F9F7' } }}
            >
              Create Account
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* 9. FOOTER */}
      <Box component="footer" sx={{ backgroundColor: '#202522', color: '#E5E8E4', py: 6, borderTop: '1px solid #E5E8E4' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 4, mb: 4 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '4px', backgroundColor: '#496A57', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  SGCS Municipal Portal
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#9DA49F', maxWidth: 320, lineHeight: 1.6 }}>
                Smart Governance & Civic Corporation System — Official municipal service delivery platform for transparent ward administration.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>
                Civic Services
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: '#9DA49F', cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }} onClick={() => navigate('/register')}>Report Grievance</Typography>
                <Typography variant="caption" sx={{ color: '#9DA49F', cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }} onClick={() => navigate('/login')}>Track Work Order</Typography>
                <Typography variant="caption" sx={{ color: '#9DA49F', cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }} onClick={() => navigate('/register')}>Ward Proposals</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>
                Community
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: '#9DA49F' }}>Ward Directory</Typography>
                <Typography variant="caption" sx={{ color: '#9DA49F' }}>Public Bulletins</Typography>
                <Typography variant="caption" sx={{ color: '#9DA49F' }}>Councillor Portals</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>
                Support & Legal
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: '#9DA49F' }}>Toll-Free: 1800-11-2024</Typography>
                <Typography variant="caption" sx={{ color: '#9DA49F' }}>Privacy Policy</Typography>
                <Typography variant="caption" sx={{ color: '#9DA49F' }}>Terms of Public Service</Typography>
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#353C38', mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" sx={{ color: '#9DA49F' }}>
              © 2026 Smart Governance & Civic Corporation System (SGCS). All Rights Reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: '#9DA49F' }}>
              Official Municipal Corporation Digital System
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
