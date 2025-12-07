
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookOpen, Award, TrendingUp, ScanLine, BarChart3, Calendar, Search, Plus, Save, X, User, Edit, Upload, FileText, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import WebcamCapture from '../components/WebcamCapture';
import { Grade } from '../types';
import ImageUploader from '../components/ImageUploader';

const Education = () => {
  const { t, grades, students, addGrade, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'schedule' | 'omr'>('schedule');
  
  // Class Filter
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Individual Tab State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [newGrade, setNewGrade] = useState<Partial<Grade>>({ subject: '', type: 'written', term: '1' });

  // Schedule Tab State
  const [scheduleView, setScheduleView] = useState<'week' | 'today' | 'tomorrow'>('week');
  const [editingTopic, setEditingTopic] = useState<{period: number, day?: string, currentTopic: string} | null>(null);

  // OMR Tab State
  const [omrStudentId, setOmrStudentId] = useState<string>('');
  const [omrSubject, setOmrSubject] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<number | null>(null);
  const [uploadedPaper, setUploadedPaper] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students based on selection
  const filteredStudents = useMemo(() => {
      return students.filter(s => {
          if (selectedGrade !== 'all' && s.gradeLevel !== selectedGrade) return false;
          if (selectedSection !== 'all' && s.section !== selectedSection) return false;
          return true;
      });
  }, [students, selectedGrade, selectedSection]);

  // Get available subjects for the selected student/grade
  const availableSubjects = useMemo(() => {
      if (selectedStudentId) {
          const student = students.find(s => s.id === selectedStudentId);
          if (student && settings.lessons?.[student.gradeLevel]) {
              return settings.lessons[student.gradeLevel];
          }
      }
      // Fallback or generic list if no specific student is selected (e.g. for OMR filter)
      if (selectedGrade !== 'all' && settings.lessons?.[selectedGrade]) {
          return settings.lessons[selectedGrade];
      }
      return ['Math', 'Physics', 'History', 'English', 'Biology', 'Chemistry'];
  }, [selectedStudentId, selectedGrade, students, settings.lessons]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
      const classGroups: Record<string, number[]> = {};
      grades.forEach(g => {
          const s = students.find(stu => stu.id === g.studentId);
          if (s) {
              // Apply filters
              if (selectedGrade !== 'all' && s.gradeLevel !== selectedGrade) return;
              if (selectedSection !== 'all' && s.section !== selectedSection) return;

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
  }, [grades, students, selectedGrade, selectedSection]);

  // --- TOP PERFORMERS ---
  const topPerformers = useMemo(() => {
      const studentAvgs = filteredStudents.map(student => {
          const sGrades = grades.filter(g => g.studentId === student.id);
          if (sGrades.length === 0) return null;
          const avg = sGrades.reduce((a, b) => a + b.score, 0) / sGrades.length;
          return {
              id: student.id,
              name: `${student.firstName} ${student.lastName}`,
              avg: avg,
              count: sGrades.length
          };
      }).filter(Boolean) as {id: string, name: string, avg: number, count: number}[];

      return studentAvgs.sort((a, b) => b.avg - a.avg).slice(0, 5);
  }, [filteredStudents, grades]);

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
      // Subjects the student has taken exams in
      const subjs = new Set(grades.filter(g => g.studentId === selectedStudentId).map(g => g.subject));
      return ['All', ...Array.from(subjs)];
  }, [grades, selectedStudentId]);

  const handleAddGrade = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentId && newGrade.score && newGrade.subject) {
          addGrade({
              id: Date.now().toString(),
              studentId: selectedStudentId,
              subject: newGrade.subject,
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
  
  const getScheduleForDay = (dayIndex: number) => { 
      if (dayIndex < 1 || dayIndex > 5) return []; 
      
      // Use subjects defined in settings for the selected grade, or fallbacks
      const subjects = selectedGrade !== 'all' && settings.lessons?.[selectedGrade] 
          ? settings.lessons[selectedGrade] 
          : ['Math', 'Physics', 'History', 'English', 'Biology', 'Chemistry'];
          
      // Simple rotation logic for demo purposes
      const rotated = [...subjects.slice(dayIndex % subjects.length), ...subjects.slice(0, dayIndex % subjects.length)];
      
      return rotated.slice(0, 8).map((sub, i) => ({ 
          period: i+1, 
          subject: sub, 
          teacher: `Teacher ${sub.charAt(0)}`,
          topic: `Unit ${dayIndex}.${i+1}: Introduction to ${sub}` 
      }));
  };

  const currentSchedule = useMemo(() => {
      const today = new Date().getDay(); 
      let targetDay = today;
      if (scheduleView === 'tomorrow') targetDay = (today + 1) % 7;
      if (scheduleView === 'week') return null; 
      
      return getScheduleForDay(targetDay);
  }, [scheduleView, selectedGrade, settings.lessons]);

  // --- OMR LOGIC ---
  const handleScanOMR = () => {
      setIsScanning(true);
      setScanResult(null);
      
      setTimeout(() => {
          const randomScore = Math.floor(Math.random() * 30) + 70; 
          setScanResult(randomScore);
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
          setUploadedPaper(null);
      }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUploadedPaper(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="space-y-6">
        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center no-print">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{t('education')}</h2>
                    <p className="text-xs text-slate-500">Academic performance & tools.</p>
                </div>
            </div>
            
            {/* Global Class Filter */}
            <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 px-2 text-slate-400">
                    <Filter size={14}/>
                    <span className="text-xs font-bold uppercase">Class:</span>
                </div>
                <select 
                    value={selectedGrade} 
                    onChange={e => { setSelectedGrade(e.target.value); setSelectedStudentId(''); }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                >
                    <option value="all">All Grades</option>
                    {['9', '10', '11', '12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
                <select 
                    value={selectedSection} 
                    onChange={e => { setSelectedSection(e.target.value); setSelectedStudentId(''); }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                >
                    <option value="all">All Sections</option>
                    {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('schedule')}</button>
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('overview')}</button>
                <button onClick={() => setActiveTab('individual')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeTab === 'individual' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('individual')}</button>
                <button onClick={() => setActiveTab('omr')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeTab === 'omr' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>{t('omr')}</button>
            </div>
        </div>

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
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                                    <tr key={period}>
                                        <td className="p-3 border border-slate-100 font-mono text-xs text-slate-400">Period {period}</td>
                                        {[1, 2, 3, 4, 5].map((dayIdx) => {
                                            const subjs = availableSubjects;
                                            // Simple pseudo-random subject assignment for visualization
                                            const subj = subjs.length > 0 ? subjs[(period + dayIdx) % subjs.length] : 'N/A';
                                            return (
                                                <td key={dayIdx} onClick={() => setEditingTopic({period, currentTopic: "Sample Topic"})} className="p-3 border border-slate-100 hover:bg-purple-50 transition cursor-pointer group relative">
                                                    <div className="font-bold text-slate-700">{subj}</div>
                                                    <div className="text-[10px] text-slate-400">Rm 10{dayIdx}</div>
                                                    <div className="hidden group-hover:block absolute top-1 right-1"><Edit size={10} className="text-purple-400"/></div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {currentSchedule && currentSchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {currentSchedule.map(item => (
                                        <div key={item.period} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-purple-200 transition bg-slate-50 group">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">{item.period}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-900 text-lg">{item.subject}</h4>
                                                    <div className="text-right text-xs font-mono text-slate-400">
                                                        {9 + item.period - 1}:00 - {9 + item.period}:00
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-xs mb-1">{item.teacher}</p>
                                                <div onClick={() => setEditingTopic({period: item.period, currentTopic: item.topic || ''})} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition border border-transparent hover:border-slate-200">
                                                    <span className="text-sm font-medium text-slate-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Topic: {item.topic}</span>
                                                    <Edit size={12} className="text-slate-400 opacity-0 group-hover:opacity-100"/>
                                                </div>
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

        {/* Edit Topic Modal */}
        {editingTopic && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                    <h3 className="font-bold text-lg mb-4">Edit Lesson Topic</h3>
                    <p className="text-xs text-slate-500 mb-2">Period {editingTopic.period}</p>
                    <textarea 
                        className="w-full border border-slate-200 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-purple-500 outline-none"
                        value={editingTopic.currentTopic}
                        onChange={(e) => setEditingTopic({...editingTopic, currentTopic: e.target.value})}
                    />
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => setEditingTopic(null)} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                        <button onClick={() => { /* Save Logic here */ setEditingTopic(null); }} className="flex-1 bg-purple-600 py-2 rounded-lg font-bold text-white hover:bg-purple-700">Save Topic</button>
                    </div>
                </div>
            </div>
        )}

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
                        <p className="text-xs opacity-70 mb-4">Highest Average Score</p>
                        
                        <div className="space-y-2 text-sm">
                            {topPerformers.length > 0 ? topPerformers.map((s, i) => (
                                <div key={s.id} className="flex justify-between border-b border-white/20 pb-1 last:border-0">
                                    <span className="flex items-center gap-2"><span className="text-xs opacity-60 w-4">{i+1}.</span> {s.name}</span> 
                                    <b>{s.avg.toFixed(1)}</b>
                                </div>
                            )) : (
                                <p className="text-xs text-white/50 text-center">No grade data available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* TAB: INDIVIDUAL */}
        {activeTab === 'individual' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm h-fit">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Select Student</h4>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {filteredStudents.length > 0 ? filteredStudents.map(s => (
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
                        )) : (
                            <p className="text-xs text-slate-400 text-center py-4">No students match filter.</p>
                        )}
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
                                        <select 
                                            className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200" 
                                            value={newGrade.subject} 
                                            onChange={e => setNewGrade({...newGrade, subject: e.target.value})}
                                        >
                                            <option value="">Select Subject</option>
                                            {availableSubjects.map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
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
                                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lesson / Subject</label>
                                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={omrSubject} onChange={e => setOmrSubject(e.target.value)}>
                                    <option value="">Select Subject</option>
                                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                        <ScanLine size={48} className={`mb-4 transition-colors ${isScanning ? 'text-purple-500 animate-pulse' : 'text-slate-300'}`}/>
                        <h3 className="text-lg font-bold text-slate-800">Optical Mark Recognition</h3>
                        <p className="text-sm text-slate-500 max-w-xs my-4">
                            Align the answer sheet within the frame or upload an image. The system will auto-grade using AI.
                        </p>
                        
                        {scanResult !== null ? (
                            <div className="bg-green-100 text-green-800 px-6 py-4 rounded-xl border border-green-200 animate-in zoom-in">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1">Grading Complete</p>
                                <p className="text-3xl font-black">{scanResult} / 100</p>
                                <p className="text-[10px] mt-2">Saved to {omrSubject}</p>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleScanOMR} 
                                    disabled={(!omrStudentId || !omrSubject || isScanning) && !uploadedPaper}
                                    className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${(!omrStudentId || !omrSubject) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                >
                                    {isScanning ? 'Analyzing...' : (uploadedPaper ? 'Analyze Upload' : 'Scan Camera')}
                                </button>
                                
                                <div className="relative">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition flex items-center gap-2"
                                    >
                                        <Upload size={18}/>
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*,application/pdf"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                        )}
                        {uploadedPaper && !isScanning && scanResult === null && (
                            <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1"><FileText size={12}/> File Ready</p>
                        )}
                    </div>
                </div>

                <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-[3/4] relative border-4 border-slate-900 mx-auto w-full max-w-sm">
                    {uploadedPaper ? (
                        <div className="w-full h-full relative">
                            <img src={uploadedPaper} className="w-full h-full object-contain bg-slate-900" />
                            <button onClick={() => setUploadedPaper(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><X size={16}/></button>
                        </div>
                    ) : (
                        <WebcamCapture onCapture={() => {}} mode="simple" className="w-full h-full object-cover"/>
                    )}
                    
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[85%] h-[90%] border-2 border-purple-500/50 rounded-lg flex items-center justify-center">
                            {!uploadedPaper && <div className="w-full h-px bg-red-500/30 absolute top-1/2"></div>}
                        </div>
                        <div className="absolute bottom-4 bg-black/60 text-white px-4 py-1 rounded-full text-xs backdrop-blur-md">
                            {uploadedPaper ? 'File Preview' : 'Camera Feed'}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Education;
