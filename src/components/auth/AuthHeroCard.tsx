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
  subtitle = 'Digital governance platform connecting citizens and local authorities through transparency, collaboration and AI-powered civic services.',
}) => {
  return (
    <Card
      sx={{
        p: { xs: 4, sm: 6 },
        height: '100%',
        borderRadius: 5,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%)',
        color: '#FFFFFF',
        boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Glass Blur Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          bgcolor: 'rgba(37, 99, 235, 0.15)',
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
          bgcolor: 'rgba(13, 148, 136, 0.15)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Government Branding Header */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            <LocationCityIcon sx={{ fontSize: 34 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              color="#FFFFFF"
              lineHeight={1.1}
              sx={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              CivicSphere SGCS
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} fontWeight={700} letterSpacing="0.05em">
              SMART GOVERNANCE DIGITAL PORTAL
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h2"
          fontWeight={800}
          color="#FFFFFF"
          gutterBottom
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', mb: 5, lineHeight: 1.7 }}>
          {subtitle}
        </Typography>

        {/* Glassmorphic Feature Badges */}
        <Stack spacing={2} mb={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#FFFFFF',
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.3)', color: '#60A5FA', width: 44, height: 44 }}>
              <SpeedIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF">
                Geo-Tagged Grievance Engine
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Report potholes, water & lighting issues with automated GPS tags and SMS alerts.
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#FFFFFF',
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.3)', color: '#34D399', width: 44, height: 44 }}>
              <SecurityIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF">
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
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#FFFFFF',
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.3)', color: '#FBBF24', width: 44, height: 44 }}>
              <HowToVoteIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF">
                Citizen Proposal Voting
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Propose community projects and vote on neighborhood development initiatives.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>

      <Box pt={3} borderTop="1px solid rgba(255, 255, 255, 0.15)" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          Official Smart City Digital Governance Platform • MCA Major Project
        </Typography>
      </Box>
    </Card>
  );
};
