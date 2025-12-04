import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Download, Filter } from 'lucide-react';

const Reports = () => {
  const { students, attendance } = useAppContext();

  // Helper to get status for a student today
  const getStatus = (studentId: string) => {
    const today = new Date().toDateString();
    const record = attendance.find(a => a.studentId === studentId && new Date(a.timestamp).toDateString() === today);
    return record ? { status: record.status, time: record.timestamp, method: record.verificationMethod } : { status: 'absent', time: null, method: null };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800">Daily Attendance Report</h2>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium flex items-center gap-2 hover:bg-slate-50">
                <Filter size={16} /> Filter
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800">
                <Download size={16} /> Export CSV
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Grade</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Time In</th>
                        <th className="px-6 py-4">Verification</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {students.map(student => {
                        const { status, time, method } = getStatus(student.id);
                        return (
                            <tr key={student.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                    <img src={student.photos[0]} alt="" className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                                    {student.name}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{student.id}</td>
                                <td className="px-6 py-4">{student.grade}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                    `}>
                                        {status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    {method ? (method === 'face_match' ? 'Biometric' : 'Manual') : '-'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;