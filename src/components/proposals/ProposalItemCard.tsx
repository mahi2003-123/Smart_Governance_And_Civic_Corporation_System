import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Stack,
  Divider,
  Collapse,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { CommunityProposal } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';

interface ProposalItemCardProps {
  proposal: CommunityProposal;
  onVote: (proposalId: string, voteType: 'UP' | 'DOWN') => Promise<void>;
  onComment: (proposalId: string, commentText: string) => Promise<void>;
  extraActions?: React.ReactNode;
}

export const ProposalItemCard: React.FC<ProposalItemCardProps> = ({
  proposal,
  onVote,
  onComment,
  extraActions,
}) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);

  const comments = proposal.comments || [];
  const hasUpvoted = proposal.userVoted === 'UP';
  const hasDownvoted = proposal.userVoted === 'DOWN';

  const handleVoteClick = async (type: 'UP' | 'DOWN') => {
    if (voting) return;
    setVoting(true);
    try {
      await onVote(proposal.id, type);
    } catch (e) {
      console.error(e);
    } finally {
      setVoting(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmittingComment(true);
    try {
      await onComment(proposal.id, commentInput.trim());
      setCommentInput('');
      setShowComments(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatRoleLabel = (role?: string) => {
    if (!role) return 'CITIZEN';
    return role.toUpperCase();
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'COUNCILLOR':
        return { bg: '#E8EFE9', text: '#304B3A', border: '#496A57' };
      case 'ADMIN':
        return { bg: '#FDE8E8', text: '#B45D59', border: '#B45D59' };
      case 'WORKER':
        return { bg: '#FBF4E8', text: '#B58A45', border: '#B58A45' };
      default:
        return { bg: '#F3F5F2', text: '#68706B', border: '#E5E8E4' };
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: '10px',
        border: '1px solid #E5E8E4',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: '#496A57' },
      }}
    >
      {/* Proposal Header Meta */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={proposal.category} size="small" sx={{ backgroundColor: '#E8EFE9', color: '#304B3A', fontWeight: 600, height: 24 }} />
          <Typography variant="caption" sx={{ color: '#68706B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Proposed by: <strong>{proposal.authorName}</strong>
          </Typography>
          <Chip
            label={formatRoleLabel(proposal.authorRole)}
            size="small"
            variant="outlined"
            sx={{
              height: 20,
              fontSize: '0.675rem',
              fontWeight: 600,
              borderColor: getRoleBadgeColor(proposal.authorRole).border,
              color: getRoleBadgeColor(proposal.authorRole).text,
            }}
          />
        </Box>
        <StatusBadge status={proposal.status} />
      </Box>

      {/* Title */}
      <Typography variant="h3" sx={{ fontWeight: 600, color: '#202522', mb: 1, fontSize: '1.25rem' }}>
        {proposal.title}
      </Typography>

      {/* Ward Location */}
      <Typography variant="caption" sx={{ color: '#68706B', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <LocationCityOutlinedIcon sx={{ fontSize: 16, color: '#496A57' }} /> Jurisdiction: {proposal.ward}
      </Typography>

      {/* Description */}
      <Typography variant="body2" sx={{ color: '#4A524D', mb: 2.5, lineHeight: 1.6 }}>
        {proposal.description}
      </Typography>

      {/* Councillor Remarks if present */}
      {proposal.councillorNotes && (
        <Box sx={{ mb: 2.5, p: 2, backgroundColor: '#F8F9F7', borderRadius: '8px', borderLeft: '3px solid #496A57' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#304B3A', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} /> Councillor Remarks
          </Typography>
          <Typography variant="body2" sx={{ color: '#202522', fontStyle: 'italic' }}>
            "{proposal.councillorNotes}"
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 2, borderColor: '#E5E8E4' }} />

      {/* Interactive Toolbar: Vote & Comment Options */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Upvote Button */}
          <Button
            size="small"
            disabled={voting}
            onClick={() => handleVoteClick('UP')}
            startIcon={
              hasUpvoted ? (
                <ThumbUpIcon sx={{ color: '#304B3A', fontSize: 16 }} />
              ) : (
                <ThumbUpOutlinedIcon sx={{ color: '#68706B', fontSize: 16 }} />
              )
            }
            sx={{
              color: hasUpvoted ? '#304B3A' : '#202522',
              backgroundColor: hasUpvoted ? '#E8EFE9' : '#FFFFFF',
              border: `1px solid ${hasUpvoted ? '#496A57' : '#E5E8E4'}`,
              borderRadius: '6px',
              px: 1.8,
              py: 0.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.825rem',
              '&:hover': {
                backgroundColor: '#F3F5F2',
                borderColor: '#496A57',
              },
            }}
          >
            Upvote ({proposal.upvotes || 0})
          </Button>

          {/* Downvote Button */}
          <Button
            size="small"
            disabled={voting}
            onClick={() => handleVoteClick('DOWN')}
            startIcon={
              hasDownvoted ? (
                <ThumbDownIcon sx={{ color: '#B45D59', fontSize: 16 }} />
              ) : (
                <ThumbDownOutlinedIcon sx={{ color: '#68706B', fontSize: 16 }} />
              )
            }
            sx={{
              color: hasDownvoted ? '#B45D59' : '#202522',
              backgroundColor: hasDownvoted ? '#FDE8E8' : '#FFFFFF',
              border: `1px solid ${hasDownvoted ? '#B45D59' : '#E5E8E4'}`,
              borderRadius: '6px',
              px: 1.8,
              py: 0.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.825rem',
              '&:hover': {
                backgroundColor: '#FDE8E8',
                borderColor: '#B45D59',
              },
            }}
          >
            Downvote ({proposal.downvotes || 0})
          </Button>

          {/* Toggle Comments Button */}
          <Button
            size="small"
            onClick={() => setShowComments((prev) => !prev)}
            startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16, color: showComments ? '#496A57' : '#68706B' }} />}
            sx={{
              color: showComments ? '#304B3A' : '#68706B',
              backgroundColor: showComments ? '#F3F5F2' : 'transparent',
              borderRadius: '6px',
              px: 1.5,
              py: 0.5,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.825rem',
              '&:hover': { backgroundColor: '#F3F5F2' },
            }}
          >
            Comments ({comments.length})
          </Button>
        </Box>

        {extraActions && <Box>{extraActions}</Box>}
      </Box>

      {/* Expandable Comments Section */}
      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed #E5E8E4' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202522', mb: 2 }}>
            Public Discussions & Feedback ({comments.length})
          </Typography>

          {/* List of Comments */}
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            {comments.length === 0 ? (
              <Typography variant="caption" sx={{ color: '#68706B', fontStyle: 'italic' }}>
                No comments posted yet. Be the first to express feedback on this community proposal!
              </Typography>
            ) : (
              comments.map((c) => {
                const roleColors = getRoleBadgeColor(c.authorRole);
                const isSelf = user?.fullName === c.authorName;

                return (
                  <Box
                    key={c.id}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: '#F8F9F7',
                      border: '1px solid #E5E8E4',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.75rem',
                            backgroundColor: roleColors.bg,
                            color: roleColors.text,
                            fontWeight: 700,
                          }}
                        >
                          {c.authorName ? c.authorName.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#202522' }}>
                          {c.authorName} {isSelf && '(You)'}
                        </Typography>
                        <Chip
                          label={formatRoleLabel(c.authorRole)}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            backgroundColor: roleColors.bg,
                            color: roleColors.text,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#68706B' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4A524D', pl: 4, lineHeight: 1.5 }}>
                      {c.content}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Stack>

          {/* Add Comment Input Form */}
          <Box component="form" onSubmit={handleSendComment} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={`Comment as ${user?.fullName || 'Citizen'} (${user?.role || 'CITIZEN'})...`}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={submittingComment || !commentInput.trim()}
              endIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '6px',
                backgroundColor: '#496A57',
                color: '#FFFFFF',
                fontWeight: 500,
                px: 2.5,
                py: 1,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#304B3A' },
              }}
            >
              Post
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
