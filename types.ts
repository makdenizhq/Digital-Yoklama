
export interface Guardian {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface Student {
  id: string; // School Number / QR Data
  firstName: string;
  lastName: string;
  gradeLevel: string; // e.g., 10, 11, 12
  section: string; // e.g., A, B, C
  classTeacher: string;
  photos: string[]; // Array of Base64 strings
  guardian: Guardian;
  dob?: string;
  address?: string;
  gender?: 'Male' | 'Female';
  isArchived?: boolean; // Soft delete flag
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string; // Stored for historical integrity
  timestamp: number;
  status: 'present' | 'absent' | 'late';
  verificationMethod: 'face_match' | 'manual_override';
  confidenceScore?: number;
}

export interface VerificationResult {
  match: boolean;
  confidence: number;
  reason: string;
}

export type IdGenerationFormat = 'standard' | 'school_prefix' | 'grade_prefix';

export interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  contactPhone: string;
  language: 'en' | 'tr';
  idFormat: IdGenerationFormat;
  schoolPrefix: string; // e.g. "FTH" for Future Tech High
  schoolLogoUrl?: string;
  idSequences?: Record<string, number>; // Key: Grade (e.g. "9"), Value: Next Sequence (e.g. 101)
  roles: string[]; // List of available roles (Dynamic)
  rolePermissions?: Record<string, UserPermission[]>; // Custom role configuration
}

// UserRole is now string to support dynamic roles, but we maintain strong typing for defaults
export type UserRole = string; 
export type UserPermission = 'dashboard' | 'scan' | 'register' | 'students' | 'reports' | 'settings';

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, never store plain text
  fullName: string;
  email?: string;
  title: string; // e.g. "School Principal", "IT Manager", "Math Teacher", "Nurse"
  role: UserRole;
  photoUrl?: string;
  isArchived?: boolean;
  permissions?: UserPermission[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // e.g. "LOGIN", "UPDATE_SETTINGS"
  details: string;
  timestamp: number;
}

export type ViewState = 'dashboard' | 'scan' | 'register' | 'students' | 'reports' | 'settings' | 'profile';
