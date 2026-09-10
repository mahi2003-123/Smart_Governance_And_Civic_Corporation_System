import api from './api';
import { CommunityProposal, ProposalComment, ProposalStatus } from '../types';

export const INITIAL_PROPOSALS: CommunityProposal[] = [];

const LOCAL_PROPOSALS_KEY = 'sgcs_proposals_store';
const LOCAL_USER_VOTES_KEY = 'sgcs_user_votes_store';

// Helper to get saved proposals from localStorage
const getSavedProposals = (): CommunityProposal[] => {
  try {
    const data = localStorage.getItem(LOCAL_PROPOSALS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading proposals from localStorage:', e);
  }
  return INITIAL_PROPOSALS;
};

// Helper to save proposals to localStorage
const saveProposalsToStorage = (list: CommunityProposal[]) => {
  try {
    localStorage.setItem(LOCAL_PROPOSALS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving proposals to localStorage:', e);
  }
};

// Helper to get user-specific vote for a proposal
const getUserVoteMap = (): Record<string, 'UP' | 'DOWN'> => {
  try {
    const data = localStorage.getItem(LOCAL_USER_VOTES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading user votes map:', e);
  }
  return {};
};

const setUserVoteInStorage = (userIdentifier: string, proposalId: string, voteType?: 'UP' | 'DOWN') => {
  if (!userIdentifier) return;
  const map = getUserVoteMap();
  const key = `${userIdentifier.toLowerCase()}_${proposalId}`;
  if (voteType) {
    map[key] = voteType;
  } else {
    delete map[key];
  }
  try {
    localStorage.setItem(LOCAL_USER_VOTES_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving user votes map:', e);
  }
};

const getUserVoteForProposal = (userIdentifier: string | undefined, proposalId: string): 'UP' | 'DOWN' | undefined => {
  if (!userIdentifier) return undefined;
  const map = getUserVoteMap();
  const key = `${userIdentifier.toLowerCase()}_${proposalId}`;
  return map[key];
};

let proposalsMemory: CommunityProposal[] = getSavedProposals();

export const proposalService = {
  getProposals: async (ward?: string, userIdentifier?: string): Promise<CommunityProposal[]> => {
    let list: CommunityProposal[] = [];

    try {
      const res = await api.get('/proposals', { params: { ward } });
      if (res.data && Array.isArray(res.data)) {
        // Merge backend proposals with local proposalsMemory
        const apiIds = new Set(res.data.map((p: any) => p.id));
        const localOnly = proposalsMemory.filter((p) => !apiIds.has(p.id));
        list = [...localOnly, ...res.data];
      }
    } catch (err) {
      // Fallback
    }

    if (list.length === 0) {
      list = [...proposalsMemory];
    }

    // Filter by ward if requested
    if (ward) {
      list = list.filter((p) => p.ward && p.ward.toLowerCase().includes(ward.toLowerCase()));
    }

    // Attach user-specific vote state for the currently logged in user
    return list.map((p) => ({
      ...p,
      userVoted: getUserVoteForProposal(userIdentifier, p.id),
    }));
  },

  voteProposal: async (
    id: string,
    voteType: 'UP' | 'DOWN',
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    // 1. Send vote to backend API
    try {
      await api.post(`/proposals/${id}/vote`, { voteType });
    } catch (err) {
      // Fallback to local memory & localStorage
    }

    const index = proposalsMemory.findIndex((p) => p.id === id);
    let item: CommunityProposal;

    if (index === -1) {
      // Create memory placeholder if not present
      item = {
        id,
        title: 'Community Proposal',
        category: 'General',
        description: '',
        ward: 'Ward 1 - Central Town',
        authorName: 'Resident',
        upvotes: 0,
        downvotes: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      proposalsMemory.push(item);
    } else {
      item = proposalsMemory[index];
    }

    const currentUserVote = getUserVoteForProposal(userIdentifier, id);
    let up = item.upvotes || 0;
    let down = item.downvotes || 0;
    let newUserVote: 'UP' | 'DOWN' | undefined;

    if (currentUserVote === voteType) {
      // Toggle off (unvote)
      if (voteType === 'UP') up = Math.max(0, up - 1);
      if (voteType === 'DOWN') down = Math.max(0, down - 1);
      newUserVote = undefined;
    } else {
      // Undo previous vote if existed
      if (currentUserVote === 'UP') up = Math.max(0, up - 1);
      if (currentUserVote === 'DOWN') down = Math.max(0, down - 1);

      // Apply new vote
      if (voteType === 'UP') up += 1;
      if (voteType === 'DOWN') down += 1;
      newUserVote = voteType;
    }

    // Save individual user vote mapping
    if (userIdentifier) {
      setUserVoteInStorage(userIdentifier, id, newUserVote);
    }

    const targetIdx = proposalsMemory.findIndex((p) => p.id === id);
    const updated: CommunityProposal = {
      ...proposalsMemory[targetIdx],
      upvotes: up,
      downvotes: down,
      userVoted: newUserVote,
    };

    if (targetIdx !== -1) {
      proposalsMemory[targetIdx] = updated;
    }
    saveProposalsToStorage(proposalsMemory);

    return updated;
  },

  addComment: async (
    proposalId: string,
    payload: { content: string; authorName: string; authorRole?: string },
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    const authorRole = payload.authorRole || 'CITIZEN';
    try {
      const res = await api.post(`/proposals/${proposalId}/comment`, {
        content: payload.content,
        authorName: payload.authorName,
        authorRole,
      });
      if (res.data) {
        // Update local state as well
        const idx = proposalsMemory.findIndex((p) => p.id === proposalId);
        if (idx !== -1) {
          proposalsMemory[idx] = res.data;
        } else {
          proposalsMemory.push(res.data);
        }
        saveProposalsToStorage(proposalsMemory);
        return {
          ...res.data,
          userVoted: getUserVoteForProposal(userIdentifier, proposalId),
        };
      }
    } catch (err) {
      // Fallback
    }

    const index = proposalsMemory.findIndex((p) => p.id === proposalId);
    if (index === -1) throw new Error('Proposal not found');

    const newComment: ProposalComment = {
      id: `cmt_${Date.now()}`,
      authorName: payload.authorName,
      authorRole: authorRole as any,
      content: payload.content,
      createdAt: new Date().toISOString(),
    };

    const existingComments = proposalsMemory[index].comments || [];
    const updated = {
      ...proposalsMemory[index],
      comments: [...existingComments, newComment],
      userVoted: getUserVoteForProposal(userIdentifier, proposalId),
    };
    proposalsMemory[index] = updated;
    saveProposalsToStorage(proposalsMemory);
    return updated;
  },

  createProposal: async (
    payload: {
      title: string;
      category: string;
      description: string;
      ward: string;
      authorName: string;
      authorRole?: string;
    },
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    let created: CommunityProposal;

    try {
      const res = await api.post('/proposals', payload);
      if (res.data) {
        created = res.data;
        proposalsMemory = [created, ...proposalsMemory];
        saveProposalsToStorage(proposalsMemory);
        return {
          ...created,
          userVoted: getUserVoteForProposal(userIdentifier, created.id),
        };
      }
    } catch (err) {
      // Fallback
    }

    created = {
      id: `prp_${Date.now()}`,
      title: payload.title,
      category: payload.category,
      description: payload.description,
      ward: payload.ward,
      authorName: payload.authorName,
      authorRole: (payload.authorRole as any) || 'CITIZEN',
      upvotes: 0,
      downvotes: 0,
      userVoted: undefined,
      status: 'ACTIVE',
      comments: [],
      createdAt: new Date().toISOString(),
    };

    proposalsMemory = [created, ...proposalsMemory];
    saveProposalsToStorage(proposalsMemory);
    return created;
  },

  updateProposalStatus: async (
    id: string,
    status: ProposalStatus,
    councillorNotes?: string,
    userIdentifier?: string
  ): Promise<CommunityProposal> => {
    try {
      const res = await api.patch(`/proposals/${id}/status`, { status, councillorNotes });
      if (res.data) {
        const idx = proposalsMemory.findIndex((p) => p.id === id);
        if (idx !== -1) {
          proposalsMemory[idx] = res.data;
        }
        saveProposalsToStorage(proposalsMemory);
        return {
          ...res.data,
          userVoted: getUserVoteForProposal(userIdentifier, id),
        };
      }
    } catch (err) {
      // Fallback
    }

    const index = proposalsMemory.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Proposal not found');

    const updated = {
      ...proposalsMemory[index],
      status,
      councillorNotes: councillorNotes || proposalsMemory[index].councillorNotes,
      userVoted: getUserVoteForProposal(userIdentifier, id),
    };

    proposalsMemory[index] = updated;
    saveProposalsToStorage(proposalsMemory);
    return updated;
  },
};
