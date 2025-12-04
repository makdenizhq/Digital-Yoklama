import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, ScanLine, UserPlus, FileBarChart, School, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const NavItem = ({ view, current, label, icon: Icon, onClick }: any) => (
  <button
    onClick={() => onClick(view)}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left mb-1
      ${current === view 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { t, settings, currentUser, logout } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 h-auto md:h-screen sticky top-0 z-50 flex-shrink-0 print:hidden flex flex-col">
        
        {/* User Profile Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-600/20">
                    <School size={20} />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">AttendAI</h1>
                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] mt-1">{settings.schoolName}</p>
                </div>
             </div>
             
             {currentUser && (
                 <div onClick={() => onNavigate('profile')} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition group">
                     <img src={currentUser.photoUrl} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                     <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{currentUser.fullName}</p>
                         <p className="text-xs text-slate-500 truncate">{currentUser.title}</p>
                     </div>
                     <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                 </div>
             )}
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <NavItem view="dashboard" current={currentView} label={t('dashboard')} icon={LayoutDashboard} onClick={onNavigate} />
          <NavItem view="scan" current={currentView} label={t('scan')} icon={ScanLine} onClick={onNavigate} />
          <NavItem view="register" current={currentView} label={t('register')} icon={UserPlus} onClick={onNavigate} />
          <NavItem view="reports" current={currentView} label={t('reports')} icon={FileBarChart} onClick={onNavigate} />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem view="settings" current={currentView} label={t('settings')} icon={Settings} onClick={onNavigate} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
             <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-all font-medium">
                 <LogOut size={20} /> Logout
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
         <div className="max-w-6xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
};

export default Layout;