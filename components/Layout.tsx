
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
  Timer
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
              color: current.type === 'lesson' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          };
      }
      return { status: 'free', label: 'Free Time', remaining: 0, color: 'bg-slate-100 text-slate-600' };
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Global Alarm Popup */}
      {alarmActive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm border-4 border-red-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
                  <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                      <AlarmClock size={40} className="animate-bounce"/>
                  </div>
                  <h2 className="text-2xl font-black text-red-600 mb-2">TASK REMINDER</h2>
                  <p className="text-lg font-bold text-slate-800">{alarmActive.title}</p>
                  <p className="text-slate-500 font-mono mt-1">{alarmActive.time}</p>
                  <button onClick={() => setAlarmActive(null)} className="mt-6 w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                      Dismiss
                  </button>
              </div>
          </div>
      )}

      <aside className={`relative bg-white h-full shadow-2xl border-r border-slate-100 z-50 no-print transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-10 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 border-2 border-slate-50">
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`flex items-center gap-3 p-6 h-24 border-b border-slate-50 transition-all ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0 overflow-hidden">
             {settings.schoolLogoUrl ? <img src={settings.schoolLogoUrl} alt="Logo" className="w-full h-full object-cover" /> : <School className="text-white" size={24} />}
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
            <h1 className="font-black text-lg text-slate-800 leading-tight break-words" title={settings.schoolName}>{settings.schoolName}</h1>
          </div>
        </div>        

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <div key={item.id} className="relative group">
                <button onClick={() => onNavigate(item.id as ViewState)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative overflow-hidden group ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'} ${!isSidebarOpen && 'justify-center'}`}>
                  <item.icon size={22} className={`flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                  <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'}`}>{item.label}</span>
                  {!isSidebarOpen && isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                </button>
                {!isSidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-slate-800 transform rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
           <button onClick={logout} className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
              <LogOut size={20} />
              <span className={`font-bold text-sm whitespace-nowrap transition-all ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Logout</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {/* Dynamic Header */}
        <header className={`h-16 border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0 transition-colors duration-500 ${schoolStatus.color}`}>
             <div className="flex items-center gap-6">
                <div className="text-sm font-medium opacity-80 flex flex-col leading-tight">
                    <span>Academic Year: <b>2024-2025</b></span>
                    <span className="font-mono text-xs opacity-70">
                        {currentTime.toLocaleDateString(settings.language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        {' ' + currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
                
                {/* School Timer */}
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                    {schoolStatus.status === 'lesson' ? <GraduationCap size={18}/> : <Bell size={18}/>}
                    <span className="font-bold text-sm">{schoolStatus.label}</span>
                    {schoolStatus.remaining > 0 && (
                        <span className="text-xs font-mono bg-white/30 px-1.5 rounded ml-1 flex items-center gap-1">
                            <Timer size={10}/> {schoolStatus.remaining}m left
                        </span>
                    )}
                </div>
             </div>

             <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition overflow-hidden bg-white">
                    {currentUser?.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover" alt="Profile" /> : <UserCircle size={20} />}
                </button>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-12">
          <div className="max-w-6xl mx-auto h-full">{children}</div>
        </div>

        {/* BOTTOM TICKER */}
        {tickerTasks.length > 0 && (
            <div className="h-8 bg-slate-900 text-white flex items-center overflow-hidden absolute bottom-0 w-full z-40 border-t border-slate-800">
                <div className="bg-red-600 px-3 h-full flex items-center text-[10px] font-black tracking-widest z-10">
                    ALERTS
                </div>
                <div className="flex-1 overflow-hidden relative h-full">
                    <div className="animate-marquee whitespace-nowrap flex items-center h-full absolute">
                        {tickerTasks.map((t, i) => (
                            <span key={i} className="mx-8 text-xs font-medium flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${t.priority === 'high' ? 'bg-red-500 animate-pulse' : t.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                <span className="text-slate-400 font-mono">[{new Date(t.dueDate).toLocaleDateString()}]</span>
                                <span className="font-bold text-white">{t.title}</span>
                            </span>
                        ))}
                         {/* Duplicate for seamless loop */}
                         {tickerTasks.map((t, i) => (
                            <span key={`dup-${i}`} className="mx-8 text-xs font-medium flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${t.priority === 'high' ? 'bg-red-500 animate-pulse' : t.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                <span className="text-slate-400 font-mono">[{new Date(t.dueDate).toLocaleDateString()}]</span>
                                <span className="font-bold text-white">{t.title}</span>
                            </span>
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
            animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Layout;
