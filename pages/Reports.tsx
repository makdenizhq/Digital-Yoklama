
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Download, X, Calendar, Printer, FileDown, ChevronDown } from 'lucide-react';
import { exportToPdf, exportToWord } from '../services/exportService';

const Reports = () => {
  const { students, attendance, t } = useAppContext();
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const filteredData = useMemo(() => {
    let targetDateStart = new Date();
    targetDateStart.setHours(0,0,0,0);
    if (dateRange === 'week') targetDateStart.setDate(targetDateStart.getDate() - 7);
    if (dateRange === 'month') targetDateStart.setDate(targetDateStart.getDate() - 30);
    
    // Filter attendance records by date first
    const recordsInRange = attendance.filter(a => new Date(a.timestamp) >= targetDateStart);

    let result = [];

    if (dateRange === 'today') {
        const todayStr = new Date().toDateString();
        // For today, we list ALL students and show their status
        result = students.map(student => {
            const record = attendance.find(a => a.studentId === student.id && new Date(a.timestamp).toDateString() === todayStr);
            return {
                ...student,
                status: record ? record.status : 'absent',
                timestamp: record?.timestamp,
                method: record?.verificationMethod
            };
        });
    } else {
        // For historical ranges, we only show present records based on the date range
        // But to make it useful, we map attendance records back to student info
        result = recordsInRange.map(record => {
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
        });
    }

    // Apply Status and Grade Filters
    return result.filter(item => {
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesGrade = gradeFilter === 'all' || item.gradeLevel === gradeFilter;
        return matchesStatus && matchesGrade;
    });

  }, [students, attendance, statusFilter, dateRange, gradeFilter]);

  const selectedStudent = useMemo(() => {
      if (!selectedStudentId) return null;
      return students.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, students]);

  const studentHistory = useMemo(() => {
      if (!selectedStudentId) return [];
      return attendance.filter(a => a.studentId === selectedStudentId).sort((a,b) => b.timestamp - a.timestamp);
  }, [selectedStudentId, attendance]);

  // Get unique grades for filter dropdown
  const availableGrades = useMemo(() => {
      const grades = new Set(students.map(s => s.gradeLevel).filter(Boolean));
      return Array.from(grades).sort();
  }, [students]);

  const handlePrint = (e: React.MouseEvent) => {
      e.preventDefault();
      setTimeout(() => window.print(), 100);
  };

  const handleDownload = (type: 'pdf' | 'word') => {
      const fileName = `Attendance_Report_${dateRange}_${new Date().toISOString().split('T')[0]}`;
      if (type === 'pdf') {
          exportToPdf('reports-content', fileName);
      } else {
          exportToWord('reports-content', fileName);
      }
      setShowDownloadMenu(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10 no-print">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-800">{t('reports')}</h2>
            <div className="flex gap-2">
                <div className="relative">
                    <button 
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
                    >
                        <Download size={16} /> Download <ChevronDown size={14}/>
                    </button>
                    {showDownloadMenu && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                            <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                <FileText size={16} className="text-red-500"/> PDF
                            </button>
                            <button onClick={() => handleDownload('word')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                <FileDown size={16} className="text-blue-500"/> Word
                            </button>
                        </div>
                    )}
                </div>
                <button 
                    type="button" 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                >
                    <Printer size={16} /> Print
                </button>
            </div>
        </div>
        <div className="flex gap-2 flex-wrap">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)} className="flex-1 min-w-[100px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition">
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
            </select>
            
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="flex-1 min-w-[100px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition">
                <option value="all">All Grades</option>
                {availableGrades.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                ))}
                {!availableGrades.length && [9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="flex-1 min-w-[100px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition">
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
            </select>
        </div>
      </div>

      {/* PRINT HEADER (Visible only when printing) */}
      <div className="hidden print:block mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Attendance Report</h1>
          <p className="text-sm text-slate-500">
              Filter: {dateRange.toUpperCase()} • Grade: {gradeFilter === 'all' ? 'All' : gradeFilter} • Status: {statusFilter.toUpperCase()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div id="reports-content" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Grade</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredData.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-medium">No records found matching filters.</td></tr>
                    ) : (
                        filteredData.map((item, idx) => (
                            <tr key={idx} onClick={() => setSelectedStudentId(item.id)} className="hover:bg-blue-50/50 transition cursor-pointer group print:break-inside-avoid">
                                <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-3">
                                    <img src={item.photos?.[0] || ''} alt="" className="w-8 h-8 rounded-full bg-slate-200 object-cover border border-slate-100 print:hidden" />
                                    <div>
                                        <div className="font-bold">{item.firstName} {item.lastName}</div>
                                        <div className="text-[10px] text-slate-400 font-mono sm:hidden">{item.gradeLevel}-{item.section}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-700 print:bg-white print:border print:border-slate-300">
                                        {item.gradeLevel}-{item.section}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider print:border print:border-slate-300
                                        ${item.status === 'present' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}
                                    `}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200 no-print">
              <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                  <div className="bg-slate-900 p-5 text-white flex justify-between items-start relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                      <div className="flex gap-4 relative z-10">
                          <img src={selectedStudent.photos[0]} className="w-16 h-16 rounded-xl bg-slate-700 object-cover border-2 border-white/20 shadow-lg" />
                          <div>
                              <h3 className="text-xl font-bold leading-tight">{selectedStudent.firstName} <br/> {selectedStudent.lastName}</h3>
                              <p className="opacity-80 text-xs font-mono mt-1 px-2 py-0.5 bg-white/10 rounded inline-block">{selectedStudent.id}</p>
                              <div className="flex gap-2 mt-2">
                                  <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded">{selectedStudent.gradeLevel}-{selectedStudent.section}</span>
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setSelectedStudentId(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition z-10"><X size={18}/></button>
                  </div>
                  
                  <div className="p-5">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm border-b border-slate-100 pb-2">
                          <Calendar size={16} className="text-blue-500" /> Attendance History
                      </h4>
                      <div className="max-h-[250px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                          {studentHistory.length > 0 ? studentHistory.map(rec => (
                              <div key={rec.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-2.5 h-2.5 rounded-full ${rec.status === 'present' ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-red-500 shadow-lg shadow-red-500/30'}`} />
                                      <div>
                                          <p className="font-bold text-xs text-slate-700">{new Date(rec.timestamp).toLocaleDateString()}</p>
                                          <p className="text-[10px] text-slate-400 capitalize">{rec.verificationMethod.replace('_', ' ')}</p>
                                      </div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 font-mono bg-white px-2 py-1 rounded border border-slate-100">
                                      {new Date(rec.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                  </span>
                              </div>
                          )) : (
                              <p className="text-center text-slate-400 text-xs py-4">No attendance history found.</p>
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
