import api from './api';
import { CommunityProposal, ProposalStatus } from '../types';

export const INITIAL_PROPOSALS: CommunityProposal[] = [
  {
    id: 'prp_001',
    title: 'Installation of Solar Streetlights along Central Park Promenade',
    category: 'Renewable Energy & Lighting',
    description: 'Proposal to equip the entire 1.2 km walking track around Central Park with autonomous solar LED posts to improve nighttime safety for residents while reducing ward electricity expenses.',
    ward: 'Ward 1 - Central Town',
    authorName: 'Rahul Sharma',
    authorRole: 'CITIZEN',
    upvotes: 142,
    downvotes: 8,
    status: 'ACTIVE',
    createdAt: '2026-07-25T10:00:00Z'
  },
  {
    id: 'prp_002',
    title: 'Community Compost Pit & Segregation Hub',
    category: 'Waste Management',
    description: 'Establishment of a localized organic waste composting unit in Sector 4 empty plot. Will produce free garden fertilizer for residents and reduce landfill transport by 30%.',
    ward: 'Ward 1 - Central Town',
    authorName: 'Dr. Ananya Roy',
    authorRole: 'CITIZEN',
    upvotes: 98,
    downvotes: 3,
    status: 'APPROVED',
    councillorNotes: 'Approved during Municipality Board Meeting on Aug 2. Budget allocated.',
    createdAt: '2026-07-15T14:20:00Z'
  },
  {
    id: 'prp_003',
    title: 'Speed Breakers & Zebra Crossing Near St. Jude School',
    category: 'Public Safety & Traffic',
    description: 'Heavy vehicular traffic during morning school hours poses risks to children. Installation of rubber speed bumps and elevated zebra crossings is urgently required.',
    ward: 'Ward 2 - Riverside North',
    authorName: 'Ramesh Gupta',
    authorRole: 'CITIZEN',
    upvotes: 215,
    downvotes: 12,
    status: 'UNDER_REVIEW',
    createdAt: '2026-07-30T09:00:00Z'
  }
];

let proposalsMemory = [...INITIAL_PROPOSALS];

export const proposalService = {
  getProposals: async (ward?: string): Promise<CommunityProposal[]> => {
    try {
      const res = await api.get('/proposals', { params: { ward } });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
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

    await new Promise((res) => setTimeout(res, 150));
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

    await new Promise((res) => setTimeout(res, 300));
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

    await new Promise((res) => setTimeout(res, 200));
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
