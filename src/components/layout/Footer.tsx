import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';
import LocationCityIcon from '@mui/icons-material/LocationCity';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#26201D',
        color: '#E8DDD3',
        pt: 6,
        pb: 4,
        mt: 'auto',
        borderTop: '1px solid rgba(232, 221, 211, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        {/* CSS Grid 4 Column Footer */}
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '4fr 3fr 2fr 3fr' }}
          gap={4}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: '#6F4E37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <LocationCityIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={800} color="#FFFFFF">
                SGCS Civic Portal
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6, mb: 2 }}>
              Smart Governance and Civic Corporation System connects citizens directly with municipal authorities, ward councillors, and field teams for transparent urban development.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF" gutterBottom mb={2}>
              Quick Services
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/citizen/complaints" underline="hover" color="inherit" variant="body2">
                File a Complaint
              </Link>
              <Link href="/citizen/history" underline="hover" color="inherit" variant="body2">
                Track Status Online
              </Link>
              <Link href="/citizen/proposals" underline="hover" color="inherit" variant="body2">
                Community Proposals
              </Link>
              <Link href="/citizen/notices" underline="hover" color="inherit" variant="body2">
                Ward Announcements
              </Link>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF" gutterBottom mb={2}>
              Civic Portals
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/councillor/dashboard" underline="hover" color="inherit" variant="body2">
                Councillor Portal
              </Link>
              <Link href="/worker/dashboard" underline="hover" color="inherit" variant="body2">
                Field Worker App
              </Link>
              <Link href="/admin/dashboard" underline="hover" color="inherit" variant="body2">
                Admin Console
              </Link>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF" gutterBottom mb={2}>
              Municipal Helpline
            </Typography>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <PhoneInTalkIcon sx={{ color: '#6F4E37' }} />
              <Typography variant="body2" fontWeight={700} color="#FFFFFF">
                1800-CIVIC-SGCS (Toll Free)
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <EmailIcon sx={{ color: '#6F4E37' }} />
              <Typography variant="body2">helpdesk@sgcs.gov.in</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(232, 221, 211, 0.1)' }} />

        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Smart Governance and Civic Corporation System (SGCS) - MCA Major Project. All Rights Reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Enterprise Govt UX | Designed for Transparency & Speed
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
