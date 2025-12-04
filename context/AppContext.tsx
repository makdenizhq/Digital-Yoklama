import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, AttendanceRecord, SchoolSettings, User, AuditLog } from '../types';

interface AppContextType {
  // Auth & Users
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: User) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  
  // Data
  students: Student[];
  attendance: AttendanceRecord[];
  settings: SchoolSettings;
  logs: AuditLog[];
  
  // Actions
  addStudent: (student: Student) => void;
  markAttendance: (studentId: string, method: 'face_match' | 'manual_override', confidence?: number, liveImage?: string) => void;
  getStudent: (id: string) => Student | undefined;
  updateSettings: (settings: SchoolSettings) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'Future Tech High School',
  schoolAddress: '123 Innovation Blvd, Tech City',
  contactPhone: '+1 (555) 0123-4567',
  language: 'en'
};

const DEFAULT_ADMIN: User = {
  id: '1',
  username: 'makdenizhq@gmail.com',
  password: '123456',
  fullName: 'Mustafa Akdeniz',
  email: 'makdenizhq@gmail.com',
  title: 'IT Manager',
  role: 'admin',
  photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
};

const DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    scan: "Scan Attendance",
    register: "Register Student",
    reports: "Reports",
    settings: "Settings",
    profile: "My Profile",
    totalStudents: "Total Students",
    presentToday: "Present Today",
    absent: "Absent",
    attendanceRate: "Attendance Rate",
    recentActivity: "Recent Activity",
    online: "Online System",
    save: "Save Changes",
    schoolInfo: "School Information",
    personalInfo: "Personal Information",
    academicInfo: "Academic Information",
    guardianInfo: "Guardian Information",
    firstName: "First Name",
    lastName: "Last Name",
    studentId: "Student ID",
    grade: "Grade",
    section: "Section",
    teacher: "Class Teacher",
    parentName: "Parent Name",
    phone: "Phone",
    address: "Address",
    capturePhotos: "Capture Photos",
    printId: "Print ID Card",
    qrReady: "Ready to Scan",
    qrScanning: "Scanning QR...",
    verifying: "Verifying Face...",
    verified: "Verified",
    failed: "Failed",
    manualId: "Manual Entry"
  },
  tr: {
    dashboard: "Kontrol Paneli",
    scan: "Yoklama Al",
    register: "Öğrenci Kayıt",
    reports: "Raporlar",
    settings: "Ayarlar",
    profile: "Profilim",
    totalStudents: "Toplam Öğrenci",
    presentToday: "Bugün Gelenler",
    absent: "Gelmeyenler",
    attendanceRate: "Katılım Oranı",
    recentActivity: "Son Hareketler",
    online: "Sistem Çevrimiçi",
    save: "Değişiklikleri Kaydet",
    schoolInfo: "Okul Bilgileri",
    personalInfo: "Kişisel Bilgiler",
    academicInfo: "Akademik Bilgiler",
    guardianInfo: "Veli Bilgileri",
    firstName: "Ad",
    lastName: "Soyad",
    studentId: "Öğrenci No",
    grade: "Sınıf",
    section: "Şube",
    teacher: "Sınıf Öğretmeni",
    parentName: "Veli Adı",
    phone: "Telefon",
    address: "Adres",
    capturePhotos: "Fotoğraf Çek",
    printId: "Kimlik Kartı Yazdır",
    qrReady: "Taramaya Hazır",
    qrScanning: "QR Okunuyor...",
    verifying: "Yüz Doğrulanıyor...",
    verified: "Doğrulandı",
    failed: "Başarısız",
    manualId: "Manuel Giriş"
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('attendai_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('attendai_users');
    // Force default admin if empty, or ensures admin exists. 
    // In a real app, this logic would be server-side database seeding.
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) return [DEFAULT_ADMIN];
    // Check if our specific admin exists, if not, add/update him (for dev convenience)
    const adminExists = parsed.find((u: User) => u.username === DEFAULT_ADMIN.username);
    if (!adminExists) return [...parsed, DEFAULT_ADMIN];
    return parsed;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('attendai_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('attendai_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('attendai_students');
    const parsed = saved ? JSON.parse(saved) : [];
    // Migration logic
    return parsed.map((s: any) => ({
      ...s,
      firstName: s.firstName || s.name?.split(' ')[0] || '',
      lastName: s.lastName || s.name?.split(' ').slice(1).join(' ') || '',
      gradeLevel: s.gradeLevel || s.grade || '',
      section: s.section || 'A',
      photos: s.photos || (s.photoUrl ? [s.photoUrl] : []),
      guardian: s.guardian || { name: '', relation: '', phone: '' }
    }));
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendai_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  // --- PERSISTENCE ---
  useEffect(() => localStorage.setItem('attendai_user', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('attendai_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('attendai_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('attendai_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('attendai_students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('attendai_attendance', JSON.stringify(attendance)), [attendance]);

  // --- LOGGING ---
  const logAction = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.username,
      action,
      details,
      timestamp: Date.now()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- AUTH ACTIONS ---
  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      // Direct log push to avoid closure stale state issue if we used logAction immediately
      const loginLog: AuditLog = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.username,
          action: "LOGIN",
          details: "User logged in successfully",
          timestamp: Date.now()
      };
      setLogs(prev => [loginLog, ...prev]);
      return true;
    }
    return false;
  };

  const logout = () => {
    logAction("LOGOUT", "User logged out");
    setCurrentUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    logAction("UPDATE_PROFILE", `Updated profile for ${updatedUser.username}`);
  };

  const addUser = (user: User) => {
      setUsers(prev => [...prev, user]);
      logAction("ADD_USER", `Created new user: ${user.username}`);
  }

  const deleteUser = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
      logAction("DELETE_USER", `Deleted user ID: ${id}`);
  }

  // --- APP ACTIONS ---
  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
    logAction("REGISTER_STUDENT", `Registered student: ${student.firstName} ${student.lastName}`);
  };

  const markAttendance = (studentId: string, method: 'face_match' | 'manual_override', confidence?: number, liveImage?: string) => {
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return;
    const student = students[studentIndex];

    const today = new Date().toDateString();
    const alreadyMarked = attendance.some(a => 
      a.studentId === studentId && new Date(a.timestamp).toDateString() === today
    );

    if (alreadyMarked) return;

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      timestamp: Date.now(),
      status: 'present',
      verificationMethod: method,
      confidenceScore: confidence
    };
    setAttendance(prev => [newRecord, ...prev]);
    logAction("ATTENDANCE", `Marked present: ${student.firstName} ${student.lastName}`);

    if (method === 'face_match' && liveImage) {
        setStudents(prev => {
            const updated = [...prev];
            const currentStudent = { ...updated[studentIndex] };
            const newPhotos = [liveImage, ...currentStudent.photos];
            if (newPhotos.length > 15) newPhotos.length = 15;
            currentStudent.photos = newPhotos;
            updated[studentIndex] = currentStudent;
            return updated;
        });
    }
  };

  const getStudent = (id: string) => students.find(s => s.id === id);

  const updateSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    logAction("UPDATE_SETTINGS", "Updated system settings");
  };

  const t = (key: string) => {
    const lang = settings.language;
    return DICTIONARY[lang]?.[key] || key;
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, login, logout, updateUser, addUser, deleteUser, logs,
      students, attendance, settings, 
      addStudent, markAttendance, getStudent, updateSettings, t 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};