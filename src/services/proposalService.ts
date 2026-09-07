import api from './api';
import { CommunityProposal, ProposalStatus } from '../types';

export const INITIAL_PROPOSALS: CommunityProposal[] = [];

let proposalsMemory: CommunityProposal[] = [];

export const proposalService = {
  getProposals: async (ward?: string): Promise<CommunityProposal[]> => {
    try {
      const res = await api.get('/proposals', { params: { ward } });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    if (ward) {
      return proposalsMemory.filter((p) => p.ward.toLowerCase().includes(ward.toLowerCase()));
    }
    return proposalsMemory;
  },

  voteProposal: async (id: string, voteType: 'UP' | 'DOWN'): Promise<CommunityProposal> => {
    try {
      const res = await api.post(`/proposals/${id}/vote`, { voteType });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    const index = proposalsMemory.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Proposal not found');

    const item = proposalsMemory[index];
    let up = item.upvotes;
    let down = item.downvotes;

    if (item.userVoted === voteType) {
      if (voteType === 'UP') up -= 1;
      if (voteType === 'DOWN') down -= 1;
      item.userVoted = undefined;
    } else {
      if (item.userVoted === 'UP') up -= 1;
      if (item.userVoted === 'DOWN') down -= 1;

      if (voteType === 'UP') up += 1;
      if (voteType === 'DOWN') down += 1;
      item.userVoted = voteType;
    }

    const updated = { ...item, upvotes: up, downvotes: down };
    proposalsMemory[index] = updated;
    return updated;
  },

  createProposal: async (payload: {
    title: string;
    category: string;
    description: string;
    ward: string;
    authorName: string;
  }): Promise<CommunityProposal> => {
    try {
      const res = await api.post('/proposals', payload);
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    const newProp: CommunityProposal = {
      id: `prp_${Date.now()}`,
      title: payload.title,
      category: payload.category,
      description: payload.description,
      ward: payload.ward,
      authorName: payload.authorName,
      authorRole: 'CITIZEN',
      upvotes: 1,
      downvotes: 0,
      userVoted: 'UP',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    proposalsMemory = [newProp, ...proposalsMemory];
    return newProp;
  },

  updateProposalStatus: async (id: string, status: ProposalStatus, councillorNotes?: string): Promise<CommunityProposal> => {
    try {
      const res = await api.patch(`/proposals/${id}/status`, { status, councillorNotes });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    const index = proposalsMemory.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Proposal not found');

    const updated = {
      ...proposalsMemory[index],
      status,
      councillorNotes: councillorNotes || proposalsMemory[index].councillorNotes
    };

    proposalsMemory[index] = updated;
    return updated;
  }
};
