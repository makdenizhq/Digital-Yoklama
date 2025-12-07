import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, UserCheck, Clock, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, gradient }: any) => (
  <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/50 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
    <div className={`p-4 rounded-xl text-white shadow-lg ${gradient} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 opacity-80">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
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
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('totalStudents')} value={stats.total} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30" />
        <StatCard title={t('presentToday')} value={stats.present} icon={UserCheck} gradient="bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30" />
        <StatCard title={t('absent')} value={stats.absent} icon={AlertCircle} gradient="bg-gradient-to-br from-red-400 to-rose-600 shadow-red-500/30" />
        <StatCard title={t('attendanceRate')} value={`${stats.rate}%`} icon={Clock} gradient="bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-violet-500 rounded-full"></span>
                  {t('attendanceRate')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-md" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  {t('recentActivity')}
              </h3>
              <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {attendance.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-white shadow-sm group-hover:scale-110 transition-transform">
                            {record.studentName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{record.studentName}</p>
                            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                <Clock size={10}/> {new Date(record.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border shadow-sm
                            ${record.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}
                        `}>
                            {record.status}
                        </span>
                    </div>
                  </div>
                ))}
                {attendance.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Clock size={32} className="mb-2 opacity-20"/>
                        <p className="text-xs font-medium">{t('noRecords')}</p>
                    </div>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;