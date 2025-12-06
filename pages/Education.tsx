
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookOpen, Award, TrendingUp, ScanLine, BarChart3, Calendar, Search, Plus, Save, X, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import WebcamCapture from '../components/WebcamCapture';
import { Grade } from '../types';

const Education = () => {
  const { t, grades, students, addGrade } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'schedule' | 'omr'>('overview');
  
  // Individual Tab State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [newGrade, setNewGrade] = useState<Partial<Grade>>({ subject: 'Math', type: 'written', term: '1' });

  // Schedule Tab State
  const [scheduleView, setScheduleView] = useState<'week' | 'today' | 'tomorrow'>('week');

  // OMR Tab State
  const [omrStudentId, setOmrStudentId] = useState<string>('');
  const [omrSubject, setOmrSubject] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<number | null>(null);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
      const classGroups: Record<string, number[]> = {};
      grades.forEach(g => {
          const s = students.find(stu => stu.id === g.studentId);
          if (s) {
              const key = `${s.gradeLevel}-${s.section}`;
              if (!classGroups[key]) classGroups[key] = [];
              classGroups[key].push(g.score);
          }
      });

      const classData = Object.keys(classGroups).map(key => ({
          name: key,
          average: Math.round(classGroups[key].reduce((a, b) => a + b, 0) / classGroups[key].length)
      })).sort((a,b) => b.average - a.average);

      const schoolAvg = classData.length ? Math.round(classData.reduce((a,b) => a + b.average, 0) / classData.length) : 0;

      return { classData, schoolAvg };
  }, [grades, students]);

  // --- INDIVIDUAL STATS ---
  const individualData = useMemo(() => {
      if (!selectedStudentId) return [];
      let studentGrades = grades.filter(g => g.studentId === selectedStudentId);
      
      if (selectedSubject !== 'All') {
          studentGrades = studentGrades.filter(g => g.subject === selectedSubject);
      }

      studentGrades.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return studentGrades.map((g, i) => ({
          name: selectedSubject === 'All' ? `${g.subject} ${i+1}` : `Exam ${i+1}`,
          score: g.score,
          subject: g.subject,
          type: g.type === 'trial_exam' ? t('trial_exam') : t('written')
      }));
  }, [selectedStudentId, grades, selectedSubject, t]);

  const uniqueSubjects = useMemo(() => {
      const subjs = new Set(grades.map(g => g.subject));
      return ['All', ...Array.from(subjs)];
  }, [grades]);

  const handleAddGrade = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentId && newGrade.score) {
          addGrade({
              id: Date.now().toString(),
              studentId: selectedStudentId,
              subject: newGrade.subject!,
              score: Number(newGrade.score),
              type: newGrade.type as any,
              date: new Date().toISOString(),
              term: newGrade.term as any
          });
          setShowAddGrade(false);
      }
  };

  // --- SCHEDULE LOGIC ---
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  
  // Mock Schedule Generator
  const getScheduleForDay = (dayIndex: number) => { // 1=Mon, 5=Fri
      if (dayIndex < 1 || dayIndex > 5) return []; // Weekend
      const dayName = days[dayIndex - 1];
      const subjects = ['Math', 'Physics', 'History', 'English', 'Biology', 'Chemistry', 'Art', 'PE'];
      // Rotate subjects based on day to make it look different
      const rotated = [...subjects.slice(dayIndex), ...subjects.slice(0, dayIndex)];
      return rotated.map((sub, i) => ({ period: i+1, subject: sub, teacher: `Teacher ${sub.charAt(0)}` }));
  };

  const currentSchedule = useMemo(() => {
      const today = new Date().getDay(); // 0=Sun, 1=Mon...
      let targetDay = today;
      if (scheduleView === 'tomorrow') targetDay = (today + 1) % 7;
      
      // If view is Week, we return array of arrays? No, static table better.
      // If Today/Tomorrow, we return single list.
      
      if (scheduleView === 'week') return null; // Handled separately
      
      return getScheduleForDay(targetDay);
  }, [scheduleView]);


  // --- OMR LOGIC ---
  const handleScanOMR = () => {
      setIsScanning(true);
      setScanResult(null);
      
      // Simulate Scanning Delay
      setTimeout(() => {
          const randomScore = Math.floor(Math.random() * 30) + 70; // 70-100
          setScanResult(randomScore);
          
          // Save Grade
          if (omrStudentId && omrSubject) {
              addGrade({
                  id: Date.now().toString(),
                  studentId: omrStudentId,
                  subject: omrSubject,
                  score: randomScore,
                  type: 'trial_exam',
                  date: new Date().toISOString(),
                  term: '1'
              });
          }
          setIsScanning(false);
      }, 3000);
  };

  return (
    <div className="space-y-6">
        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center no-print">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{t('education')}</h2>
                    <p className="text-xs text-slate-500">Academic performance & tools.</p>
                </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'overview' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('overview')}</button>
                <button onClick={() => setActiveTab('individual')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'individual' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('individual')}</button>
                <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'schedule' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('schedule')}</button>
                <button onClick={() => setActiveTab('omr')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'omr' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('omr')}</button>
            </div>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-500"/> {t('classAverage')} vs {t('schoolAverage')} ({stats.schoolAvg})
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.classData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis domain={[0, 100]} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="average" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                        <Award size={32} className="mb-2 opacity-80" />
                        <h3 className="text-lg font-bold mb-1">Top Performers</h3>
                        <p className="text-xs opacity-70 mb-4">Highest GPA this term</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>Alex Testuser</span> <b>98.5</b></li>
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>Sarah Smith</span> <b>97.2</b></li>
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>John Doe</span> <b>96.0</b></li>
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {/* TAB: INDIVIDUAL */}
        {activeTab === 'individual' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm h-fit">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Select Student</h4>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                        {students.map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => { setSelectedStudentId(s.id); setShowAddGrade(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${selectedStudentId === s.id ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                    {s.photos[0] && <img src={s.photos[0]} className="w-full h-full object-cover"/>}
                                </div>
                                {s.firstName} {s.lastName}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    {selectedStudentId ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    Performance History
                                    <select 
                                        value={selectedSubject} 
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="ml-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                                    >
                                        {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                    </select>
                                </h3>
                                <button onClick={() => setShowAddGrade(!showAddGrade)} className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition">
                                    <Plus size={14}/> Add New Score
                                </button>
                            </div>

                            {/* Add Grade Form */}
                            {showAddGrade && (
                                <form onSubmit={handleAddGrade} className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 grid grid-cols-5 gap-3 items-end animate-in slide-in-from-top duration-300">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">Subject</label>
                                        <input className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200" value={newGrade.subject} onChange={e => setNewGrade({...newGrade, subject: e.target.value})} placeholder="Math"/>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">Score</label>
                                        <input type="number" max="100" className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200" value={newGrade.score} onChange={e => setNewGrade({...newGrade, score: Number(e.target.value)})} placeholder="0-100"/>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">Type</label>
                                        <select className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200" value={newGrade.type} onChange={e => setNewGrade({...newGrade, type: e.target.value as any})}>
                                            <option value="written">Written</option>
                                            <option value="oral">Oral</option>
                                            <option value="project">Project</option>
                                            <option value="trial_exam">Trial</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex gap-2">
                                        <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700"><Save size={16} className="mx-auto"/></button>
                                        <button type="button" onClick={() => setShowAddGrade(false)} className="flex-1 bg-white text-purple-600 border border-purple-200 py-2 rounded-lg font-bold hover:bg-purple-50"><X size={16} className="mx-auto"/></button>
                                    </div>
                                </form>
                            )}

                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={individualData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} name="Score" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Search size={48} className="mb-4 opacity-20"/>
                            <p>Select a student to view detailed analytics</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* TAB: SCHEDULE */}
        {activeTab === 'schedule' && (
            <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-center bg-white p-1 rounded-xl w-fit mx-auto border border-slate-100 shadow-sm">
                    <button onClick={() => setScheduleView('week')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${scheduleView === 'week' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-purple-600'}`}>Week</button>
                    <button onClick={() => setScheduleView('today')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${scheduleView === 'today' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-purple-600'}`}>Today</button>
                    <button onClick={() => setScheduleView('tomorrow')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${scheduleView === 'tomorrow' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-purple-600'}`}>Tomorrow</button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    {scheduleView === 'week' ? (
                        <table className="w-full text-center text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 border border-slate-100 bg-slate-50 text-slate-500 font-bold">Time</th>
                                    {days.map(d => <th key={d} className="p-3 border border-slate-100 bg-slate-50 text-slate-700 font-bold">{d}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map(period => (
                                    <tr key={period}>
                                        <td className="p-3 border border-slate-100 font-mono text-xs text-slate-400">Period {period}</td>
                                        {['Math', 'Physics', 'History', 'English', 'Biology'].map((subj, i) => (
                                            <td key={i} className="p-3 border border-slate-100 hover:bg-blue-50 transition cursor-pointer">
                                                <div className="font-bold text-slate-700">{subj}</div>
                                                <div className="text-[10px] text-slate-400">Rm 10{i}</div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        // Daily View
                        <div className="max-w-2xl mx-auto">
                            {currentSchedule && currentSchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {currentSchedule.map(item => (
                                        <div key={item.period} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-purple-200 transition bg-slate-50">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">{item.period}</div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-lg">{item.subject}</h4>
                                                <p className="text-slate-500 text-sm">{item.teacher}</p>
                                            </div>
                                            <div className="text-right text-xs font-mono text-slate-400">
                                                {9 + item.period - 1}:00 - {9 + item.period}:00
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <Calendar size={48} className="mx-auto mb-4 opacity-20"/>
                                    <p>No classes scheduled for this day.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* TAB: OMR */}
        {activeTab === 'omr' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ScanLine size={18}/> OMR Setup</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student</label>
                                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={omrStudentId} onChange={e => setOmrStudentId(e.target.value)}>
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lesson / Subject</label>
                                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={omrSubject} onChange={e => setOmrSubject(e.target.value)}>
                                    <option value="">Select Subject</option>
                                    {['Math', 'Physics', 'Chemistry', 'Biology', 'History', 'English'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                        <ScanLine size={48} className={`mb-4 transition-colors ${isScanning ? 'text-purple-500 animate-pulse' : 'text-slate-300'}`}/>
                        <h3 className="text-lg font-bold text-slate-800">Optical Mark Recognition</h3>
                        <p className="text-sm text-slate-500 max-w-xs my-4">
                            Align the answer sheet within the frame. The system will auto-grade.
                        </p>
                        
                        {scanResult !== null ? (
                            <div className="bg-green-100 text-green-800 px-6 py-4 rounded-xl border border-green-200 animate-in zoom-in">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1">Grading Complete</p>
                                <p className="text-3xl font-black">{scanResult} / 100</p>
                                <p className="text-[10px] mt-2">Saved to {omrSubject}</p>
                            </div>
                        ) : (
                            <button 
                                onClick={handleScanOMR} 
                                disabled={!omrStudentId || !omrSubject || isScanning}
                                className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${(!omrStudentId || !omrSubject) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                            >
                                {isScanning ? 'Scanning...' : 'Scan Paper'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video relative border-4 border-slate-900">
                    <WebcamCapture onCapture={() => {}} mode="simple" className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[80%] h-[80%] border-2 border-purple-500/50 rounded-lg flex items-center justify-center">
                            <div className="w-full h-px bg-red-500/50 absolute top-1/2"></div>
                            <div className="h-full w-px bg-red-500/50 absolute left-1/2"></div>
                        </div>
                        <div className="absolute bottom-4 bg-black/60 text-white px-4 py-1 rounded-full text-xs backdrop-blur-md">
                            Camera Feed
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Education;
