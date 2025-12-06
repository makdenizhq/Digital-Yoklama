
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ScanFace, Monitor, ExternalLink } from 'lucide-react';
import Scanner from './Scanner';
import Reports from './Reports';

const Attendance = () => {
  const { t } = useAppContext();
  const [showScanner, setShowScanner] = useState(false);

  const handleProjection = () => {
      // Calculate position for the second screen (assuming extended display to the right)
      const left = window.screen.availWidth;
      const width = window.screen.availWidth;
      const height = window.screen.availHeight;
      
      window.open(
          window.location.origin + '?mode=projection',
          'ScannerProjection',
          `width=${width},height=${height},left=${left},top=0,menubar=no,toolbar=no,location=no,status=no`
      );
  };

  return (
    <div className="space-y-6 relative">
        
        {/* MODULE HEADER */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 no-print flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('attendance')}</h2>
                <p className="text-slate-500 text-sm">Track daily attendance and view reports</p>
            </div>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={handleProjection}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition border border-slate-200"
                    title="Open Scanner on 2nd Monitor"
                >
                    <Monitor size={18}/> <span className="hidden sm:inline">Project Screen</span> <ExternalLink size={14} className="opacity-50"/>
                </button>
                <button 
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition"
                >
                    <ScanFace size={18}/> {t('scanner')}
                </button>
            </div>
        </div>

        {/* DEFAULT CONTENT (Reports) */}
        <div className="animate-in fade-in duration-300">
            <Reports />
        </div>

        {/* SCANNER MODAL (Full Screen Overlay) */}
        {showScanner && (
            <Scanner onExit={() => setShowScanner(false)} />
        )}
    </div>
  );
};

export default Attendance;
