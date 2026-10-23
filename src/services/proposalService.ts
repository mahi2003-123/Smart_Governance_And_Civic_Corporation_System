import api from './api';
import { CommunityProposal, ProposalStatus } from '../types';

export const INITIAL_PROPOSALS: CommunityProposal[] = [];

const mapUserVote = (proposal: any, userIdentifier?: string): 'UP' | 'DOWN' | undefined => {
  if (!proposal || !proposal.userVotes || !userIdentifier) return undefined;
  return proposal.userVotes[userIdentifier] || proposal.userVotes[userIdentifier.toLowerCase()] || undefined;
};

export const proposalService = {
  getProposals: async (ward?: string, userIdentifier?: string): Promise<CommunityProposal[]> => {
    const res = await api.get('/proposals', { params: ward ? { ward } : {} });
    const list: any[] = Array.isArray(res.data) ? res.data : [];
    return list.map((p) => ({
      ...p,
      userVoted: mapUserVote(p, userIdentifier),
    }));
  },

  voteProposal: async (
    id: string,
    voteType: 'UP' | 'DOWN',
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    const res = await api.post(`/proposals/${id}/vote`, { voteType });
    const data = res.data;
    return {
      ...data,
      userVoted: mapUserVote(data, userIdentifier),
    };
  },

  addComment: async (
    proposalId: string,
    payload: { content: string; authorName?: string; authorRole?: string },
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    const res = await api.post(`/proposals/${proposalId}/comment`, {
      content: payload.content,
      authorName: payload.authorName,
      authorRole: payload.authorRole || 'CITIZEN',
    });
    const data = res.data;
    return {
      ...data,
      userVoted: mapUserVote(data, userIdentifier),
    };
  },

  createProposal: async (
    payload: {
      title: string;
      category: string;
      description: string;
      ward: string;
      authorName?: string;
      authorRole?: string;
    },
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    const res = await api.post('/proposals', payload);
    const data = res.data;
    return {
      ...data,
      userVoted: mapUserVote(data, userIdentifier),
    };
  },

  updateProposalStatus: async (
    id: string,
    status: ProposalStatus,
    councillorNotes?: string,
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    const res = await api.patch(`/proposals/${id}/status`, { status, councillorNotes });
    const data = res.data;
    return {
      ...data,
      userVoted: mapUserVote(data, userIdentifier),
    };
  },
};
