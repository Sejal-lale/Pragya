export type Language = 'en' | 'hi' | 'mr';

export type Role = 'citizen' | 'employee' | 'supervisor';

export type ComplaintCategory = 'roads' | 'sanitation' | 'water' | 'lighting' | 'infrastructure';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'submitted'
  | 'classified'
  | 'dept_assigned'
  | 'employee_assigned'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'verified'
  | 'resolved'
  | 'reopened';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  ward: string;
  landmark?: string;
}

export interface EvidenceItem {
  id: string;
  imageUrl: string;
  timestamp: string;
  uploadedBy: string;
  role: 'citizen' | 'employee' | 'supervisor';
  note?: string;
}

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  changedBy: string;
  timestamp: string;
  comment?: string;
}

export interface CitizenFeedback {
  satisfied: boolean;
  comment?: string;
  timestamp: string;
}

export interface CitizenProfile {
  name: string;
  photoUrl: string;
  registrationAddress: string;
  registrationGeo: { lat: number; lng: number };
  registeredAt: string;
  isVerified: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  originalLanguage: Language;
  originalTranscript?: string;
  translatedDescription: string;
  category: ComplaintCategory;
  subCategory: string;
  departmentId: string;
  departmentName: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  deadline: string;
  slaHours: number;
  resolvedAt?: string;
  location: LocationData;
  citizenEvidence: EvidenceItem[];
  resolutionEvidence?: EvidenceItem[];
  history: StatusHistoryEntry[];
  citizenFeedback?: CitizenFeedback;
  citizenProfile?: CitizenProfile;
  duplicateCount?: number;
  linkedComplaintIds?: string[];
}

export interface EmployeeProfile {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  ward: string;
  activeTasks: number;
  avatar: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  icon: string;
  headName: string;
  slaHoursDefault: number;
}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  departmentId?: string;
  departmentName?: string;
  ward?: string;
  avatar?: string;
  phone?: string;
}

export const demoAccounts: AuthUser[] = [
  {
    id: 'CIT-01',
    name: 'Pooja Rao',
    role: 'citizen',
    phone: '+91 98230 14829',
    ward: 'Ward 12, Dharampeth',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    id: 'EMP-R042',
    name: 'Rahul Sharma',
    role: 'employee',
    departmentId: 'roads',
    departmentName: 'Roads & Infrastructure',
    ward: 'Ward 12, Nagpur',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    id: 'EMP-S018',
    name: 'Priya Patel',
    role: 'employee',
    departmentId: 'sanitation',
    departmentName: 'Municipal Sanitation',
    ward: 'Ward 8, Nagpur',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    id: 'SUP-NMC-01',
    name: 'Er. Rajesh Kulkarni',
    role: 'supervisor',
    departmentName: 'Nagpur Municipal Control Center (NMC)',
    ward: 'All Wards (Central Operations)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
  },
];

