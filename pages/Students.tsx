
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Student } from '../types';
import { Search, Edit, Trash2, Archive, RefreshCcw, Save, X, User as UserIcon, Printer, List, UserPlus, Download, ChevronDown, FileText, FileDown } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import Registration from './Registration';
import { exportToPdf, exportToWord } from '../services/exportService';

const Students = () => {
  const { students, updateStudent, deleteStudent, restoreStudent, deleteStudentPermanently, t } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
        // 1. Archive Status
        if (viewMode === 'active' && s.isArchived) return false;
        if (viewMode === 'archived' && !s.isArchived) return false;

        // 2. Search (Name or ID)
        const searchLower = search.toLowerCase();
        const matchesSearch = 
            s.firstName.toLowerCase().includes(searchLower) ||
            s.lastName.toLowerCase().includes(searchLower) ||
            s.id.toLowerCase().includes(searchLower);
        
        // 3. Grade Filter
        const matchesGrade = gradeFilter === 'all' || s.gradeLevel === gradeFilter;

        // 4. Section Filter
        const matchesSection = sectionFilter === 'all' || s.section === sectionFilter;

        return matchesSearch && matchesGrade && matchesSection;
    });
  }, [students, viewMode, search, gradeFilter, sectionFilter]);

  // Unique Grades/Sections for Dropdowns
  const grades = Array.from(new Set(students.map(s => s.gradeLevel))).sort();
  const sections = Array.from(new Set(students.map(s => s.section))).sort();

  const handleEdit = (student: Student) => {
      setEditingStudent({ ...student });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingStudent) {
          updateStudent(editingStudent);
          setEditingStudent(null);
      }
  };

  const handlePrint = (e: React.MouseEvent) => {
      e.preventDefault();
      setTimeout(() => window.print(), 100);
  };

  const handleDownload = (type: 'pdf' | 'word') => {
      const fileName = `Student_List_${gradeFilter}_${new Date().toISOString().split('T')[0]}`;
      if (type === 'pdf') {
          exportToPdf('students-list-content', fileName);
      } else {
          exportToWord('students-list-content', fileName);
      }
      setShowDownloadMenu(false);
  };

  return (
    <div className="space-y-6">
      
      {/* MODULE HEADER & TABS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 no-print flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('students')}</h2>
              <p className="text-slate-500 text-sm">Manage student records and registrations</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <List size={16}/> {t('studentList')}
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <UserPlus size={16}/> {t('newRegistration')}
              </button>
          </div>
      </div>

      {/* --- TAB CONTENT --- */}
      
      {activeTab === 'register' && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
              <Registration />
          </div>
      )}

      {activeTab === 'list' && (
      <div className="animate-in fade-in slide-in-from-left duration-300 space-y-6">
        {/* FILTERS & ACTIONS */}
        <div className="flex flex-col md:flex-row gap-3 no-print items-center">
            
            {/* Search */}
            <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    placeholder={t('search')} 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto">
                <select 
                    value={gradeFilter} 
                    onChange={e => setGradeFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none flex-1 md:flex-none"
                >
                    <option value="all">All Grades</option>
                    {grades.map(g => <option key={g} value={g}>{t('grade')} {g}</option>)}
                </select>

                <select 
                    value={sectionFilter} 
                    onChange={e => setSectionFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none flex-1 md:flex-none"
                >
                    <option value="all">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>{t('section')} {s}</option>)}
                </select>
            </div>

            {/* Mode Toggles */}
            <div className="flex gap-2">
                <div className="relative">
                    <button 
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                    >
                        <Download size={16} /> Download <ChevronDown size={14}/>
                    </button>
                    {showDownloadMenu && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                            <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                <FileText size={16} className="text-red-500"/> PDF
                            </button>
                            <button onClick={() => handleDownload('word')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                <FileDown size={16} className="text-blue-500"/> Word
                            </button>
                        </div>
                    )}
                </div>
                <button 
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                >
                    <Printer size={16} /> Print
                </button>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        {t('active')}
                    </button>
                    <button 
                        onClick={() => setViewMode('archived')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'archived' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        {t('archived')}
                    </button>
                </div>
            </div>
        </div>

        {/* PRINT HEADER (Visible only when printing) */}
        <div className="hidden print:block mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Student List</h1>
            <p className="text-sm text-slate-500">
                Grade: {gradeFilter === 'all' ? 'All' : gradeFilter} • Section: {sectionFilter === 'all' ? 'All' : sectionFilter}
            </p>
            <p className="text-xs text-slate-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* TABLE */}
        <div id="students-list-content" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">{t('students')}</th>
                            <th className="px-6 py-4">{t('studentId')}</th>
                            <th className="px-6 py-4">{t('grade')}</th>
                            <th className="px-6 py-4">{t('guardianInfo')}</th>
                            <th className="px-6 py-4 text-right no-print">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">{t('noRecords')}</td></tr>
                        ) : (
                            filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50/80 transition group print:break-inside-avoid">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-white shadow-sm flex-shrink-0 print:hidden">
                                                {student.photos?.[0] ? (
                                                    <img src={student.photos[0]} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-full h-full p-2 text-slate-400"/>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                                                <p className="text-xs text-slate-500">{student.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-slate-600 font-medium">{student.id}</td>
                                    <td className="px-6 py-3">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100 print:bg-white print:border print:border-slate-300">
                                            {student.gradeLevel}-{student.section}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        <p className="text-xs font-bold">{student.guardian.name}</p>
                                        <p className="text-[10px] opacity-70">{student.guardian.phone}</p>
                                    </td>
                                    <td className="px-6 py-3 text-right no-print">
                                        <div className="flex justify-end gap-2">
                                            {viewMode === 'active' ? (
                                                <>
                                                    <button onClick={() => handleEdit(student)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('edit')}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => deleteStudent(student.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title={t('archive')}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => restoreStudent(student.id)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title={t('restore')}>
                                                        <RefreshCcw size={16} />
                                                    </button>
                                                    <button onClick={() => {
                                                        if(confirm("Are you sure? This cannot be undone.")) deleteStudentPermanently(student.id);
                                                    }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title={t('delete')}>
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
      )}

      {/* EDIT MODAL */}
      {editingStudent && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                      <h3 className="font-bold text-lg text-slate-800">{t('edit')} {t('students')}</h3>
                      <button onClick={() => setEditingStudent(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <form id="edit-form" onSubmit={handleSaveEdit} className="space-y-6">
                          
                          {/* Photo Upload */}
                          <div className="flex justify-center">
                              <ImageUploader 
                                label={t('profile')}
                                image={editingStudent.photos?.[0]}
                                onImageChange={(base64) => {
                                    const newPhotos = [...editingStudent.photos];
                                    newPhotos[0] = base64; // Update primary photo
                                    setEditingStudent({ ...editingStudent, photos: newPhotos });
                                }}
                                onRemove={() => {
                                    const newPhotos = [...editingStudent.photos];
                                    newPhotos.splice(0, 1);
                                    setEditingStudent({ ...editingStudent, photos: newPhotos });
                                }}
                                isCircular={false}
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('firstName')}</label>
                                  <input required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingStudent.firstName} onChange={e => setEditingStudent({...editingStudent, firstName: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('lastName')}</label>
                                  <input required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingStudent.lastName} onChange={e => setEditingStudent({...editingStudent, lastName: e.target.value})} />
                              </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                               <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('grade')}</label>
                                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingStudent.gradeLevel} onChange={e => setEditingStudent({...editingStudent, gradeLevel: e.target.value})}>
                                      {[9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('section')}</label>
                                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingStudent.section} onChange={e => setEditingStudent({...editingStudent, section: e.target.value})}>
                                      {['A','B','C','D','E'].map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('gender')}</label>
                                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingStudent.gender} onChange={e => setEditingStudent({...editingStudent, gender: e.target.value as any})}>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                  </select>
                              </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-100">
                              <h4 className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200 pb-2">{t('guardianInfo')}</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('firstName')}</label>
                                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingStudent.guardian.name} onChange={e => setEditingStudent({...editingStudent, guardian: {...editingStudent.guardian, name: e.target.value}})} />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('phone')}</label>
                                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingStudent.guardian.phone} onChange={e => setEditingStudent({...editingStudent, guardian: {...editingStudent.guardian, phone: e.target.value}})} />
                                  </div>
                              </div>
                          </div>

                      </form>
                  </div>

                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                      <button onClick={() => setEditingStudent(null)} className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg transition text-sm">{t('cancel')}</button>
                      <button form="edit-form" type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2">
                          <Save size={16}/> {t('save')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Students;
