import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { useAppContext } from '../context/AppContext';
import { Student } from '../types';
import { Check, Plus, Trash2, QrCode, Printer, User, Book, Phone, Search, ChevronRight } from 'lucide-react';

const Registration = () => {
  const { addStudent, t, settings } = useAppContext();
  const [step, setStep] = useState<'details' | 'photos' | 'complete'>('details');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  
  // New Detailed Form Data
  const [studentInfo, setStudentInfo] = useState({
      firstName: '', lastName: '', id: '', dob: '', address: ''
  });
  const [academicInfo, setAcademicInfo] = useState({
      gradeLevel: '', section: '', classTeacher: ''
  });
  const [guardianInfo, setGuardianInfo] = useState({
      name: '', relation: '', phone: '', email: ''
  });

  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  
  // Auto-generate ID if empty
  const generateId = () => {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `${year}${rand}`;
  };

  const handleStartCapture = (e: React.FormEvent) => {
      e.preventDefault();
      if (!studentInfo.id) {
          setStudentInfo(prev => ({ ...prev, id: generateId() }));
      }
      setStep('photos');
  };

  const handlePhotoCaptured = (photo: string) => {
      const updated = [...capturedPhotos, photo];
      setCapturedPhotos(updated);
      
      if (updated.length >= 5) {
          finishRegistration(updated);
      }
  };

  const finishRegistration = (photos: string[]) => {
      const newStudent: Student = {
        id: studentInfo.id || generateId(),
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        dob: studentInfo.dob,
        address: studentInfo.address,
        gradeLevel: academicInfo.gradeLevel,
        section: academicInfo.section,
        classTeacher: academicInfo.classTeacher,
        guardian: {
            name: guardianInfo.name,
            relation: guardianInfo.relation,
            phone: guardianInfo.phone,
            email: guardianInfo.email
        },
        photos: photos
      };

      addStudent(newStudent);
      setStep('complete');
  };

  const handleReset = () => {
      setStep('details');
      setStudentInfo({ firstName: '', lastName: '', id: '', dob: '', address: '' });
      setAcademicInfo({ gradeLevel: '', section: '', classTeacher: '' });
      setGuardianInfo({ name: '', relation: '', phone: '', email: '' });
      setCapturedPhotos([]);
  };

  // Styles
  const sectionClass = "bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in space-y-6";
  const headerClass = "text-lg font-bold text-slate-800 flex items-center gap-3 mb-6 pb-3 border-b border-slate-100";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2 ml-1";
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center no-print sticky top-0 z-40">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('register')}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
                {step === 'details' && "Step 1: Enter Student Details"}
                {step === 'photos' && "Step 2: Capture Reference Photos"}
                {step === 'complete' && "Registration Complete"}
            </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <div className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${step === 'details' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>1. Info</div>
            <ChevronRight size={14} className="text-slate-300" />
            <div className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${step === 'photos' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>2. Photos</div>
            <ChevronRight size={14} className="text-slate-300" />
            <div className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${step === 'complete' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>3. Done</div>
        </div>
      </div>
      
      {/* Step 1: Details */}
      {step === 'details' && (
         <form onSubmit={handleStartCapture} className="space-y-6">
            
            {/* Personal Info */}
            <div className={sectionClass}>
                <h3 className={headerClass}>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><User size={18}/></div>
                    {t('personalInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>{t('firstName')}</label>
                        <input required placeholder="e.g. John" className={inputClass} value={studentInfo.firstName} onChange={e => setStudentInfo({...studentInfo, firstName: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>{t('lastName')}</label>
                        <input required placeholder="e.g. Doe" className={inputClass} value={studentInfo.lastName} onChange={e => setStudentInfo({...studentInfo, lastName: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>{t('studentId')} <span className="text-xs font-normal text-slate-400">(Optional - Auto Generated)</span></label>
                        <input placeholder="Auto-generated if empty" className={`${inputClass} font-mono`} value={studentInfo.id} onChange={e => setStudentInfo({...studentInfo, id: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input type="date" className={inputClass} value={studentInfo.dob} onChange={e => setStudentInfo({...studentInfo, dob: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                         <label className={labelClass}>{t('address')}</label>
                         <input placeholder="Full street address" className={inputClass} value={studentInfo.address} onChange={e => setStudentInfo({...studentInfo, address: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Academic Info */}
            <div className={sectionClass}>
                 <h3 className={headerClass}>
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><Book size={18}/></div>
                    {t('academicInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>{t('grade')}</label>
                        <select required className={inputClass} value={academicInfo.gradeLevel} onChange={e => setAcademicInfo({...academicInfo, gradeLevel: e.target.value})}>
                            <option value="">Select Grade</option>
                            {[9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>{t('section')}</label>
                        <select required className={inputClass} value={academicInfo.section} onChange={e => setAcademicInfo({...academicInfo, section: e.target.value})}>
                            <option value="">Select Section</option>
                            {['A','B','C','D','E'].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className={labelClass}>{t('teacher')}</label>
                        <input required placeholder="Class Teacher Name" className={inputClass} value={academicInfo.classTeacher} onChange={e => setAcademicInfo({...academicInfo, classTeacher: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Guardian Info */}
            <div className={sectionClass}>
                 <h3 className={headerClass}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><Phone size={18}/></div>
                    {t('guardianInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={labelClass}>{t('parentName')}</label>
                        <input required placeholder="Guardian Full Name" className={inputClass} value={guardianInfo.name} onChange={e => setGuardianInfo({...guardianInfo, name: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Relation</label>
                         <select required className={inputClass} value={guardianInfo.relation} onChange={e => setGuardianInfo({...guardianInfo, relation: e.target.value})}>
                            <option value="">Select Relation</option>
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Guardian">Guardian</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                     <div>
                        <label className={labelClass}>{t('phone')}</label>
                        <input required type="tel" placeholder="+1 (555) 000-0000" className={inputClass} value={guardianInfo.phone} onChange={e => setGuardianInfo({...guardianInfo, phone: e.target.value})} />
                    </div>
                     <div>
                        <label className={labelClass}>Email <span className="text-xs font-normal text-slate-400">(Optional)</span></label>
                        <input type="email" placeholder="guardian@email.com" className={inputClass} value={guardianInfo.email} onChange={e => setGuardianInfo({...guardianInfo, email: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 text-lg shadow-xl shadow-slate-900/10">
                    {t('capturePhotos')} <ChevronRight size={20} />
                </button>
            </div>
         </form>
      )}

      {/* Step 2: Photos */}
      {step === 'photos' && (
          <div className="flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-bottom-4 duration-500">
              
             {/* Top: Camera Area (Flex Grow) */}
<div className="flex-none min-h-0 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative ring-4 ring-slate-900/5 aspect-[4/3]">
    <WebcamCapture onCapture={handlePhotoCaptured} mode="registration" />

    {/* Overlay Progress */}
    <div className="absolute top-6 left-6 z-20 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium border border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Recording Face Data ({capturedPhotos.length}/5)
    </div>
</div>


              {/* Bottom: Gallery Strip (Fixed Height) */}
              <div className="h-32 mt-6 flex gap-4 overflow-x-auto pb-2 snap-x">
                  {/* Empty placeholders or filled photos */}
                  {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="relative group flex-shrink-0 aspect-[3/4] h-full snap-start"
                        onMouseEnter={() => capturedPhotos[i] && setActivePhotoIndex(i)}
                        onMouseLeave={() => setActivePhotoIndex(null)}
                      >
                          <div className={`w-full h-full rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all bg-white
                              ${capturedPhotos[i] 
                                  ? 'border-green-500 shadow-md' 
                                  : i === capturedPhotos.length 
                                      ? 'border-blue-500 border-dashed bg-blue-50' 
                                      : 'border-slate-200 border-dashed bg-slate-50'
                              }
                          `}>
                              {capturedPhotos[i] ? (
                                  <>
                                    <img src={capturedPhotos[i]} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                        <Search className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={20} />
                                    </div>
                                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5"><Check size={10} /></div>
                                  </>
                              ) : (
                                  <span className={`text-xl font-bold ${i === capturedPhotos.length ? 'text-blue-400' : 'text-slate-300'}`}>{i + 1}</span>
                              )}
                          </div>
                      </div>
                  ))}
                  <div className="flex-1 flex items-center justify-end px-4 text-sm text-slate-500">
                      <p>Capture 5 different angles for best results.</p>
                  </div>
              </div>

              {/* Magnify Pop-up */}
              {activePhotoIndex !== null && capturedPhotos[activePhotoIndex] && (
                  <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                      <div className="w-90 h-120 bg-white p-2 rounded-2xl shadow-2xl border-4 border-white transform scale-110 transition-all animate-in zoom-in duration-150">
                          <img src={capturedPhotos[activePhotoIndex]} className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute -bottom-10 left-0 right-0 text-center">
                              <span className="bg-black/75 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">Preview {activePhotoIndex + 1}</span>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Step 3: Complete & ID Card */}
      {step === 'complete' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center animate-in zoom-in duration-300 no-print max-w-2xl mx-auto mt-10">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Check size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
              <p className="text-slate-500 mb-8">The student profile has been created and biometric data secured.</p>
              
              {/* ID Card Display */}
              <div className="max-w-[350px] mx-auto my-8 print-only transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-900 shadow-2xl relative print:shadow-none print:border-2">
                      {/* Card Header */}
                      <div className="bg-slate-900 p-5 text-white flex gap-4 items-center">
                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                            <Book size={24} className="text-white"/>
                          </div>
                          <div className="text-left">
                              <h1 className="font-bold text-sm tracking-wide uppercase leading-tight opacity-90">{settings.schoolName}</h1>
                              <p className="text-[10px] text-blue-200 font-medium tracking-wider mt-0.5">STUDENT IDENTITY CARD</p>
                          </div>
                      </div>
                      
                      {/* Card Body */}
                      <div className="p-6 relative">
                          <div className="flex gap-4 mb-5">
                              <div className="w-24 h-32 rounded-lg bg-slate-200 overflow-hidden border border-slate-300 flex-shrink-0 shadow-inner">
                                  <img src={capturedPhotos[0]} alt="Profile" className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left space-y-2 pt-1">
                                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{studentInfo.firstName} <br/> {studentInfo.lastName}</h2>
                                  <div>
                                      <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider">Grade / Section</span>
                                      <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-sm">{academicInfo.gradeLevel} - {academicInfo.section}</span>
                                  </div>
                                  <div>
                                      <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider">Student ID</span>
                                      <span className="font-mono text-slate-800 text-sm">{studentInfo.id}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="flex justify-between items-end border-t pt-4 border-slate-100">
                             <div className="text-left text-[9px] text-slate-500 space-y-1.5 max-w-[160px]">
                                 <p className="flex items-start gap-1"><span className="font-bold text-slate-700">Contact:</span> {settings.contactPhone}</p>
                                 <p className="flex items-start gap-1"><span className="font-bold text-slate-700">Addr:</span> {settings.schoolAddress}</p>
                             </div>
                             <div className="bg-white p-1 rounded border border-slate-100">
                                  <QrCode size={56} className="text-slate-900" />
                             </div>
                          </div>
                      </div>
                      
                      {/* Footer Decoration */}
                      <div className="h-2 bg-gradient-to-r from-blue-600 to-slate-900 w-full"></div>
                  </div>
              </div>

              <div className="flex gap-4 justify-center no-print pt-4">
                  <button onClick={() => window.print()} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-all">
                      <Printer size={20} /> {t('printId')}
                  </button>
                  <button onClick={handleReset} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-2 transition-all">
                      <Plus size={20} /> Register Another
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Registration;