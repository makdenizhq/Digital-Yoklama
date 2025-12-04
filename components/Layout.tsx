import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, ScanLine, UserPlus, FileBarChart, School } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 h-auto md:h-screen sticky top-0 z-50 flex-shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
           <div className="bg-blue-600 p-2 rounded-lg text-white">
             <School size={24} />
           </div>
           <h1 className="text-xl font-bold tracking-tight text-slate-900">AttendAI</h1>
        </div>
        
        <nav className="p-4 space-y-1">
          <NavItem view="dashboard" current={currentView} label="Dashboard" icon={LayoutDashboard} onClick={onNavigate} />
          <NavItem view="scan" current={currentView} label="Scan Attendance" icon={ScanLine} onClick={onNavigate} />
          <NavItem view="register" current={currentView} label="Register Student" icon={UserPlus} onClick={onNavigate} />
          <NavItem view="reports" current={currentView} label="Reports" icon={FileBarChart} onClick={onNavigate} />
        </nav>

        <div className="hidden md:block absolute bottom-0 left-0 right-0 p-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">System Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-slate-700">Online & Syncing</span>
                </div>
            </div>
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
