import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Download, Filter, Calendar, X, User } from 'lucide-react';

const Reports = () => {
  const { students, attendance, t } = useAppContext();
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Derived Data
  const filteredData = useMemo(() => {
    let targetDateStart = new Date();
    targetDateStart.setHours(0,0,0,0);
    
    if (dateRange === 'week') targetDateStart.setDate(targetDateStart.getDate() - 7);
    if (dateRange === 'month') targetDateStart.setDate(targetDateStart.getDate() - 30);

    // Get all records within date range
    const recordsInRange = attendance.filter(a => new Date(a.timestamp) >= targetDateStart);

    // Combine with students to get "Absent" rows for "Today" specifically
    // For ranges > today, calculating "Absent" requires checking every single day for every student (complex),
    // So for this demo, we list "Present" records for history, and full status for "Today".
    
    if (dateRange === 'today') {
        const todayStr = new Date().toDateString();
        return students.map(student => {
            const record = attendance.find(a => a.studentId === student.id && new Date(a.timestamp).toDateString() === todayStr);
            const status = record ? record.status : 'absent';
            return {
                ...student,
                status,
                timestamp: record?.timestamp,
                method: record?.verificationMethod
            };
        }).filter(item => statusFilter === 'all' || item.status === statusFilter);
    } else {
        // Historical List
        return recordsInRange.map(record => {
            const student = students.find(s => s.id === record.studentId);
            return {
                id: student?.id || record.studentId,
                firstName: student?.firstName || '',
                lastName: student?.lastName || record.studentName,
                gradeLevel: student?.gradeLevel || '',
                section: student?.section || '',
                photos: student?.photos || [],
                status: record.status,
                timestamp: record.timestamp,
                method: record.verificationMethod
            };
        }).filter(item => statusFilter === 'all' || item.status === statusFilter);
    }
  }, [students, attendance, statusFilter, dateRange]);

  const selectedStudent = useMemo(() => {
      if (!selectedStudentId) return null;
      return students.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, students]);

  const studentHistory = useMemo(() => {
      if (!selectedStudentId) return [];
      return attendance.filter(a => a.studentId === selectedStudentId).sort((a,b) => b.timestamp - a.timestamp);
  }, [selectedStudentId, attendance]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800">{t('reports')}</h2>
            <p className="text-sm text-slate-500">Attendance analysis and history</p>
        </div>
        <div className="flex gap-2">
            <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium outline-none"
            >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
            </select>
            <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium outline-none"
            >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
            </select>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800">
                <Download size={16} /> Export
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Grade</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date/Time</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredData.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>
                    ) : (
                        filteredData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition group">
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                    <img src={item.photos?.[0] || ''} alt="" className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                                    {item.firstName} {item.lastName}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                                <td className="px-6 py-4">{item.gradeLevel}-{item.section}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${item.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                    `}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    {item.method ? (item.method === 'face_match' ? 'Biometric' : 'Manual') : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setSelectedStudentId(item.id)} className="text-blue-600 hover:underline text-xs font-medium">View History</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                      <div className="flex gap-4">
                          <img src={selectedStudent.photos[0]} className="w-16 h-16 rounded-lg bg-slate-700 object-cover" />
                          <div>
                              <h3 className="text-xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                              <p className="opacity-80 text-sm">{selectedStudent.id} • {selectedStudent.gradeLevel}-{selectedStudent.section}</p>
                              <p className="text-xs opacity-60 mt-1">Guardian: {selectedStudent.guardian.name} ({selectedStudent.guardian.phone})</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedStudentId(null)} className="text-white/60 hover:text-white"><X size={24}/></button>
                  </div>
                  
                  <div className="p-6">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Calendar size={18} /> Attendance History
                      </h4>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                          {studentHistory.length === 0 ? <p className="text-slate-500">No history available.</p> : (
                              studentHistory.map(rec => (
                                  <div key={rec.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-2 h-2 rounded-full ${rec.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
                                          <span className="font-medium text-slate-700">{new Date(rec.timestamp).toLocaleDateString()}</span>
                                      </div>
                                      <div className="text-right">
                                          <span className="text-sm text-slate-600 block">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                                          <span className="text-[10px] text-slate-400 uppercase">{rec.verificationMethod}</span>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Reports;