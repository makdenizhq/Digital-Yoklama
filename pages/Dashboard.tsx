import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, UserCheck, Clock, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-4 rounded-full ${color} bg-opacity-10 text-current`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { students, attendance, t } = useAppContext();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const presentToday = attendance.filter(a => new Date(a.timestamp).toDateString() === today);
    
    return {
      total: students.length,
      present: presentToday.length,
      absent: students.length - presentToday.length,
      rate: students.length ? Math.round((presentToday.length / students.length) * 100) : 0
    };
  }, [students, attendance]);

  const chartData = [
    { name: 'Present', value: stats.present, color: '#10b981' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('totalStudents')} value={stats.total} icon={Users} color="bg-blue-500" />
        <StatCard title={t('presentToday')} value={stats.present} icon={UserCheck} color="bg-emerald-500" />
        <StatCard title={t('absent')} value={stats.absent} icon={AlertCircle} color="bg-red-500" />
        <StatCard title={t('attendanceRate')} value={`${stats.rate}%`} icon={Clock} color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('attendanceRate')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('recentActivity')}</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {attendance.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {record.studentName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{record.studentName}</p>
                        <p className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {record.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                        {record.verificationMethod === 'face_match' ? `Bio (${(record.confidenceScore || 0).toFixed(2)})` : 'Manual'}
                    </p>
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
                <p className="text-center text-slate-400 py-4">No records yet today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;