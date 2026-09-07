import React from 'react';
import { Card, Box, Typography, Stack, Paper, Avatar } from '@mui/material';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

interface AuthHeroCardProps {
  title?: string;
  subtitle?: string;
}

export const AuthHeroCard: React.FC<AuthHeroCardProps> = ({
  title = 'Building Smarter Cities Together',
  subtitle = 'Digital governance platform connecting citizens and local authorities through transparency, collaboration and structured civic services.',
}) => {
  return (
    <Card
      sx={{
        p: { xs: 4, sm: 6 },
        height: '100%',
        borderRadius: '6px',
        backgroundColor: '#0F4C5C',
        color: '#FFFFFF',
        boxShadow: 'none',
        border: '1px solid #0A343F',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'rgba(200, 90, 50, 0.15)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Government Branding Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LocationCityIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.1,
              }}
            >
              SGCS Civic Portal
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 600, letterSpacing: '0.05em' }}>
              SMART GOVERNANCE DIGITAL PORTAL
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: { xs: '2rem', sm: '2.3rem', md: '2.5rem' },
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', mb: 5, lineHeight: 1.7 }}>
          {subtitle}
        </Typography>

        {/* Civic Feature Badges */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#FFFFFF',
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(200, 90, 50, 0.3)', color: '#FFFFFF', width: 44, height: 44, borderRadius: '6px' }}>
              <SpeedIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Structured Grievance Engine
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Report potholes, water & lighting issues with explicit ward locations and SMS alerts.
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#FFFFFF',
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(200, 90, 50, 0.3)', color: '#FFFFFF', width: 44, height: 44, borderRadius: '6px' }}>
              <SecurityIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Transparent Ward Resolution
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Direct councillor assignment to field workers with verified completion photo proof.
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#FFFFFF',
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(200, 90, 50, 0.3)', color: '#FFFFFF', width: 44, height: 44, borderRadius: '6px' }}>
              <HowToVoteIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Citizen Proposal Voting
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Propose community projects and vote on neighborhood development initiatives.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>

      <Box sx={{ pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.15)', position: 'relative', zIndex: 1 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          Official Smart City Digital Governance Platform • MCA Major Project
        </Typography>
      </Box>
    </Card>
  );
};
