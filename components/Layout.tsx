
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  Settings, 
  UserCircle, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  School,
  Users,
  CalendarCheck,
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  Bell,
  AlarmClock,
  Timer,
  AlertCircle,
  CalendarOff
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

// Mock Bell Schedule (Ideally in settings)
const BELL_SCHEDULE = [
    { type: 'lesson', start: '08:30', end: '09:10', label: '1. Lesson' },
    { type: 'break', start: '09:10', end: '09:20', label: 'Break' },
    { type: 'lesson', start: '09:20', end: '10:00', label: '2. Lesson' },
    { type: 'break', start: '10:00', end: '10:10', label: 'Break' },
    { type: 'lesson', start: '10:10', end: '10:50', label: '3. Lesson' },
    { type: 'break', start: '10:50', end: '11:00', label: 'Break' },
    { type: 'lesson', start: '11:00', end: '11:40', label: '4. Lesson' },
    { type: 'break', start: '11:40', end: '12:30', label: 'Lunch' },
    { type: 'lesson', start: '12:30', end: '13:10', label: '5. Lesson' },
];

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { settings, currentUser, logout, t, tasks } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmActive, setAlarmActive] = useState<{title: string, time: string} | null>(null);

  // Live Clock & Alarm Check
  useEffect(() => {
      const timer = setInterval(() => {
          const now = new Date();
          setCurrentTime(now);

          // Check Task Reminders
          tasks.forEach(task => {
              if (task.reminder && task.reminderDate && task.status !== 'completed') {
                  const taskTime = new Date(task.reminderDate);
                  // Check if within the current minute
                  if (taskTime.getHours() === now.getHours() && taskTime.getMinutes() === now.getMinutes() && now.getSeconds() < 2) {
                      setAlarmActive({ title: task.title, time: taskTime.toLocaleTimeString() });
                      // Play sound
                      try {
                          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                          audio.play();
                      } catch(e) {}
                  }
              }
          });

      }, 1000);
      return () => clearInterval(timer);
  }, [tasks]);

  // School Timer Logic
  const schoolStatus = useMemo(() => {
      const nowStr = currentTime.toTimeString().slice(0,5);
      const day = currentTime.getDay();
      const isWeekend = day === 0 || day === 6; // 0 = Sunday, 6 = Saturday

      if (isWeekend) {
          return { status: 'off', label: 'No Classes Today', remaining: 0, color: 'bg-slate-100 text-slate-500 border-slate-200' };
      }

      const current = BELL_SCHEDULE.find(s => nowStr >= s.start && nowStr < s.end);
      
      if (current) {
          const endTime = new Date();
          const [h, m] = current.end.split(':').map(Number);
          endTime.setHours(h, m, 0);
          const diffMs = endTime.getTime() - currentTime.getTime();
          const diffMins = Math.ceil(diffMs / 60000);
          
          return {
              status: current.type,
              label: current.label,
              remaining: diffMins,
              color: current.type === 'lesson' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-orange-100 text-orange-800 border-orange-200'
          };
      }
      return { status: 'free', label: 'Free Time', remaining: 0, color: 'bg-slate-100 text-slate-600 border-slate-200' };
  }, [currentTime]);

  // Ticker Logic (Priority Tasks)
  const tickerTasks = useMemo(() => {
      const now = new Date();
      return tasks.filter(t => t.status === 'pending').map(t => {
          const due = new Date(t.dueDate);
          const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          let show = false;
          if (t.priority === 'high' && diffDays <= 7) show = true;
          if (t.priority === 'medium' && diffDays <= 2) show = true;
          if (t.priority === 'normal' && diffDays <= 1) show = true;
          if (t.priority === 'low' && diffDays <= 0) show = true;

          return show ? { ...t, diffDays } : null;
      }).filter(Boolean) as any[];
  }, [tasks, currentTime]);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'students', label: t('students'), icon: Users }, 
    { id: 'attendance', label: t('attendance'), icon: ClipboardCheck },
    { id: 'education', label: t('education'), icon: GraduationCap },
    { id: 'calendar', label: t('calendar'), icon: CalendarCheck },
    ...(settings.isPaidSchool ? [{ id: 'finance', label: t('finance'), icon: CreditCard }] : []),
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter(item => {
      if (currentUser?.role === 'admin') return true;
      if (currentUser?.permissions && currentUser.permissions.includes(item.id as any)) return true;
      return false;
  });

  return (
    // Main Container with Glassmorphism Background
    <div className="flex h-screen overflow-hidden font-sans text-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-200">
      
      {/* Global Alarm Popup */}
      {alarmActive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in zoom-in duration-300">
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center max-w-sm border-4 border-red-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
                  <div className="bg-gradient-to-br from-red-100 to-red-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 shadow-inner">
                      <AlarmClock size={48} className="animate-bounce drop-shadow-md"/>
                  </div>
                  <h2 className="text-2xl font-black text-red-600 mb-2 tracking-tight">TASK REMINDER</h2>
                  <p className="text-lg font-bold text-slate-800">{alarmActive.title}</p>
                  <p className="text-slate-500 font-mono mt-1 bg-slate-100 inline-block px-3 py-1 rounded-full text-sm">{alarmActive.time}</p>
                  <button onClick={() => setAlarmActive(null)} className="mt-6 w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30">
                      Dismiss
                  </button>
              </div>
          </div>
      )}

      {/* SIDEBAR - Glass Effect */}
      <aside className={`relative h-full shadow-2xl border-r border-white/50 z-50 no-print transition-all duration-300 ease-in-out flex flex-col bg-white/80 backdrop-blur-xl ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-10 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50 border-4 border-slate-50 hover:scale-110 active:scale-95">
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={`flex items-center gap-4 p-6 h-28 border-b border-slate-100/50 transition-all ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0 overflow-hidden ring-2 ring-white">
             {settings.schoolLogoUrl ? <img src={settings.schoolLogoUrl} alt="Logo" className="w-full h-full object-cover" /> : <School className="text-white" size={28} />}
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
            <h1 className="font-black text-lg text-slate-800 leading-tight break-words tracking-tight" title={settings.schoolName}>{settings.schoolName}</h1>
          </div>
        </div>        

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <div key={item.id} className="relative group">
                <button 
                    onClick={() => onNavigate(item.id as ViewState)} 
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 relative overflow-hidden group 
                        ${isActive 
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-500' 
                            : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
                        } 
                        ${!isSidebarOpen && 'justify-center'}
                    `}
                >
                  <item.icon size={22} className={`flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'} ${isActive && 'drop-shadow-md'}`} />
                  <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'}`}>{item.label}</span>
                  {!isSidebarOpen && isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse" />}
                </button>
                {!isSidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-slate-800 transform rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100/50 bg-slate-50/50 backdrop-blur-sm">
           <button onClick={logout} className={`w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 ${!isSidebarOpen && 'justify-center'}`}>
              <LogOut size={20} />
              <span className={`font-bold text-sm whitespace-nowrap transition-all ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Logout</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden relative flex flex-col bg-white/30">
        {/* Dynamic Header with Glass Effect */}
        <header className={`h-20 border-b border-white/60 flex items-center justify-between px-8 flex-shrink-0 transition-colors duration-500 bg-white/60 backdrop-blur-md`}>
             <div className="flex items-center gap-6">
                <div className="text-sm font-medium text-slate-600 flex flex-col leading-tight">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Current Session</span>
                    <span className="text-slate-900 font-bold">2024-2025 Academic Year</span>
                </div>
                
                {/* Time & Schedule Status */}
                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-lg font-black text-slate-800 leading-none">
                            {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {currentTime.toLocaleDateString(settings.language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                    </div>

                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-sm shadow-sm transition-all duration-300 ${schoolStatus.color}`}>
                        <div className={`p-1.5 rounded-lg bg-white/40`}>
                            {schoolStatus.status === 'lesson' ? <GraduationCap size={18}/> : schoolStatus.status === 'off' ? <CalendarOff size={18}/> : <Bell size={18}/>}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xs uppercase tracking-wider opacity-80">{schoolStatus.status === 'off' ? 'Weekend' : schoolStatus.status}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-sm">{schoolStatus.label}</span>
                                {schoolStatus.remaining > 0 && (
                                    <span className="text-[10px] font-mono bg-white/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Timer size={10}/> {schoolStatus.remaining}m
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('profile')} className="group flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-slate-200 bg-white/80 hover:bg-white hover:shadow-md transition-all">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-800">{currentUser?.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-medium capitalize">{currentUser?.role.replace('_', ' ')}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                        {currentUser?.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><UserCircle size={24} /></div>}
                    </div>
                </button>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-12">
          <div className="max-w-7xl mx-auto h-full animate-fade-in">{children}</div>
        </div>

        {/* BOTTOM TICKER - Modernized */}
        {tickerTasks.length > 0 && (
            <div className="h-9 bg-slate-900/90 backdrop-blur-md text-white flex items-center overflow-hidden absolute bottom-0 w-full z-40 border-t border-slate-700/50 shadow-2xl">
                <div className="bg-red-600 px-4 h-full flex items-center gap-2 text-[10px] font-black tracking-widest z-10 shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
                    <AlertCircle size={12} className="animate-pulse"/> ALERTS
                </div>
                <div className="flex-1 overflow-hidden relative h-full flex items-center">
                    <div className="animate-marquee whitespace-nowrap flex items-center h-full absolute">
                        {[...tickerTasks, ...tickerTasks].map((t, i) => (
                            <div key={`${t.id}-${i}`} className="mx-8 text-xs font-medium flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${t.priority === 'high' ? 'bg-red-500 text-red-500 animate-pulse' : t.priority === 'medium' ? 'bg-orange-500 text-orange-500' : 'bg-blue-500 text-blue-500'}`}></span>
                                <span className="text-slate-400 font-mono">[{new Date(t.dueDate).toLocaleDateString()}]</span>
                                <span className="font-bold text-white tracking-wide">{t.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>
      
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Layout;
