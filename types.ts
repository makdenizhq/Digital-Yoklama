
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

// --- ACADEMIC TYPES ---
export type ExamType = 'written' | 'oral' | 'project' | 'trial_exam';

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  type: ExamType;
  date: string;
  term: '1' | '2';
}

export interface ScheduleItem {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  period: number; // 1-8
  subject: string;
  teacher?: string;
  topic?: string; // New field for lesson topic
}

// --- FINANCE TYPES ---
export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  type: string; // Changed to string to support dynamic fee names
  status: 'paid' | 'pending' | 'overdue';
  description?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: 'salary' | 'maintenance' | 'supplies' | 'utilities' | 'other';
  description?: string;
}

export type FeeFrequency = 'one_time' | 'monthly' | 'yearly' | 'per_use';

export interface FeeType {
  id: string;
  name: string;
  amount: number;
  frequency: FeeFrequency;
}

// --- TASK TYPES ---
export type TaskPriority = 'high' | 'medium' | 'normal' | 'low';

export interface Task {
  id: string;
  title: string;
  type: 'todo' | 'task'; // Todo = Personal, Task = Assigned
  status: 'pending' | 'completed';
  dueDate: string; // ISO Date
  reminder: boolean; // Alarm Toggle
  reminderDate?: string; // ISO Date Time for specific alarm
  priority: TaskPriority; // New field
  assignedTo: string[]; // Array of User IDs or Student IDs
  createdBy: string;
  completedBy?: string; // Who finished it
}

export interface AppNotification {
    id: string;
    message: string;
    type: 'info' | 'alert' | 'success';
    read: boolean;
    timestamp: number;
}

export type IdGenerationFormat = 'standard' | 'school_prefix' | 'grade_prefix';
export type VerificationThreshold = 'strict' | 'medium' | 'lenient';

export interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  contactPhone: string;
  language: 'en' | 'tr';
  idFormat: IdGenerationFormat;
  schoolPrefix: string;
  schoolLogoUrl?: string;
  idSequences?: Record<string, number>; 
  roles: string[]; 
  rolePermissions?: Record<string, UserPermission[]>;
  isPaidSchool?: boolean;
  feeStructure: FeeType[]; 
  verificationThreshold: VerificationThreshold;
  lessons?: Record<string, string[]>; // Mapping: Grade Level -> Array of Subjects
}

export type UserRole = string; 
export type UserPermission = 'dashboard' | 'students' | 'attendance' | 'education' | 'calendar' | 'settings' | 'scan' | 'register' | 'reports' | 'finance';

export interface User {
  id: string;
  username: string;
  password?: string; 
  fullName: string;
  email?: string;
  title: string; 
  role: UserRole;
  photoUrl?: string;
  isArchived?: boolean;
  permissions?: UserPermission[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; 
  details: string;
  timestamp: number;
}

export type ViewState = 'dashboard' | 'students' | 'attendance' | 'education' | 'calendar' | 'settings' | 'profile' | 'finance';
