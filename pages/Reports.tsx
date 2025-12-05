
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Download, X, Calendar } from 'lucide-react';

const Reports = () => {
  const { students, attendance, t } = useAppContext();
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let targetDateStart = new Date();
    targetDateStart.setHours(0,0,0,0);
    if (dateRange === 'week') targetDateStart.setDate(targetDateStart.getDate() - 7);
    if (dateRange === 'month') targetDateStart.setDate(targetDateStart.getDate() - 30);
    const recordsInRange = attendance.filter(a => new Date(a.timestamp) >= targetDateStart);

    if (dateRange === 'today') {
        const todayStr = new Date().toDateString();
        return students.map(student => {
            const record = attendance.find(a => a.studentId === student.id && new Date(a.timestamp).toDateString() === todayStr);
            return {
                ...student,
                status: record ? record.status : 'absent',
                timestamp: record?.timestamp,
                method: record?.verificationMethod
            };
        }).filter(item => statusFilter === 'all' || item.status === statusFilter);
    } else {
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
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-800 mb-3">{t('reports')}</h2>
        <div className="flex gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
                <option value="today">Today</option>
                <option value="week">7 Days</option>
                <option value="month">30 Days</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
            </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredData.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No records found.</td></tr>
                    ) : (
                        filteredData.map((item, idx) => (
                            <tr key={idx} onClick={() => setSelectedStudentId(item.id)} className="hover:bg-slate-50 transition cursor-pointer">
                                <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                                    <img src={item.photos?.[0] || ''} alt="" className="w-6 h-6 rounded-full bg-slate-200 object-cover" />
                                    {item.firstName} {item.lastName}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                        ${item.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                    `}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
              <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                  <div className="bg-slate-900 p-5 text-white flex justify-between items-start">
                      <div className="flex gap-4">
                          <img src={selectedStudent.photos[0]} className="w-14 h-14 rounded-lg bg-slate-700 object-cover border border-white/20" />
                          <div>
                              <h3 className="text-lg font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                              <p className="opacity-80 text-xs font-mono">{selectedStudent.id}</p>
                              <p className="text-xs opacity-60 mt-1">{selectedStudent.gradeLevel}-{selectedStudent.section}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedStudentId(null)} className="bg-white/10 p-1.5 rounded-full"><X size={16}/></button>
                  </div>
                  
                  <div className="p-5">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                          <Calendar size={16} /> Attendance History
                      </h4>
                      <div className="max-h-[250px] overflow-y-auto space-y-2">
                          {studentHistory.map(rec => (
                              <div key={rec.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-2 h-2 rounded-full ${rec.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
                                      <span className="font-bold text-xs text-slate-700">{new Date(rec.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <span className="text-xs text-slate-500 font-mono">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Reports;
