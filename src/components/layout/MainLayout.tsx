import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Minimalist Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container Right Side */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Clean Top Navigation */}
        <Navbar onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Main Content Area - White Canvas with generous whitespace */}
        <Box
          component="main"
          sx={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            py: { xs: 3, md: 5 },
            px: { xs: 2, sm: 4, md: 6 },
            maxWidth: '1360px',
            width: '100%',
            mx: 'auto',
          }}
        >
          {children}
        </Box>

        {/* Minimal Footer */}
        <Box
          component="footer"
          sx={{
            py: 2.5,
            px: 4,
            borderTop: '1px solid #E5E8E4',
            backgroundColor: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: '#68706B', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Smart Governance & Civic Corporation System (SGCS). Public Civic Digital Platform.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
