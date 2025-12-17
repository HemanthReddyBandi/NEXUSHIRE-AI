export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  HR = 'HR',
  ADMIN = 'ADMIN'
}

export enum HRStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Mock password
  
  // HR Specific fields
  companyName?: string;
  companyWebsite?: string;
  linkedInUrl?: string;
  designation?: string;
  hrStatus?: HRStatus;
  
  // Candidate Specific
  resumeUrl?: string;
  targetRole?: string;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  role: string;
  date: string;
  score?: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  report?: string;
  
  // Technical Assessment
  codingScore?: number;
  codingFeedback?: string;
  challengeDifficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface HRInvite {
  id: string;
  hrId: string;
  candidateEmail: string;
  status: 'SENT' | 'ACCEPTED';
  createdAt: string;
}

export interface AudioFrequencyData {
  values: Uint8Array;
}

export interface Challenge {
  id: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  description: string;
  starterCode: string;
}