export type UserRole = 'CITIZEN' | 'COUNCILLOR' | 'WORKER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  ward?: string;
  status?: UserStatus;
  avatarUrl?: string;
  assignedTasks?: number;
  createdAt: string;
}

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type ComplaintCategory = 
  | 'Roads & Potholes'
  | 'Street Lighting'
  | 'Water Supply'
  | 'Waste Management'
  | 'Sewage & Drainage'
  | 'Parks & Recreation'
  | 'Public Safety'
  | 'Other';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  status?: ComplaintStatus;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  description: string;
  ward: string;
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  status: ComplaintStatus;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  images: string[];
  completionImage?: string;
  timeline: TimelineItem[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus = 'ACTIVE' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';

export interface CommunityProposal {
  id: string;
  title: string;
  category: string;
  description: string;
  ward: string;
  authorName: string;
  authorRole: UserRole;
  upvotes: number;
  downvotes: number;
  userVoted?: 'UP' | 'DOWN';
  status: ProposalStatus;
  councillorNotes?: string;
  createdAt: string;
}

export type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'EMERGENCY';

export interface WardNotice {
  id: string;
  title: string;
  content: string;
  ward: string;
  priority: NoticePriority;
  publishedBy: string;
  publishedByRole?: string;
  publishDate: string;
  expiryDate?: string;
  category: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'other';
}

export interface Ward {
  id: string;
  wardNumber: number;
  name: string;
  councillorName: string;
  councillorEmail: string;
  population: number;
  activeComplaints: number;
  resolvedComplaints: number;
}

export interface CivicAnalytics {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  totalProposals: number;
  activeNotices: number;
  categoryBreakdown: { category: string; count: number }[];
  monthlyTrends: { month: string; filed: number; resolved: number }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'COMPLAINT' | 'PROPOSAL' | 'NOTICE' | 'FEEDBACK' | 'SYSTEM';
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface SystemActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  module: 'COMPLAINT' | 'PROPOSAL' | 'NOTICE' | 'USER' | 'WARD' | 'SYSTEM';
  details: string;
}


