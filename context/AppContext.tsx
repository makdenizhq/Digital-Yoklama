
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, AttendanceRecord, SchoolSettings, User, AuditLog, UserRole, UserPermission } from '../types';

interface AppContextType {
  // Auth & Users
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: User) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void; // Archive
  restoreUser: (id: string) => void; 
  deleteUserPermanently: (id: string) => void; 
  
  // Data
  students: Student[];
  attendance: AttendanceRecord[];
  settings: SchoolSettings;
  logs: AuditLog[];
  
  // Actions
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  restoreStudent: (id: string) => void;
  deleteStudentPermanently: (id: string) => void;
  
  markAttendance: (studentId: string, method: 'face_match' | 'manual_override', confidence?: number, liveImage?: string) => void;
  getStudent: (id: string) => Student | undefined;
  updateSettings: (settings: SchoolSettings) => void;
  updateRolePermissions: (role: UserRole, permissions: UserPermission[]) => void;
  addRole: (roleName: string) => void; // New
  deleteRole: (roleName: string) => void; // New
  generateStudentId: (gradeLevel?: string, section?: string) => string;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Updated Default Permissions Map
const DEFAULT_PERMISSIONS: Record<string, UserPermission[]> = {
    admin: ['dashboard', 'scan', 'register', 'students', 'reports', 'settings'],
    director: ['dashboard', 'students', 'reports', 'register', 'settings'],
    manager: ['dashboard', 'students', 'reports', 'register'],
    deputy_manager: ['dashboard', 'students', 'reports', 'scan'],
    staff: ['dashboard', 'scan', 'students'] // Replaces teacher
};

const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'Future Tech High School',
  schoolAddress: '123 Innovation Blvd',
  contactPhone: '+1 (555) 0123-4567',
  language: 'en',
  idFormat: 'school_prefix',
  schoolPrefix: 'FTH',
  idSequences: {
      '9': 1,
      '10': 1,
      '11': 1,
      '12': 1
  },
  roles: ['admin', 'director', 'manager', 'deputy_manager', 'staff'], // Default Role List
  rolePermissions: DEFAULT_PERMISSIONS
};

const DEFAULT_ADMIN: User = {
  id: '1',
  username: 'makdenizhq@gmail.com',
  password: '123456',
  fullName: 'Mustafa Akdeniz',
  email: 'makdenizhq@gmail.com',
  title: 'IT Director',
  role: 'admin',
  photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  permissions: DEFAULT_PERMISSIONS.admin
};

const SIMPLE_ADMIN: User = {
  id: '999',
  username: 'a',
  password: 'a',
  fullName: 'Test Admin',
  email: 'a@test.com',
  title: 'System Admin',
  role: 'admin',
  photoUrl: 'https://ui-avatars.com/api/?name=Test+Admin&background=0D8ABC&color=fff',
  permissions: DEFAULT_PERMISSIONS.admin
};

const DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    // Menu & General
    dashboard: "Dashboard",
    scan: "Scan",
    register: "Register",
    students: "Students",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    archive: "Archive",
    restore: "Restore",
    remove: "Remove",
    update: "Update",
    add: "Add",
    active: "Active",
    archived: "Archived",
    actions: "Actions",
    search: "Search...",
    back: "Back",
    
    // Auth
    login: "Login",
    logout: "Logout",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    invalidCredentials: "Invalid username or password",
    
    // Dashboard Stats
    totalStudents: "Total Students",
    presentToday: "Present Today",
    absent: "Absent",
    attendanceRate: "Attendance Rate",
    recentActivity: "Recent Activity",
    
    // Forms & Fields
    firstName: "First Name",
    lastName: "Last Name",
    fullName: "Full Name",
    studentId: "Student ID",
    grade: "Grade",
    section: "Section",
    teacher: "Class Teacher",
    gender: "Gender",
    dob: "Date of Birth",
    address: "Address",
    phone: "Phone",
    email: "Email",
    jobTitle: "Job Title",
    role: "Role",
    permissions: "Permissions",
    
    // Student & Guardian
    personalInfo: "Personal Info",
    academicInfo: "Academic Info",
    guardianInfo: "Guardian Info",
    parentName: "Guardian Name",
    relation: "Relation",
    
    // Settings / Roles
    general: "General",
    users: "Users",
    roles: "Roles",
    logs: "Logs",
    schoolInfo: "School Info",
    idGeneration: "ID Generation",
    schoolName: "School Name",
    schoolAddress: "School Address",
    schoolLogo: "School Logo",
    language: "Language",
    english: "English",
    turkish: "Turkish",
    addUser: "Add User",
    editUser: "Edit User",
    assignUser: "Assign User",
    effectivePermissions: "Effective Permissions",
    savePermissions: "Save Permissions",
    editPermissions: "Edit Permissions",
    
    // Action Buttons
    fillTestData: "Fill Test Data",
    startCapture: "Start Photo Capture",
    capturePhotos: "Capture Photos",
    printId: "Print ID Card",
    newStudent: "New Student",
    registrationComplete: "Registration Complete!",
    tryAgain: "Try Again",
    backToScanning: "Back to Scanning",
    
    // Scanner
    qrReady: "Ready to Scan",
    qrScanning: "Scanning QR...",
    verifying: "Verifying Face...",
    verified: "Verified Successfully",
    failed: "Verification Failed",
    lookAtCamera: "Look at Camera",
    scanQr: "Scan QR",
    accessDenied: "Access Denied",
    noMatch: "No Match Found",
    contactAdmin: "Please Contact Administration",
    
    // Lists
    activeList: "Active List",
    archiveList: "Archive List",
    noRecords: "No records found.",
  },
  tr: {
    // Menu & General
    dashboard: "Panel",
    scan: "Tarama",
    register: "Kayıt",
    students: "Öğrenciler",
    reports: "Raporlar",
    settings: "Ayarlar",
    profile: "Profil",
    save: "Kaydet",
    cancel: "İptal",
    edit: "Düzenle",
    delete: "Sil",
    archive: "Arşivle",
    restore: "Geri Yükle",
    remove: "Kaldır",
    update: "Güncelle",
    add: "Ekle",
    active: "Aktif",
    archived: "Arşiv",
    actions: "İşlemler",
    search: "Ara...",
    back: "Geri",
    
    // Auth
    login: "Giriş",
    logout: "Çıkış",
    username: "Kullanıcı Adı",
    password: "Şifre",
    signIn: "Giriş Yap",
    invalidCredentials: "Kullanıcı adı veya şifre hatalı",
    
    // Dashboard Stats
    totalStudents: "Toplam Öğrenci",
    presentToday: "Bugün Gelen",
    absent: "Gelmeyen",
    attendanceRate: "Katılım Oranı",
    recentActivity: "Son Hareketler",
    
    // Forms & Fields
    firstName: "Ad",
    lastName: "Soyad",
    fullName: "Ad Soyad",
    studentId: "Öğrenci No",
    grade: "Sınıf",
    section: "Şube",
    teacher: "Sınıf Öğretmeni",
    gender: "Cinsiyet",
    dob: "Doğum Tarihi",
    address: "Adres",
    phone: "Telefon",
    email: "E-posta",
    jobTitle: "Unvan",
    role: "Rol",
    permissions: "Yetkiler",
    
    // Student & Guardian
    personalInfo: "Kişisel Bilgiler",
    academicInfo: "Akademik Bilgiler",
    guardianInfo: "Veli Bilgileri",
    parentName: "Veli Adı",
    relation: "Yakınlık",
    
    // Settings / Roles
    general: "Genel",
    users: "Kullanıcılar",
    roles: "Roller",
    logs: "Kayıtlar",
    schoolInfo: "Okul Bilgileri",
    idGeneration: "Numara Üretimi",
    schoolName: "Okul Adı",
    schoolAddress: "Okul Adresi",
    schoolLogo: "Okul Logosu",
    language: "Uygulama Dili",
    english: "İngilizce",
    turkish: "Türkçe",
    addUser: "Kullanıcı Ekle",
    editUser: "Kullanıcı Düzenle",
    assignUser: "Kullanıcı Ata",
    effectivePermissions: "Geçerli Yetkiler",
    savePermissions: "Yetkileri Kaydet",
    editPermissions: "Yetkileri Düzenle",
    
    // Action Buttons
    fillTestData: "Test Verisi Doldur",
    startCapture: "Fotoğraf Çekimi Başlat",
    capturePhotos: "Fotoğraf Çek",
    printId: "Kimlik Kartı Yazdır",
    newStudent: "Yeni Öğrenci",
    registrationComplete: "Kayıt Tamamlandı!",
    tryAgain: "Tekrar Dene",
    backToScanning: "Taramaya Dön",
    
    // Scanner
    qrReady: "Taramaya Hazır",
    qrScanning: "QR Okunuyor...",
    verifying: "Yüz Doğrulanıyor...",
    verified: "Doğrulama Başarılı",
    failed: "Doğrulama Başarısız",
    lookAtCamera: "Kameraya Bakın",
    scanQr: "QR Okut",
    accessDenied: "Erişim Reddedildi",
    noMatch: "Eşleşme Bulunamadı",
    contactAdmin: "Lütfen İdare ile Görüşün",
    
    // Lists
    activeList: "Aktif Liste",
    archiveList: "Arşiv Listesi",
    noRecords: "Kayıt bulunamadı.",
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('attendai_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('attendai_settings');
    const parsed = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    return { 
        ...INITIAL_SETTINGS, 
        ...parsed,
        roles: parsed.roles || INITIAL_SETTINGS.roles, // Ensure roles exist
        idSequences: parsed.idSequences || INITIAL_SETTINGS.idSequences,
        rolePermissions: parsed.rolePermissions || DEFAULT_PERMISSIONS
    };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('attendai_users');
    let parsed = saved ? JSON.parse(saved) : [];
    
    // Ensure Defaults
    const defaults = [DEFAULT_ADMIN, SIMPLE_ADMIN];
    defaults.forEach(d => {
        if (!parsed.find((u: User) => u.username === d.username)) {
            parsed.push(d);
        }
    });

    // Migrate existing users: 'teacher' -> 'staff' & ensure permissions
    parsed = parsed.map((u: User) => {
        let currentRole = u.role;
        // Migration logic: Map old 'teacher' role to 'staff'
        if (currentRole === 'teacher') {
            currentRole = 'staff';
        }

        return {
            ...u,
            role: currentRole,
            isArchived: u.isArchived || false,
            // If user permissions are empty, rely on role settings
            permissions: u.permissions || settings.rolePermissions?.[currentRole] || DEFAULT_PERMISSIONS[currentRole]
        };
    });

    return parsed;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('attendai_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('attendai_students');
    let parsed = saved ? JSON.parse(saved) : [];
    
    // --- TEMP DATA INJECTION ---
    const testId = 'FTH253983';
    if (!parsed.find((s: Student) => s.id === testId)) {
        const testStudent: Student = {
            id: testId,
            firstName: 'Alex',
            lastName: 'Testuser',
            gradeLevel: '10',
            section: 'A',
            classTeacher: 'Mr. Anderson',
            guardian: {
                name: 'Parent Testuser',
                relation: 'Father',
                phone: '+1 555 0199',
                email: 'parent@test.com'
            },
            photos: [
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
            ],
            dob: '2008-05-15',
            address: '123 Test Lane',
            gender: 'Male',
            isArchived: false
        };
        parsed = [...parsed, testStudent];
    }
    // ---------------------------

    return parsed.map((s: any) => ({
      ...s,
      firstName: s.firstName || s.name?.split(' ')[0] || '',
      lastName: s.lastName || s.name?.split(' ').slice(1).join(' ') || '',
      gradeLevel: s.gradeLevel || s.grade || '',
      section: s.section || 'A',
      photos: s.photos || (s.photoUrl ? [s.photoUrl] : []),
      guardian: s.guardian || { name: '', relation: '', phone: '' },
      gender: s.gender || 'Male',
      isArchived: !!s.isArchived
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
        if (user.isArchived) {
            alert("This account has been deactivated.");
            return false;
        }
        
        // Load dynamic permissions from Settings if user has role-based default
        const effectivePermissions = settings.rolePermissions?.[user.role] || DEFAULT_PERMISSIONS['staff'];
        
        const userWithPermissions = {
            ...user,
            permissions: user.permissions && user.permissions.length > 0 
                ? user.permissions // User specific override 
                : effectivePermissions // Role default
        };
        
        setCurrentUser(userWithPermissions);
        logAction("LOGIN", `User logged in: ${user.username}`);
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
    logAction("UPDATE_USER", `Updated user: ${updatedUser.username}`);
  };

  const addUser = (user: User) => {
      // Set default permissions if not provided based on role settings
      const effectivePermissions = settings.rolePermissions?.[user.role] || DEFAULT_PERMISSIONS['staff'];
      const newUser = {
          ...user,
          permissions: user.permissions || effectivePermissions
      };
      setUsers(prev => [...prev, newUser]);
      logAction("ADD_USER", `Created new user: ${user.username}`);
  }

  // Soft Delete
  const deleteUser = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isArchived: true } : u));
      logAction("ARCHIVE_USER", `Archived user ID: ${id}`);
  }

  const restoreUser = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isArchived: false } : u));
      logAction("RESTORE_USER", `Restored user ID: ${id}`);
  }

  const deleteUserPermanently = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
      logAction("DELETE_USER_PERMANENT", `Permanently deleted user ID: ${id}`);
  }

  // --- STUDENT ACTIONS ---
  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
    if (student.gradeLevel && settings.idSequences) {
        setSettings(prev => ({
            ...prev,
            idSequences: {
                ...prev.idSequences,
                [student.gradeLevel]: (prev.idSequences?.[student.gradeLevel] || 0) + 1
            }
        }));
    }
    logAction("REGISTER_STUDENT", `Registered student: ${student.firstName} ${student.lastName}`);
  };

  const updateStudent = (updatedStudent: Student) => {
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      logAction("UPDATE_STUDENT", `Updated student: ${updatedStudent.firstName} ${updatedStudent.lastName}`);
  };

  const deleteStudent = (id: string) => {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, isArchived: true } : s));
      logAction("ARCHIVE_STUDENT", `Archived student ID: ${id}`);
  };

  const restoreStudent = (id: string) => {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, isArchived: false } : s));
      logAction("RESTORE_STUDENT", `Restored student ID: ${id}`);
  };

  const deleteStudentPermanently = (id: string) => {
      setStudents(prev => prev.filter(s => s.id !== id));
      logAction("DELETE_STUDENT_PERMANENT", `Permanently deleted student ID: ${id}`);
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

  const updateRolePermissions = (role: UserRole, permissions: UserPermission[]) => {
      setSettings(prev => ({
          ...prev,
          rolePermissions: {
              ...prev.rolePermissions,
              [role]: permissions
          }
      }));
      logAction("UPDATE_PERMISSIONS", `Updated permissions for role: ${role}`);
  };

  const addRole = (roleName: string) => {
      const slug = roleName.toLowerCase().replace(/\s+/g, '_');
      if (settings.roles.includes(slug)) return;

      setSettings(prev => ({
          ...prev,
          roles: [...prev.roles, slug],
          rolePermissions: {
              ...prev.rolePermissions,
              [slug]: DEFAULT_PERMISSIONS['staff'] // Default to basic permissions
          }
      }));
      logAction("ADD_ROLE", `Created new role: ${roleName}`);
  };

  const deleteRole = (roleName: string) => {
      if(roleName === 'admin') return; // Cannot delete admin
      setSettings(prev => ({
          ...prev,
          roles: prev.roles.filter(r => r !== roleName)
      }));
      // Reassign users of this role to 'staff'
      setUsers(prev => prev.map(u => u.role === roleName ? {...u, role: 'staff'} : u));
      logAction("DELETE_ROLE", `Deleted role: ${roleName}`);
  };

  const generateStudentId = (gradeLevel: string = '9', section: string = 'A') => {
      const year = new Date().getFullYear().toString().slice(-2);
      const sequence = settings.idSequences?.[gradeLevel] || 1;
      const sequenceStr = sequence.toString().padStart(3, '0');

      switch (settings.idFormat) {
          case 'school_prefix':
             return `${settings.schoolPrefix || 'SCH'}${year}${sequenceStr}`;
          case 'grade_prefix':
             return `${gradeLevel}${section}${sequenceStr}`;
          case 'standard':
          default:
             return `${year}${gradeLevel}${sequenceStr}`;
      }
  };

  const t = (key: string) => {
    const lang = settings.language;
    return DICTIONARY[lang]?.[key] || key;
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, login, logout, updateUser, addUser, deleteUser, restoreUser, deleteUserPermanently, logs,
      students, attendance, settings, 
      addStudent, updateStudent, deleteStudent, restoreStudent, deleteStudentPermanently,
      markAttendance, getStudent, updateSettings, updateRolePermissions, addRole, deleteRole, generateStudentId, t 
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
