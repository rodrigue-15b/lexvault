
export interface SavedBrief {
  id: string;
  brief: SmartBrief;
  savedAt: number;
  customTitle: string;
}

export interface Notification {
  id: string;
  type: 'security' | 'system';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface SupportMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Attorney' | 'Physician' | 'Engineer' | 'Financial Analyst' | 'Other';
  organization?: string;
  docsProcessed: number;
  createdAt: number;
  lastLogin: number;
  isEmailVerified: boolean;
  isAdmin?: boolean;
  isSuspended?: boolean;
  verificationCode?: string;
  failedLoginAttempts: number;
  lockoutUntil?: number;
  lexRoomPinHash?: string;
  lexRoomFailedAttempts: number;
  lexRoomLockedUntil?: number;
}

export interface DocumentData {
  name: string;
  size: number;
  type: string;
  content: string;
  pageCount: number;
  timestamp: number;
}

export interface ExtractionData {
  clauses: string[];
  rightsAndObligations: string[];
  commitments: string[];
  timelines: string[];
  ambiguities: string[];
}

export interface AdvisoryData {
  executiveSignals: string[];
  readersMiss: string[];
  scenarios: string[];
  risks: {
    level: string;
    details: string;
    flags: string[];
  };
  leverage: string[];
  signingReadiness: {
    status: 'Ready' | 'Caution' | 'Not Ready';
    justification: string;
  };
  professionalQuestions: string[];
}

export interface SmartBrief {
  title: string;
  documentType: string;
  extraction: ExtractionData;
  advisory?: AdvisoryData;
  isApproved: boolean;
  approvalTimestamp?: number;
  disclaimer: string;
  hasSubstantiveContent: boolean;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  systemNotice: string | null;
  featuresEnabled: {
    lexRoom: boolean;
    advisory: boolean;
    support: boolean;
  };
}

export interface VaultState {
  user: User | null;
  currentDocument: DocumentData | null;
  brief: SmartBrief | null;
  isProcessing: boolean;
  isAuthenticated: boolean;
  analysisInstructions: string | null;
  isLexRoomUnlocked: boolean;
  savedBriefs: SavedBrief[];
  notifications: Notification[];
  systemSettings: SystemSettings;
}
