export interface Alumni {
  id: string;
  name: string;
  department: string;
  admissionYear: number;
  graduationYear: number;
  company?: string;
  jobTitle?: string;
  region?: string;
  phone?: string;
  email?: string;
  bio?: string;
  photoUrl?: string;
  authStatus: 'unverified' | 'active' | 'locked';
  createdAt: string;
  updatedAt: string;
}

export interface AlumniListItem {
  id: string;
  name: string;
  department: string;
  graduationYear: number;
  company?: string;
  region?: string;
  photoUrl?: string;
}

export interface AlumniDetail extends AlumniListItem {
  jobTitle?: string;
  phone?: string;       // masked
  email?: string;       // masked
  bio?: string;
  admissionYear?: number;
}

export interface SearchFilters {
  query: string;
  department: string;
  graduationYear: string;
  company: string;
  region: string;
}

export interface VerifyPayload {
  name: string;
  phone: string;
  email: string;
  admissionYear: string;
  department: string;
}

export interface ProfileEditPayload {
  company?: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  bio?: string;
  region?: string;
}

export interface ChangeRequest {
  id: string;
  alumniId: string;
  alumniName: string;
  field: string;
  oldValue: string;
  newValue: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}
