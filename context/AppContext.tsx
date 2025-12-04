import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, AttendanceRecord } from '../types';

interface AppContextType {
  students: Student[];
  attendance: AttendanceRecord[];
  addStudent: (student: Student) => void;
  markAttendance: (studentId: string, method: 'face_match' | 'manual_override', confidence?: number, liveImage?: string) => void;
  getStudent: (id: string) => Student | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to migrate old data if it exists in local storage
const migrateStudentData = (data: any[]): Student[] => {
  return data.map(s => ({
    ...s,
    // If it has photoUrl (old), move it to photos array. If it has photos (new), keep it.
    photos: s.photos || (s.photoUrl ? [s.photoUrl] : [])
  }));
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-1001',
    name: 'Emma Watson',
    grade: '10A',
    photos: ['https://picsum.photos/seed/emma/300/300'],
    parentEmail: 'parent@example.com'
  },
  {
    id: 'STU-1002',
    name: 'Liam Neeson',
    grade: '10A',
    photos: ['https://picsum.photos/seed/liam/300/300'],
    parentEmail: 'parent@example.com'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('attendai_students');
    return saved ? migrateStudentData(JSON.parse(saved)) : INITIAL_STUDENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendai_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('attendai_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('attendai_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const markAttendance = (studentId: string, method: 'face_match' | 'manual_override', confidence?: number, liveImage?: string) => {
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return;
    const student = students[studentIndex];

    // Check if already marked for today
    const today = new Date().toDateString();
    const alreadyMarked = attendance.some(a => 
      a.studentId === studentId && new Date(a.timestamp).toDateString() === today
    );

    if (alreadyMarked) return;

    // 1. Record Attendance
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId,
      studentName: student.name,
      timestamp: Date.now(),
      status: 'present',
      verificationMethod: method,
      confidenceScore: confidence
    };
    setAttendance(prev => [newRecord, ...prev]);

    // 2. Adaptive Learning: Add live image to student database if face match was successful
    if (method === 'face_match' && liveImage) {
        setStudents(prev => {
            const updated = [...prev];
            const currentStudent = { ...updated[studentIndex] };
            
            // Add new photo to the front
            const newPhotos = [liveImage, ...currentStudent.photos];
            
            // Limit to 15 photos max to prevent massive local storage
            if (newPhotos.length > 15) {
                newPhotos.length = 15;
            }
            
            currentStudent.photos = newPhotos;
            updated[studentIndex] = currentStudent;
            return updated;
        });
    }
  };

  const getStudent = (id: string) => students.find(s => s.id === id);

  return (
    <AppContext.Provider value={{ students, attendance, addStudent, markAttendance, getStudent }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};