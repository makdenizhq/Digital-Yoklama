
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, UserCheck, Clock, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-current`}>
      <Icon size={20} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-xl font-black text-slate-800">{value}</h3>
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
    { name: t('presentToday'), value: stats.present, color: '#10b981' },
    { name: t('absent'), value: stats.absent, color: '#ef4444' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard title={t('totalStudents')} value={stats.total} icon={Users} color="bg-blue-500" />
        <StatCard title={t('presentToday')} value={stats.present} icon={UserCheck} color="bg-emerald-500" />
        <StatCard title={t('absent')} value={stats.absent} icon={AlertCircle} color="bg-red-500" />
        <StatCard title={t('attendanceRate')} value={`${stats.rate}%`} icon={Clock} color="bg-violet-500" />
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">{t('attendanceRate')}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">{t('recentActivity')}</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {attendance.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {record.studentName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-xs text-slate-900">{record.studentName}</p>
                        <p className="text-[10px] text-slate-500">{new Date(record.timestamp).toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                        {record.status}
                    </span>
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">{t('noRecords')}</p>
            )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
