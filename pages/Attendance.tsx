
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ScanFace, FileBarChart } from 'lucide-react';
import Scanner from './Scanner';
import Reports from './Reports';

const Attendance = () => {
  const { t } = useAppContext();
  const [activeTab, setActiveTab] = useState<'scan' | 'reports'>('scan');

  return (
    <div className="space-y-6">
        
        {/* MODULE HEADER & TABS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 no-print flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('attendance')}</h2>
                <p className="text-slate-500 text-sm">Track daily attendance and view reports</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={() => setActiveTab('scan')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'scan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ScanFace size={16}/> {t('scanner')}
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'reports' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileBarChart size={16}/> {t('analytics')}
                </button>
            </div>
        </div>

        {/* CONTENT */}
        <div className="animate-in fade-in duration-300">
            {activeTab === 'scan' ? <Scanner /> : <Reports />}
        </div>
    </div>
  );
};

export default Attendance;
