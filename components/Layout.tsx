
import React, { useState } from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  ScanLine, 
  UserPlus, 
  FileBarChart, 
  Settings, 
  UserCircle, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  School,
  Users,
  Printer
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { settings, currentUser, logout, t } = useAppContext();
  
  // Sidebar'ın açık/kapalı durumu
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Menü öğeleri
  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'scan', label: t('scan'), icon: ScanLine },
    { id: 'register', label: t('register'), icon: UserPlus },
    { id: 'students', label: t('students'), icon: Users }, 
    { id: 'reports', label: t('reports'), icon: FileBarChart },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  // FILTER MENU ITEMS BASED ON PERMISSIONS
  const filteredMenuItems = menuItems.filter(item => {
      // Admins always have access
      if (currentUser?.role === 'admin') return true;
      
      // Check user permissions
      if (currentUser?.permissions && currentUser.permissions.includes(item.id as any)) {
          return true;
      }
      
      return false;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside 
        className={`
          relative bg-white h-full shadow-2xl border-r border-slate-100 z-50 no-print
          transition-all duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-10 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 border-2 border-slate-50"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Logo Area */}
        <div className={`flex items-center gap-3 p-6 h-24 border-b border-slate-50 transition-all ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0 overflow-hidden">
             {settings.schoolLogoUrl ? (
                 <img src={settings.schoolLogoUrl} alt="Logo" className="w-full h-full object-cover" />
             ) : (
                 <School className="text-white" size={24} />
             )}
          </div>
          
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
            <h1 className="font-black text-lg text-slate-800 leading-tight break-words" title={settings.schoolName}>
                {settings.schoolName}
            </h1>
          </div>
        </div>        

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onNavigate(item.id as ViewState)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative overflow-hidden group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                    }
                    ${!isSidebarOpen && 'justify-center'}
                  `}
                >
                  <item.icon size={22} className={`flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                  
                  <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'}`}>
                    {item.label}
                  </span>

                  {/* Active Indicator Dot (Only when collapsed) */}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>

                {/* Tooltip (Only visible when sidebar is collapsed) */}
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

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-50">
           <button 
              onClick={logout}
              className={`
              w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors
              ${!isSidebarOpen && 'justify-center'}
           `}>
              <LogOut size={20} />
              <span className={`font-bold text-sm whitespace-nowrap transition-all ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                  Logout
              </span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
             <div className="flex items-center gap-4 text-slate-400">
                <span className="text-sm font-medium">Academic Year: <b className="text-slate-800">2024-2025</b></span>
             </div>
             <div className="flex items-center gap-4">
                <button 
                    onClick={() => onNavigate('profile')}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition overflow-hidden"
                >
                    {currentUser?.photoUrl ? (
                         <img src={currentUser.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                        <UserCircle size={20} />
                    )}
                </button>
             </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
