export type JobStatus = 
  | 'Applied' 
  | 'Screening' 
  | '1st Interview' 
  | '2nd Interview' 
  | '3rd Interview' 
  | 'Final Interview' 
  | 'Offer' 
  | 'Rejected';

export type Channel = 'LinkedIn' | 'Company Website' | 'Indeed' | 'Recruiter';

export type Tag = string;

export interface Note {
  id: string;
  content: string;
  timestamp: string;
  type: 'call' | 'email' | 'manual';
}

export interface InterviewRound {
  id: string;
  roundNumber: number;
  name: string; // This should be the JobStatus (e.g., '1st Interview')
  date: string;
  time: string;
  result: 'Pass' | 'Fail' | 'Pending';
  quality: 'Good Fit' | 'Weak Match' | 'Unexpected' | '--';
  notes: string;
}

export interface JobDescription {
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  visaInfo: string;
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  industry: string;
  location: string;
  experienceLevel: string;
  fitScore: number;
  fitBreakdown: {
    skills: number;
    experience: number;
    industry: number;
    visa: number;
    gap: string;
  };
  status: JobStatus;
  selectedChannels: Channel[];
  referral: boolean;
  appliedTime: string;
  resumeUrl: string;
  coverLetterUrl: string;
  notes: Note[];
  tags: Tag[];
  jobDescription: JobDescription;
  interviewTimeline: InterviewRound[];
  rejectedReason?: string;
  rejectedNotes?: string;
  offerDetails?: {
    salary: string;
    pto?: string;
    bonus?: string;
    deadline: string;
    decision: 'Accept' | 'Decline' | 'Pending';
    notes?: string;
  };
  interviewProbability: number; // 0 to 1
  lastResponseDate?: string;
  attempts: number;
}

export interface FilterState {
  status: JobStatus[];
  channels: Channel[];
  tags: Tag[];
  fitScore: [number, number];
  location: string[];
  experience: string[];
  highProbability: boolean;
  lowROI: boolean;
  needsFollowUp: boolean;
}

export type SortDirection = 'asc' | 'desc';

export type ComparisonPeriod = 
  | 'Today vs Yesterday'
  | 'This Week vs Last Week'
  | 'This Month vs Last Month'
  | 'This Quarter vs Last Quarter'
  | 'This Year vs Last Year';

export interface SortConfig {
  field: 'status' | 'appliedTime';
  direction: SortDirection;
}
