import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { noticeService } from '../../services/noticeService';
import { proposalService } from '../../services/proposalService';
import { Complaint, WardNotice, CommunityProposal } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<WardNotice[]>([]);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [complaintData, noticeData, proposalData] = await Promise.all([
          complaintService.getComplaints(),
          noticeService.getNotices(),
          proposalService.getProposals(),
        ]);
        setComplaints(complaintData);
        setNotices(noticeData);
        setProposals(proposalData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalComplaints = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const proposalCount = proposals.length;

  if (loading) {
    return <LoadingSpinner message="Loading your civic portal..." />;
  }

  // Greeting time calculation
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Citizen';

  return (
    <Box sx={{ pb: 8, maxWidth: 1080, mx: 'auto' }}>
      
      {/* 1. Welcome Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontWeight: 600, color: '#202522', mb: 1, letterSpacing: '-0.015em' }}>
          {greeting}, {firstName}.
        </Typography>
        <Typography variant="body1" sx={{ color: '#68706B', mb: 3, maxWidth: 640 }}>
          Assigned Ward Jurisdiction: <strong style={{ color: '#202522' }}>{user?.ward || 'Ward 1 - Central Town'}</strong>. Monitor public infrastructure activity, file new grievances, or vote on municipal ward proposals.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/citizen/complaints/submit')}
            sx={{
              py: 1,
              px: 2.5,
              borderRadius: '8px',
              backgroundColor: '#496A57',
              color: '#FFFFFF',
              fontWeight: 500,
              fontSize: '0.875rem',
              '&:hover': { backgroundColor: '#304B3A' },
            }}
          >
            Report New Issue
          </Button>

          <Button
            variant="outlined"
            startIcon={<SearchOutlinedIcon sx={{ fontSize: 18, color: '#68706B' }} />}
            onClick={() => navigate('/citizen/track')}
            sx={{
              py: 1,
              px: 2.5,
              borderRadius: '8px',
              borderColor: '#E5E8E4',
              color: '#202522',
              fontWeight: 500,
              fontSize: '0.875rem',
              '&:hover': { borderColor: '#496A57', backgroundColor: '#F3F5F2' },
            }}
          >
            Track Issue
          </Button>
        </Box>
      </Box>

      {/* 2. Your Civic Activity Section (Horizontal Summary instead of colorful cards) */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600, display: 'block', mb: 1 }}>
          YOUR CIVIC ACTIVITY
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#E5E8E4' }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
            gap: 0,
            border: '1px solid #E5E8E4',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            py: 2.5,
          }}
        >
          {/* Total Complaints */}
          <Box
            onClick={() => navigate('/citizen/complaints')}
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: 1,
              borderRight: { sm: '1px solid #E5E8E4' },
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#F8F9F7' },
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#202522', lineHeight: 1, mb: 0.5 }}>
              {String(totalComplaints).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 500, display: 'block' }}>
              Total Complaints
            </Typography>
          </Box>

          {/* In Progress */}
          <Box
            onClick={() => navigate('/citizen/complaints')}
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: 1,
              borderRight: { xs: 'none', sm: '1px solid #E5E8E4' },
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#F8F9F7' },
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#B58A45', lineHeight: 1, mb: 0.5 }}>
              {String(inProgressCount).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 500, display: 'block' }}>
              In Progress
            </Typography>
          </Box>

          {/* Resolved */}
          <Box
            onClick={() => navigate('/citizen/complaints')}
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: 1,
              borderRight: { sm: '1px solid #E5E8E4' },
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#F8F9F7' },
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#527A5E', lineHeight: 1, mb: 0.5 }}>
              {String(resolvedCount).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 500, display: 'block' }}>
              Resolved
            </Typography>
          </Box>

          {/* Proposals */}
          <Box
            onClick={() => navigate('/citizen/proposals')}
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: 1,
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#F8F9F7' },
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 600, color: '#496A57', lineHeight: 1, mb: 0.5 }}>
              {String(proposalCount).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B', fontWeight: 500, display: 'block' }}>
              Proposals
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 3. Grid Split: Recent Activity & Ward Notices */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 6 }}>
        
        {/* LEFT: Recent Activity (Timeline / Editorial List layout) */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600 }}>
              RECENT ACTIVITY
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/citizen/complaints')}
              sx={{ color: '#496A57', textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}
            >
              View all →
            </Button>
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#E5E8E4' }} />

          {complaints.length === 0 ? (
            <Box sx={{ py: 4, textTransform: 'none', color: '#68706B' }}>
              <Typography variant="body2">No recent civic activity recorded for your account.</Typography>
            </Box>
          ) : (
            <Stack spacing={0} sx={{ borderLeft: '1px solid #E5E8E4', ml: 1, pl: 3 }}>
              {complaints.slice(0, 5).map((comp) => {
                const dateStr = new Date(comp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <Box
                    key={comp.id}
                    onClick={() => navigate(`/citizen/complaints/${comp.id}`)}
                    sx={{
                      py: 2,
                      position: 'relative',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F5F2',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': {
                        '& .activity-title': { color: '#496A57' },
                      },
                    }}
                  >
                    {/* Timeline bullet dot */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -29,
                        top: 22,
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        backgroundColor: comp.status === 'RESOLVED' ? '#527A5E' : comp.status === 'IN_PROGRESS' ? '#B58A45' : '#496A57',
                        border: '2px solid #FFFFFF',
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography
                        className="activity-title"
                        variant="body1"
                        sx={{ fontWeight: 500, color: '#202522', transition: 'color 0.15s ease' }}
                      >
                        Complaint #{comp.trackingNumber} — {comp.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#68706B', whiteSpace: 'nowrap', ml: 2 }}>
                        {dateStr}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <StatusBadge status={comp.status} />
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {comp.category} • {comp.ward}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}

              {/* Sample Proposal item in activity stream */}
              {proposals.length > 0 && (
                <Box
                  onClick={() => navigate('/citizen/proposals')}
                  sx={{
                    py: 2,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { '& .proposal-title': { color: '#496A57' } },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -29,
                      top: 22,
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      backgroundColor: '#496A57',
                      border: '2px solid #FFFFFF',
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography className="proposal-title" variant="body1" sx={{ fontWeight: 500, color: '#202522' }}>
                      Proposal #{proposals[0].id.substring(0, 6)} — {proposals[0].title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#68706B' }}>
                      Community Proposal
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    Supported by {proposals[0].upvotes} citizens • {proposals[0].ward}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Box>

        {/* RIGHT: Official Ward Notices (Editorial List layout) */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: '#68706B', fontWeight: 600 }}>
              WARD NOTICES
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/citizen/notices')}
              sx={{ color: '#496A57', textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}
            >
              All notices →
            </Button>
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#E5E8E4' }} />

          <Stack spacing={3}>
            {notices.slice(0, 3).map((item) => (
              <Box
                key={item.id}
                onClick={() => navigate('/citizen/notices')}
                sx={{
                  pb: 2.5,
                  borderBottom: '1px solid #E5E8E4',
                  cursor: 'pointer',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': {
                    '& .notice-heading': { color: '#496A57' },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#496A57', letterSpacing: '0.05em' }}>
                    NOTICE
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#68706B' }}>
                    • {new Date(item.publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                  </Typography>
                </Box>

                <Typography className="notice-heading" variant="subtitle1" sx={{ fontWeight: 600, color: '#202522', mb: 0.5, lineHeight: 1.35, transition: 'color 0.15s ease' }}>
                  {item.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#68706B', mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.content}
                </Typography>

                <Typography variant="caption" sx={{ color: '#496A57', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  View notice →
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Municipal Emergency Line */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E5E8E4', backgroundColor: '#F8F9F7', p: 2.5, borderRadius: '8px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 0.5 }}>
              Municipal Support Line
            </Typography>
            <Typography variant="caption" sx={{ color: '#68706B', display: 'block', mb: 1.5 }}>
              24/7 Helpline: 1800-11-2024 for urgent public emergencies.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => alert('Dialing Helpline: 1800-11-2024')}
              sx={{ borderColor: '#E5E8E4', color: '#202522', textTransform: 'none', fontSize: '0.8rem' }}
            >
              Call 1800-11-2024
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CitizenDashboard;
