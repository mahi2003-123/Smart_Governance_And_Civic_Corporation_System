import React from 'react';
import { Box, Typography, Stack, Chip, Divider } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

export const CivicEditorialHeroVisual: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#F8F9F7',
        border: '1px solid #E5E8E4',
        borderRadius: '8px',
        p: { xs: 3, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar: Official Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '4px',
              backgroundColor: '#496A57',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#202522', fontSize: '0.85rem' }}>
              Municipal Ward System
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B', fontSize: '0.725rem' }}>
              Live Grievance & Work Order Tracking
            </Typography>
          </Box>
        </Box>
        <Chip
          label="STATUS: OPERATIONAL"
          size="small"
          sx={{
            backgroundColor: '#E8EFE9',
            color: '#304B3A',
            fontWeight: 700,
            fontSize: '0.7rem',
            borderRadius: '4px',
          }}
        />
      </Box>

      {/* Main Card Preview: Active Work Order */}
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E8E4',
          borderRadius: '6px',
          p: 2.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip
                label="REF: #GRV-2026-0842"
                size="small"
                sx={{ backgroundColor: '#F3F5F2', color: '#202522', fontWeight: 600, fontSize: '0.7rem' }}
              />
              <Chip
                label="ROADS & INFRASTRUCTURE"
                size="small"
                sx={{ backgroundColor: '#E8EFE9', color: '#496A57', fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202522', fontSize: '0.95rem' }}>
              Main Avenue Street Light Repair & Cable Replacement
            </Typography>
          </Box>
          <Chip
            label="In Progress"
            size="small"
            sx={{ backgroundColor: '#FFFBF0', color: '#B87A29', fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>

        <Stack direction="row" spacing={2} sx={{ color: '#68706B', fontSize: '0.8rem', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 15, color: '#496A57' }} />
            <span>Ward 4 — Green Valley South</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 15, color: '#496A57' }} />
            <span>Assigned: Public Works Unit #2</span>
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5, borderColor: '#E5E8E4' }} />

        {/* 4-Step Resolution Pipeline */}
        <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
          WORK ORDER TIMELINE PROGRESS:
        </Typography>

        <GridPipeline />
      </Box>

      {/* Trust Footer Badges */}
      <Stack direction="row" spacing={3} justifyContent="space-between" sx={{ color: '#68706B', fontSize: '0.775rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ShieldOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} />
          <span>Verifiable Public Record</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} />
          <span>Signed Councillor Dispatch</span>
        </Box>
      </Stack>
    </Box>
  );
};

const GridPipeline: React.FC = () => {
  const steps = [
    { num: '01', title: 'Submitted', done: true },
    { num: '02', title: 'Ward Triaged', done: true },
    { num: '03', title: 'Worker Assigned', done: true },
    { num: '04', title: 'Site Inspection', done: false },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
      {steps.map((step, idx) => (
        <Box
          key={idx}
          sx={{
            p: 1,
            borderRadius: '4px',
            backgroundColor: step.done ? '#E8EFE9' : '#F8F9F7',
            border: '1px solid',
            borderColor: step.done ? '#496A57' : '#E5E8E4',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              color: step.done ? '#304B3A' : '#68706B',
              fontSize: '0.7rem',
            }}
          >
            {step.num}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: step.done ? '#202522' : '#68706B',
              fontSize: '0.725rem',
            }}
          >
            {step.title}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CivicEditorialHeroVisual;
