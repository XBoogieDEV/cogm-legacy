// Shared types for the application

export interface DeceasedMemberSubmission {
  id: string;
  // Deceased Member Information
  fullName: string;
  passingDate: string;
  title: string;
  jurisdiction: string;
  yearsOfService: string;
  // Optional Information
  causeOfDeath?: string;
  obituaryLink?: string;
  memorialServiceDate?: string;
  memorialServiceLocation?: string;
  memorialServiceNotes?: string;
  familyContactName?: string;
  familyContactEmail?: string;
  familyContactPhone?: string;
  // File uploads (store names for demo)
  obituaryFiles: string[];
  programFiles: string[];
  // Submitter Information
  submitterName?: string;
  submitterEmail?: string;
  // Metadata
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'published';
}

export interface DashboardStats {
  totalSubmissions: number;
  pendingReview: number;
  publishedMemorials: number;
  thisMonth: number;
}
