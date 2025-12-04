export interface Student {
  id: string;
  name: string;
  grade: string;
  photos: string[]; // Array of Base64 strings (Reference images)
  parentEmail?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
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

export type ViewState = 'dashboard' | 'scan' | 'register' | 'reports';