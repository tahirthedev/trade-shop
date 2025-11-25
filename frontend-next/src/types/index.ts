// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'client' | 'tradesperson';
  location?: {
    city: string;
    state: string;
    zipCode?: string;
  };
  avatar?: string;
  phone?: string;
  verified?: boolean;
  professionalId?: string; // Professional document ID for tradesperson users
  createdAt: string;
}

export interface Certification {
  name: string;
  issuer: string;
  dateObtained: string;
}

export interface PortfolioItem {
  title: string;
  description: string;
  images: string[];
  imageUrl?: string;
  completedDate: string;
  clientName?: string;
  budget?: number;
}

export interface WorkExperience {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description: string;
}

// Professional Types
export interface Professional {
  _id: string;
  user: User | string;
  trade: string;
  specialties: string[];
  yearsExperience: number;
  hourlyRate?: {
    min: number;
    max: number;
  };
  availability: 'Available' | 'Busy' | 'Unavailable';
  verified: boolean;
  topRated: boolean;
  aiScore: {
    skillVerification: number;
    reliability: number;
    quality: number;
    safety: number;
    total: number;
  };
  stats: {
    projectsCompleted: number;
    averageResponseTime: number;
    rating: number;
    reviewCount: number;
  };
  certifications: Certification[];
  portfolio?: PortfolioItem[];
  contactPreferences?: {
    phoneVisible: boolean;
  };
  bio?: string;
  languages?: string[];
  website?: string;
  linkedin?: string;
  twitter?: string;
  insurance?: {
    provider?: string;
    policyNumber?: string;
    coverage?: number;
    expiryDate?: string;
    verified?: boolean;
  };
  workExperience?: WorkExperience[];
  serviceArea?: {
    radius?: number;
    cities?: string[];
  };
}

// Project Types
export interface Project {
  _id: string;
  title: string;
  description: string;
  client: User | string;
  professional?: Professional | string;
  location: {
    address?: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  budget: {
    min: number;
    max: number;
  };
  tradeTypes: string[];
  timeline?: {
    startDate?: string;
    deadline?: string;
  };
  status: 'new' | 'active' | 'completed' | 'cancelled';
  progress?: number;
  proposalCount?: number;
  aiAnalysis?: {
    complexityScore?: number;
    urgencyLevel?: string;
    estimatedDuration?: string;
    suggestedTrades?: string[];
    keyRequirements?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  project: string | Project;
  professional: string | Professional;
  client: string | User;
  rating: number;
  detailedRatings?: {
    quality?: number;
    communication?: number;
    timeliness?: number;
    professionalism?: number;
  };
  title?: string;
  comment: string;
  images?: Array<{
    url: string;
    description?: string;
  }>;
  wouldRecommend: boolean;
  response?: {
    text: string;
    respondedAt: string;
  };
  verified: boolean;
  helpful: number;
  createdAt: string;
}

// Proposal Types
export interface Proposal {
  _id: string;
  project: string | Project;
  professional: string | Professional;
  client: string | User;
  budget: number;
  timeline?: {
    startDate?: string;
    estimatedDuration?: {
      value: number;
      unit: 'days' | 'weeks' | 'months';
    };
    completionDate?: string;
  };
  coverLetter: string;
  scope?: string;
  milestones?: Array<{
    title: string;
    description: string;
    amount: number;
    dueDate?: string;
  }>;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  respondedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Message & Conversation Types
export interface Message {
  _id: string;
  conversation: string;
  sender: string | User;
  recipient: string | User;
  content: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
  read: boolean;
  readAt?: string;
  deleted: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  project?: string | Project;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ProfessionalsResponse {
  success: boolean;
  professionals: Professional[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface ProjectsResponse {
  success: boolean;
  projects: Project[];
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  userType: 'client' | 'tradesperson';
  phone?: string;
  trade?: string;
  yearsExperience?: number;
  hourlyRate?: {
    min: number;
    max: number;
  };
}

// Subscription Types
export type SubscriptionTier = 'Apprentice' | 'Journeyman' | 'Master';

export interface SubscriptionPlan {
  name: SubscriptionTier;
  price: number;
  interval: 'month';
  features: string[];
  projectLimit?: number;
  popular?: boolean;
}
