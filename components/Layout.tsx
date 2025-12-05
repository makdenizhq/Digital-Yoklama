import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, ScanLine, UserPlus, FileBarChart, Settings, School, User as UserIcon, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const NavItem = ({ view, current, icon: Icon, onClick, label }: any) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
      ${current === view 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { settings, currentUser, logout, t } = useAppContext();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl shadow-slate-200/50 no-print">
            
            {/* User Profile Card */}
            <div className="p-6 pb-2">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 flex-shrink-0">
                        {currentUser?.photoUrl ? (
                            <img src={currentUser.photoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <UserIcon size={20} />
                            </div>
                        )}
                     </div>
                     <div className="overflow-hidden">
                         <h3 className="font-bold text-sm text-slate-900 truncate">{currentUser?.fullName}</h3>
                         <p className="text-xs text-slate-500 truncate">{currentUser?.title}</p>
                     </div>
                </div>

                <div className="flex items-center gap-3 px-2 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                        <School size={18} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-sm leading-tight">AttendAI</h1>
                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{settings.schoolName}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <NavItem view="dashboard" current={currentView} icon={LayoutDashboard} onClick={onNavigate} label={t('dashboard')} />
                <NavItem view="scan" current={currentView} icon={ScanLine} onClick={onNavigate} label={t('scan')} />
                <NavItem view="register" current={currentView} icon={UserPlus} onClick={onNavigate} label={t('register')} />
                <NavItem view="reports" current={currentView} icon={FileBarChart} onClick={onNavigate} label={t('reports')} />
                <NavItem view="settings" current={currentView} icon={Settings} onClick={onNavigate} label={t('settings')} />
                
                {/* Profile Link in Nav */}
                <button
                    onClick={() => onNavigate('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mt-4
                    ${currentView === 'profile' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                    <UserIcon size={20} />
                    {t('profile')}
                </button>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-100">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-colors">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
            <div className="max-w-7xl mx-auto p-6 md:p-10 min-h-full">
                {children}
            </div>
        </main>
    </div>
  );
};

export default Layout;