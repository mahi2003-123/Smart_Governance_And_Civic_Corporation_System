import api from './api';
import { User, Ward, CivicAnalytics, Complaint, CommunityProposal, WardNotice, SystemActivityLog, NotificationItem } from '../types';

const LOCAL_USERS_KEY = 'sgcs_registered_users';

const MOCK_USERS: User[] = [
  { id: 'usr_1', fullName: 'Super Admin', email: 'admin@gmail.com', phone: '+91 98765 00001', role: 'ADMIN', ward: 'System Wide', status: 'ACTIVE', createdAt: '2026-01-10' },
  { id: 'usr_2', fullName: 'Rajesh Sharma', email: 'councillor1@sgcs.gov.in', phone: '+91 98765 11001', role: 'COUNCILLOR', ward: 'Ward 1 - Central Town', status: 'ACTIVE', createdAt: '2026-01-15' },
  { id: 'usr_3', fullName: 'Ananya Deshmukh', email: 'councillor2@sgcs.gov.in', phone: '+91 98765 11002', role: 'COUNCILLOR', ward: 'Ward 2 - North Harbor', status: 'ACTIVE', createdAt: '2026-01-18' },
  { id: 'usr_4', fullName: 'Vikram Mehta', email: 'councillor3@sgcs.gov.in', phone: '+91 98765 11003', role: 'COUNCILLOR', ward: 'Ward 3 - West Ridge', status: 'ACTIVE', createdAt: '2026-01-20' },
  { id: 'usr_5', fullName: 'Suresh Kumar', email: 'worker1@sgcs.gov.in', phone: '+91 98765 22001', role: 'WORKER', ward: 'Ward 1 - Central Town', status: 'ACTIVE', assignedTasks: 4, createdAt: '2026-02-01' },
  { id: 'usr_6', fullName: 'Ramesh Verma', email: 'worker2@sgcs.gov.in', phone: '+91 98765 22002', role: 'WORKER', ward: 'Ward 2 - North Harbor', status: 'ACTIVE', assignedTasks: 2, createdAt: '2026-02-05' },
  { id: 'usr_7', fullName: 'Priya Sundaram', email: 'priya.s@gmail.com', phone: '+91 98765 33001', role: 'CITIZEN', ward: 'Ward 1 - Central Town', status: 'ACTIVE', createdAt: '2026-03-12' },
  { id: 'usr_8', fullName: 'Amitabh Sen', email: 'amitabh.sen@yahoo.com', phone: '+91 98765 33002', role: 'CITIZEN', ward: 'Ward 2 - North Harbor', status: 'ACTIVE', createdAt: '2026-03-15' },
  { id: 'usr_9', fullName: 'Kavita Patel', email: 'kavita.p@gmail.com', phone: '+91 98765 33003', role: 'CITIZEN', ward: 'Ward 3 - West Ridge', status: 'INACTIVE', createdAt: '2026-04-01' },
];

const MOCK_WARDS: Ward[] = [
  { id: 'w_1', wardNumber: 1, name: 'Ward 1 - Central Town', councillorName: 'Rajesh Sharma', councillorEmail: 'councillor1@sgcs.gov.in', population: 45000, activeComplaints: 24, resolvedComplaints: 180 },
  { id: 'w_2', wardNumber: 2, name: 'Ward 2 - North Harbor', councillorName: 'Ananya Deshmukh', councillorEmail: 'councillor2@sgcs.gov.in', population: 38000, activeComplaints: 18, resolvedComplaints: 142 },
  { id: 'w_3', wardNumber: 3, name: 'Ward 3 - West Ridge', councillorName: 'Vikram Mehta', councillorEmail: 'councillor3@sgcs.gov.in', population: 52000, activeComplaints: 31, resolvedComplaints: 215 },
  { id: 'w_4', wardNumber: 4, name: 'Ward 4 - East Valley', councillorName: 'Sunita Rao', councillorEmail: 'councillor4@sgcs.gov.in', population: 41000, activeComplaints: 12, resolvedComplaints: 98 },
  { id: 'w_5', wardNumber: 5, name: 'Ward 5 - South Heights', councillorName: 'Manoj Joshi', councillorEmail: 'councillor5@sgcs.gov.in', population: 49000, activeComplaints: 19, resolvedComplaints: 164 },
];

const MOCK_ACTIVITY: SystemActivityLog[] = [
  { id: 'act_1', timestamp: '22 Aug 2026, 04:15 PM', user: 'Priya Sundaram', role: 'CITIZEN', action: 'Submitted New Complaint', module: 'COMPLAINT', details: 'Complaint #SGCS-1024 filed in Ward 1 - Central Town' },
  { id: 'act_2', timestamp: '22 Aug 2026, 03:40 PM', user: 'Super Admin', role: 'ADMIN', action: 'Created Ward Notice', module: 'NOTICE', details: 'Published city-wide notice regarding water supply pipeline' },
  { id: 'act_3', timestamp: '22 Aug 2026, 02:10 PM', user: 'Rajesh Sharma', role: 'COUNCILLOR', action: 'Assigned Field Worker', module: 'COMPLAINT', details: 'Assigned Suresh Kumar to Complaint #SGCS-1021' },
  { id: 'act_4', timestamp: '22 Aug 2026, 11:30 AM', user: 'Suresh Kumar', role: 'WORKER', action: 'Resolved Grievance Task', module: 'COMPLAINT', details: 'Completed repair work for Complaint #SGCS-1018' },
  { id: 'act_5', timestamp: '22 Aug 2026, 10:05 AM', user: 'Amitabh Sen', role: 'CITIZEN', action: 'Voted on Proposal', module: 'PROPOSAL', details: 'Upvoted Proposal #PROP-204 in Ward 2 - North Harbor' },
  { id: 'act_6', timestamp: '21 Aug 2026, 05:22 PM', user: 'Super Admin', role: 'ADMIN', action: 'Registered Councillor', module: 'USER', details: 'Created account for Ananya Deshmukh (Ward 2)' },
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'not_1', title: 'Critical Grievance Alert', message: 'Urgent water main break reported in Ward 3 require councillor review.', type: 'COMPLAINT', read: false, createdAt: '10 mins ago' },
  { id: 'not_2', title: 'New Staff Account', message: 'Field Worker Suresh Kumar has successfully logged in for shift.', type: 'SYSTEM', read: false, createdAt: '1 hour ago' },
  { id: 'not_3', title: 'Proposal Milestone Reached', message: 'Solar Lighting proposal in Ward 1 has reached 150 community upvotes.', type: 'PROPOSAL', read: true, createdAt: '3 hours ago' },
  { id: 'not_4', title: 'Monthly Audit Report Ready', message: 'August 2026 municipal civic performance summary generated.', type: 'SYSTEM', read: true, createdAt: '1 day ago' },
];

const getLocalUsers = (): User[] => {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const adminService = {
  getAnalytics: async (): Promise<CivicAnalytics> => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    return {
      totalComplaints: 104,
      pendingComplaints: 24,
      inProgressComplaints: 18,
      resolvedComplaints: 62,
      totalProposals: 14,
      activeNotices: 6,
      categoryBreakdown: [
        { category: 'Roads & Potholes', count: 38 },
        { category: 'Street Lighting', count: 24 },
        { category: 'Water Supply', count: 20 },
        { category: 'Waste Management', count: 14 },
        { category: 'Sewage & Drainage', count: 8 },
      ],
      monthlyTrends: [
        { month: 'Apr', filed: 45, resolved: 40 },
        { month: 'May', filed: 58, resolved: 52 },
        { month: 'Jun', filed: 62, resolved: 59 },
        { month: 'Jul', filed: 70, resolved: 65 },
        { month: 'Aug', filed: 84, resolved: 62 },
      ],
    };
  },

  getUsers: async (): Promise<User[]> => {
    let apiUsers: User[] = [];
    try {
      const res = await api.get('/admin/users');
      if (res.data && Array.isArray(res.data)) {
        apiUsers = res.data;
      }
    } catch (err) {
      // API offline
    }

    const localUsers = getLocalUsers();
    const combinedMap = new Map<string, User>();

    MOCK_USERS.forEach((u) => combinedMap.set(u.email.toLowerCase(), u));
    apiUsers.forEach((u) => combinedMap.set(u.email.toLowerCase(), { ...u, status: u.status || 'ACTIVE' }));
    localUsers.forEach((u) => combinedMap.set(u.email.toLowerCase(), { ...u, status: u.status || 'ACTIVE' }));

    return Array.from(combinedMap.values());
  },

  createUser: async (userData: {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    role: 'CITIZEN' | 'COUNCILLOR' | 'WORKER' | 'ADMIN';
    ward?: string;
  }): Promise<User> => {
    try {
      const res = await api.post('/admin/users', userData);
      if (res.data) return res.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone || '+91 98765 99999',
      role: userData.role,
      ward: userData.ward || 'Ward 1 - Central Town',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const existing = getLocalUsers();
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([newUser, ...existing]));
    return newUser;
  },

  updateUserStatus: async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE'): Promise<boolean> => {
    const users = getLocalUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].status = newStatus;
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
    return true;
  },

  getWards: async (): Promise<Ward[]> => {
    try {
      const res = await api.get('/admin/wards');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch (err) {
      // Fallback
    }
    return MOCK_WARDS;
  },

  createWard: async (wardData: Omit<Ward, 'id' | 'activeComplaints' | 'resolvedComplaints'>): Promise<Ward> => {
    try {
      const res = await api.post('/admin/wards', wardData);
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    return {
      ...wardData,
      id: `w_${Date.now()}`,
      activeComplaints: 0,
      resolvedComplaints: 0,
    };
  },

  getActivityLogs: async (): Promise<SystemActivityLog[]> => {
    return MOCK_ACTIVITY;
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    return MOCK_NOTIFICATIONS;
  },
};

export default adminService;
