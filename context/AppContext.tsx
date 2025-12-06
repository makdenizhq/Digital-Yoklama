
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, AttendanceRecord, SchoolSettings, User, AuditLog, UserRole, UserPermission, Grade, Payment, Task, Expense } from '../types';

interface AppContextType {
  // Auth & Users
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: User) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void; 
  restoreUser: (id: string) => void; 
  deleteUserPermanently: (id: string) => void; 
  
  // Data
  students: Student[];
  attendance: AttendanceRecord[];
  grades: Grade[];
  payments: Payment[];
  expenses: Expense[]; // New
  tasks: Task[]; // New
  settings: SchoolSettings;
  logs: AuditLog[];
  
  // Actions
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  restoreStudent: (id: string) => void;
  deleteStudentPermanently: (id: string) => void;
  
  markAttendance: (studentId: string, method: 'face_match' | 'manual_override', confidence?: number, liveImage?: string) => void;
  addPayment: (payment: Payment) => void;
  addExpense: (expense: Expense) => void; // New
  deleteExpense: (id: string) => void; // New
  addGrade: (grade: Grade) => void;
  
  addTask: (task: Task) => void; // New
  updateTask: (task: Task) => void; // New
  deleteTask: (id: string) => void; // New

  getStudent: (id: string) => Student | undefined;
  updateSettings: (settings: SchoolSettings) => void;
  updateRolePermissions: (role: UserRole, permissions: UserPermission[]) => void;
  addRole: (roleName: string) => void; 
  deleteRole: (roleName: string) => void; 
  generateStudentId: (gradeLevel?: string, section?: string) => string;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: Record<string, UserPermission[]> = {
    admin: ['dashboard', 'students', 'attendance', 'education', 'calendar', 'settings', 'scan', 'register', 'reports', 'finance'],
    director: ['dashboard', 'students', 'attendance', 'education', 'calendar', 'settings', 'reports', 'finance'],
    manager: ['dashboard', 'students', 'attendance', 'education', 'reports', 'register', 'finance'],
    deputy_manager: ['dashboard', 'students', 'attendance', 'reports', 'scan'],
    staff: ['dashboard', 'attendance', 'students', 'education', 'scan'] 
};

const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'Future Tech High School',
  schoolAddress: '123 Innovation Blvd',
  contactPhone: '+1 (555) 0123-4567',
  language: 'en',
  idFormat: 'school_prefix',
  schoolPrefix: 'FTH',
  idSequences: { '9': 1, '10': 1, '11': 1, '12': 1 },
  roles: ['admin', 'director', 'manager', 'deputy_manager', 'staff'], 
  rolePermissions: DEFAULT_PERMISSIONS,
  isPaidSchool: false,
  feeStructure: [
      { id: '1', name: 'Tuition', amount: 5000, frequency: 'yearly' },
      { id: '2', name: 'Books', amount: 250, frequency: 'one_time' },
      { id: '3', name: 'Uniform', amount: 150, frequency: 'one_time' },
      { id: '4', name: 'Activity', amount: 100, frequency: 'monthly' }
  ]
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
    // ... existing ...
    dashboard: "Dashboard",
    attendance: "Attendance",
    scan: "Scan",
    register: "Register",
    students: "Student Management",
    reports: "Reports",
    education: "Education",
    calendar: "Calendar & Tasks",
    settings: "Settings",
    profile: "Profile",
    finance: "Finance & Payments",
    
    // Finance
    payments: "Payments",
    expenses: "Spendings",
    tuition: "Tuition",
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
    amount: "Amount",
    addPayment: "Add Payment",
    addExpense: "Add Expense",
    enableFinance: "Enable Tuition/Payment Tracking",
    fees: "Fee Structure",

    // Tasks
    todo: "Todo",
    task: "Task",
    assignedTo: "Assigned To",
    dueDate: "Due Date",
    reminder: "Reminder",
    completed: "Completed",
    addTask: "Add Task",
    myTasks: "My Tasks",
    assignedTasks: "Assigned Tasks",

    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    archive: "Archive",
    restore: "Restore",
    remove: "Remove",
    update: "Update",
    add: "Add",
    // ... other keys ...
  },
  tr: {
    // ... existing ...
    dashboard: "Panel",
    attendance: "Yoklama Takibi",
    scan: "Tarama",
    register: "Kayıt",
    students: "Öğrenci Yönetimi",
    reports: "Raporlar",
    education: "Eğitim & Değ.",
    calendar: "Takvim & Görevler",
    settings: "Ayarlar",
    profile: "Profil",
    finance: "Harcama ve Ödemeler",

    // Finance
    payments: "Ödemeler",
    expenses: "Harcamalar",
    tuition: "Okul Ücreti",
    pending: "Bekliyor",
    paid: "Ödendi",
    overdue: "Gecikmiş",
    amount: "Tutar",
    addPayment: "Ödeme Ekle",
    addExpense: "Harcama Ekle",
    enableFinance: "Ödeme Takibini Aktif Et",
    fees: "Ücret Yapılandırması",

    // Tasks
    todo: "Yapılacak",
    task: "Görev",
    assignedTo: "Atanan Kişi",
    dueDate: "Son Tarih",
    reminder: "Hatırlatıcı",
    completed: "Tamamlandı",
    addTask: "Görev Ekle",
    myTasks: "Görevlerim",
    assignedTasks: "Atanan Görevler",

    // Common
    save: "Kaydet",
    cancel: "İptal",
    edit: "Düzenle",
    delete: "Sil",
    archive: "Arşivle",
    restore: "Geri Yükle",
    remove: "Kaldır",
    update: "Güncelle",
    add: "Ekle",
    // ... other keys ...
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('attendai_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('attendai_settings');
    const parsed = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    
    // Migration: Convert old fee structure if it exists as object
    let fees = INITIAL_SETTINGS.feeStructure;
    if (parsed.feeStructure && !Array.isArray(parsed.feeStructure)) {
        // Convert old object {tuition: 5000} to array
        fees = Object.keys(parsed.feeStructure).map((key, i) => ({
            id: i.toString(),
            name: key.charAt(0).toUpperCase() + key.slice(1),
            amount: parsed.feeStructure[key],
            frequency: 'one_time'
        }));
    } else if (parsed.feeStructure) {
        fees = parsed.feeStructure;
    }

    return { 
        ...INITIAL_SETTINGS, 
        ...parsed,
        feeStructure: fees,
        rolePermissions: parsed.rolePermissions || DEFAULT_PERMISSIONS
    };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('attendai_users');
    let parsed = saved ? JSON.parse(saved) : [];
    
    const defaults = [DEFAULT_ADMIN, SIMPLE_ADMIN];
    defaults.forEach(d => {
        if (!parsed.find((u: User) => u.username === d.username)) {
            parsed.push(d);
        }
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
    const testId = 'FTH253983';
    if (!parsed.find((s: Student) => s.id === testId)) {
        parsed.push({
            id: testId,
            firstName: 'Alex',
            lastName: 'Testuser',
            gradeLevel: '10',
            section: 'A',
            classTeacher: 'Mr. Anderson',
            guardian: { name: 'Parent Testuser', relation: 'Father', phone: '+1 555 0199', email: 'parent@test.com' },
            photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'],
            dob: '2008-05-15',
            address: '123 Test Lane',
            gender: 'Male',
            isArchived: false
        });
    }
    return parsed;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendai_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [grades, setGrades] = useState<Grade[]>(() => {
      const saved = localStorage.getItem('attendai_grades');
      return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
      const saved = localStorage.getItem('attendai_payments');
      return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
      const saved = localStorage.getItem('attendai_expenses');
      return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
      const saved = localStorage.getItem('attendai_tasks');
      return saved ? JSON.parse(saved) : [];
  });

  // --- PERSISTENCE ---
  useEffect(() => localStorage.setItem('attendai_user', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('attendai_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('attendai_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('attendai_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('attendai_students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('attendai_attendance', JSON.stringify(attendance)), [attendance]);
  useEffect(() => localStorage.setItem('attendai_grades', JSON.stringify(grades)), [grades]);
  useEffect(() => localStorage.setItem('attendai_payments', JSON.stringify(payments)), [payments]);
  useEffect(() => localStorage.setItem('attendai_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('attendai_tasks', JSON.stringify(tasks)), [tasks]);

  // --- ACTIONS ---
  const logAction = (action: string, details: string) => {
    if (!currentUser) return;
    setLogs(prev => [{
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.username,
      action,
      details,
      timestamp: Date.now()
    }, ...prev]);
  };

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        if (user.isArchived) { alert("Account deactivated"); return false; }
        const effPerms = settings.rolePermissions?.[user.role] || DEFAULT_PERMISSIONS['staff'];
        setCurrentUser({ ...user, permissions: user.permissions?.length ? user.permissions : effPerms });
        logAction("LOGIN", `User logged in: ${user.username}`);
        return true;
    }
    return false;
  };

  const logout = () => { logAction("LOGOUT", "User logged out"); setCurrentUser(null); };
  const updateUser = (u: User) => { setUsers(prev => prev.map(x => x.id === u.id ? u : x)); if(currentUser?.id === u.id) setCurrentUser(u); logAction("UPDATE_USER", u.username); };
  const addUser = (u: User) => { setUsers(prev => [...prev, {...u, permissions: u.permissions || settings.rolePermissions?.[u.role]}]); logAction("ADD_USER", u.username); };
  const deleteUser = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, isArchived: true } : u));
  const restoreUser = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, isArchived: false } : u));
  const deleteUserPermanently = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const addStudent = (s: Student) => {
    setStudents(prev => [...prev, s]);
    if (s.gradeLevel && settings.idSequences) {
        setSettings(prev => ({ ...prev, idSequences: { ...prev.idSequences, [s.gradeLevel]: (prev.idSequences?.[s.gradeLevel] || 0) + 1 } }));
    }
    logAction("REGISTER_STUDENT", `${s.firstName} ${s.lastName}`);
  };
  const updateStudent = (s: Student) => { setStudents(prev => prev.map(x => x.id === s.id ? s : x)); logAction("UPDATE_STUDENT", s.firstName); };
  const deleteStudent = (id: string) => setStudents(prev => prev.map(s => s.id === id ? { ...s, isArchived: true } : s));
  const restoreStudent = (id: string) => setStudents(prev => prev.map(s => s.id === id ? { ...s, isArchived: false } : s));
  const deleteStudentPermanently = (id: string) => setStudents(prev => prev.filter(s => s.id !== id));

  const markAttendance = (studentId: string, method: any, confidence?: number, liveImage?: string) => {
    const sIdx = students.findIndex(s => s.id === studentId);
    if (sIdx === -1) return;
    const today = new Date().toDateString();
    if (attendance.some(a => a.studentId === studentId && new Date(a.timestamp).toDateString() === today)) return;

    setAttendance(prev => [{
      id: Date.now().toString(), studentId, studentName: `${students[sIdx].firstName} ${students[sIdx].lastName}`,
      timestamp: Date.now(), status: 'present', verificationMethod: method, confidenceScore: confidence
    }, ...prev]);
    
    if (method === 'face_match' && liveImage) {
        setStudents(prev => {
            const upd = [...prev];
            const stu = { ...upd[sIdx] };
            stu.photos = [liveImage, ...stu.photos].slice(0, 15);
            upd[sIdx] = stu;
            return upd;
        });
    }
  };

  const addPayment = (p: Payment) => { setPayments(prev => [p, ...prev]); logAction("ADD_PAYMENT", `Amount: ${p.amount}`); };
  const addGrade = (g: Grade) => { setGrades(prev => [...prev, g]); logAction("ADD_GRADE", `Subject: ${g.subject}`); };
  
  const addExpense = (e: Expense) => { setExpenses(prev => [e, ...prev]); logAction("ADD_EXPENSE", `Amount: ${e.amount}`); };
  const deleteExpense = (id: string) => { setExpenses(prev => prev.filter(e => e.id !== id)); };

  const addTask = (t: Task) => { setTasks(prev => [...prev, t]); logAction("ADD_TASK", t.title); };
  const updateTask = (t: Task) => { setTasks(prev => prev.map(x => x.id === t.id ? t : x)); };
  const deleteTask = (id: string) => { setTasks(prev => prev.filter(t => t.id !== id)); };

  const getStudent = (id: string) => students.find(s => s.id === id);
  const updateSettings = (s: SchoolSettings) => { setSettings(s); logAction("UPDATE_SETTINGS", "System settings"); };
  const updateRolePermissions = (r: UserRole, p: UserPermission[]) => { setSettings(prev => ({...prev, rolePermissions: {...prev.rolePermissions, [r]: p}})); };
  const addRole = (r: string) => { const slug = r.toLowerCase().replace(/\s+/g, '_'); setSettings(prev => ({...prev, roles: [...prev.roles, slug], rolePermissions: {...prev.rolePermissions, [slug]: DEFAULT_PERMISSIONS['staff']}})); };
  const deleteRole = (r: string) => { if(r === 'admin') return; setSettings(prev => ({...prev, roles: prev.roles.filter(x => x !== r)})); setUsers(prev => prev.map(u => u.role === r ? {...u, role: 'staff'} : u)); };
  
  const generateStudentId = (gradeLevel: string = '9', section: string = 'A') => {
      const year = new Date().getFullYear().toString().slice(-2);
      const seq = (settings.idSequences?.[gradeLevel] || 1).toString().padStart(3, '0');
      return settings.idFormat === 'grade_prefix' ? `${gradeLevel}${section}${seq}` : settings.idFormat === 'standard' ? `${year}${gradeLevel}${seq}` : `${settings.schoolPrefix || 'SCH'}${year}${seq}`;
  };

  const t = (key: string) => DICTIONARY[settings.language]?.[key] || key; // Helper to get translation or fallback to key

  return (
    <AppContext.Provider value={{ 
      currentUser, users, login, logout, updateUser, addUser, deleteUser, restoreUser, deleteUserPermanently, logs,
      students, attendance, grades, payments, expenses, tasks, settings, 
      addStudent, updateStudent, deleteStudent, restoreStudent, deleteStudentPermanently,
      markAttendance, addPayment, addGrade, addExpense, deleteExpense, addTask, updateTask, deleteTask,
      getStudent, updateSettings, updateRolePermissions, addRole, deleteRole, generateStudentId, t 
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
