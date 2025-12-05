import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { useAppContext } from '../context/AppContext';
import { Student } from '../types';
import { Check, Plus, Printer, User, Book, Phone, Search, Wand2, X, Camera, QrCode } from 'lucide-react';

const Registration = () => {
  const { addStudent, t, settings, generateStudentId } = useAppContext();
  const [step, setStep] = useState<'details' | 'complete'>('details');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  
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
  
  const handleFillTestData = () => {
      setStudentInfo({
          firstName: "Alex",
          lastName: "Testuser",
          id: generateStudentId('10'), // Use generator
          dob: "2008-05-15",
          address: "123 Demo St"
      });
      setAcademicInfo({
          gradeLevel: "10",
          section: "A",
          classTeacher: "Mrs. Johnson"
      });
      setGuardianInfo({
          name: "Sarah Testuser",
          relation: "Mother",
          phone: "+1 (555) 123-4567",
          email: "sarah@test.com"
      });
  };

  const handleStartCapture = (e: React.FormEvent) => {
      e.preventDefault();
      // Generate ID if empty
      if (!studentInfo.id) {
          setStudentInfo(prev => ({ ...prev, id: generateStudentId(academicInfo.gradeLevel) }));
      }
      setShowCameraModal(true);
  };

  const handlePhotoCaptured = (photo: string) => {
      const updated = [...capturedPhotos, photo];
      setCapturedPhotos(updated);
      
      if (updated.length >= 5) {
          setTimeout(() => {
              setShowCameraModal(false);
              finishRegistration(updated);
          }, 500);
      }
  };

  const finishRegistration = (photos: string[]) => {
      const newStudent: Student = {
        id: studentInfo.id || generateStudentId(),
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
  const sectionClass = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4";
  const headerClass = "text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50";
  const labelClass = "block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase";
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-sm";

  return (
    <div className="space-y-6 relative max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 no-print">
        <div>
            <h2 className="text-2xl font-black text-slate-900">{t('register')}</h2>
            <p className="text-slate-500 font-medium">Add new student to the system</p>
        </div>
        {step === 'details' && (
            <button type="button" onClick={handleFillTestData} className="text-xs bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2 font-bold shadow-sm">
                <Wand2 size={14}/> Fill Test Data
            </button>
        )}
      </div>
      
      {/* Step 1: Details */}
      {step === 'details' && (
         <form onSubmit={handleStartCapture} className="space-y-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className={sectionClass}>
                    <h3 className={headerClass}>
                        <User size={20} className="text-blue-500"/> {t('personalInfo')}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('firstName')}</label>
                                <input required placeholder="Name" className={inputClass} value={studentInfo.firstName} onChange={e => setStudentInfo({...studentInfo, firstName: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClass}>{t('lastName')}</label>
                                <input required placeholder="Surname" className={inputClass} value={studentInfo.lastName} onChange={e => setStudentInfo({...studentInfo, lastName: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Date of Birth</label>
                            <input type="date" className={inputClass} value={studentInfo.dob} onChange={e => setStudentInfo({...studentInfo, dob: e.target.value})} />
                        </div>
                         <div>
                            <label className={labelClass}>Address</label>
                            <input placeholder="Full Address" className={inputClass} value={studentInfo.address} onChange={e => setStudentInfo({...studentInfo, address: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Academic Info */}
                <div className={sectionClass}>
                    <h3 className={headerClass}>
                        <Book size={20} className="text-purple-500"/> {t('academicInfo')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('grade')}</label>
                            <select required className={inputClass} value={academicInfo.gradeLevel} onChange={e => setAcademicInfo({...academicInfo, gradeLevel: e.target.value})}>
                                <option value="">Select</option>
                                {[9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>{t('section')}</label>
                            <select required className={inputClass} value={academicInfo.section} onChange={e => setAcademicInfo({...academicInfo, section: e.target.value})}>
                                <option value="">Select</option>
                                {['A','B','C','D','E'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>{t('teacher')}</label>
                        <input required placeholder="Class Teacher Name" className={inputClass} value={academicInfo.classTeacher} onChange={e => setAcademicInfo({...academicInfo, classTeacher: e.target.value})} />
                    </div>
                </div>

                 {/* Guardian Info */}
                 <div className={`${sectionClass} md:col-span-2`}>
                    <h3 className={headerClass}>
                        <Phone size={20} className="text-green-500"/> {t('guardianInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>{t('parentName')}</label>
                            <input required placeholder="Guardian Name" className={inputClass} value={guardianInfo.name} onChange={e => setGuardianInfo({...guardianInfo, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Relation</label>
                                <select required className={inputClass} value={guardianInfo.relation} onChange={e => setGuardianInfo({...guardianInfo, relation: e.target.value})}>
                                    <option value="">Select</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Relative">Relative</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>{t('phone')}</label>
                                <input required placeholder="Phone Number" className={inputClass} value={guardianInfo.phone} onChange={e => setGuardianInfo({...guardianInfo, phone: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-3 text-lg shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                    <Camera size={24} /> Start Photo Capture
                </button>
            </div>
         </form>
      )}

      {/* CAMERA POPUP */}
      {showCameraModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="bg-black w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative">
                 <div className="flex justify-between items-center p-6 text-white bg-slate-900/50 z-50 flex-shrink-0 backdrop-blur-sm border-b border-white/5">
                     <h2 className="text-xl font-bold flex items-center gap-3"><Camera className="text-green-400" size={24} /> Capture Reference Photos ({capturedPhotos.length}/5)</h2>
                     <button onClick={() => setShowCameraModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
                 </div>
                 
                 <div className="flex-1 min-h-0 relative flex items-center justify-center bg-black p-4">
                    <div className="relative w-full h-full max-w-2xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                        <WebcamCapture onCapture={handlePhotoCaptured} mode="registration" className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-0 right-0 text-center pointer-events-none z-40">
                            <p className="inline-block bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-lg font-medium border border-white/10 shadow-lg">
                                {capturedPhotos.length < 5 ? "Align face in the oval. Hold still." : "All photos captured!"}
                            </p>
                        </div>
                    </div>
                    {/* LARGE MAGNIFY POPUP (320x426) */}
                    {activePhotoIndex !== null && capturedPhotos[activePhotoIndex] && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm">
                            <div className="bg-white p-3 rounded-3xl shadow-2xl animate-in zoom-in duration-200">
                                <img src={capturedPhotos[activePhotoIndex]} className="w-[320px] h-[426px] object-cover rounded-2xl shadow-inner" alt="Preview"/>
                            </div>
                        </div>
                    )}
                 </div>

                 <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex-shrink-0">
                     <div className="h-32 flex gap-4 overflow-x-auto pb-2 snap-x items-center justify-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="relative group flex-shrink-0 aspect-[3/4] h-full snap-start cursor-pointer transition-transform hover:scale-105"
                                onMouseEnter={() => capturedPhotos[i] && setActivePhotoIndex(i)}
                                onMouseLeave={() => setActivePhotoIndex(null)}
                            >
                                <div className={`w-full h-full rounded-xl border-2 flex items-center justify-center overflow-hidden bg-white
                                    ${capturedPhotos[i] ? 'border-green-500 shadow-lg shadow-green-900/20' : 'border-slate-800 border-dashed bg-slate-900/50'}`}>
                                    {capturedPhotos[i] ? (
                                        <>
                                            <img src={capturedPhotos[i]} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <Search className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={24} />
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-700">{i + 1}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
          </div>
      )}

      {/* Step 3: Complete & ID Card */}
      {step === 'complete' && (
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center animate-in zoom-in duration-300 no-print max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Check size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Registration Complete!</h2>
              <p className="text-slate-500 mb-10">The student has been successfully added to the system.</p>
              
              {/* PRINT ONLY CONTAINER - VISIBLE ONLY WHEN PRINTING */}
              <div className="print-only hidden flex-col items-center justify-center bg-white p-0">
                  
                  {/* FRONT SIDE (Credit Card Size: 85.6mm x 53.98mm ~ Aspect 1.58) */}
                  <div className="w-[86mm] h-[54mm] border border-slate-300 rounded-xl overflow-hidden relative shadow-none mb-10 break-inside-avoid">
                      {/* Background */}
                      <div className="absolute inset-0 bg-slate-50">
                           <div className="absolute top-0 w-full h-1/3 bg-slate-900"></div>
                           <div className="absolute bottom-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                      </div>
                      
                      <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-white">
                              <div>
                                  <h1 className="text-[10px] font-bold uppercase tracking-widest opacity-90">{settings.schoolName}</h1>
                                  <p className="text-[8px] font-medium text-blue-200">STUDENT CARD</p>
                              </div>
                              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                  <Book size={12} />
                              </div>
                          </div>

                          <div className="flex gap-3 mt-1 items-end">
                              <div className="w-[24mm] h-[32mm] bg-slate-200 rounded overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                  <img src={capturedPhotos[0]} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left mb-1">
                                  <h2 className="text-[14px] font-bold text-slate-900 leading-tight uppercase">{studentInfo.firstName} <br/> {studentInfo.lastName}</h2>
                                  <div className="mt-2 space-y-0.5">
                                      <p className="text-[8px] text-slate-500 uppercase font-bold">Student ID</p>
                                      <p className="text-[12px] font-mono font-bold text-slate-800">{studentInfo.id}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="w-[86mm] h-[54mm] border border-slate-300 rounded-xl overflow-hidden relative bg-white flex items-center justify-center">
                       <div className="absolute top-0 w-full h-4 bg-slate-900"></div>
                       <div className="text-center">
                           <QrCode size={100} className="mx-auto" />
                           <p className="text-[10px] font-mono mt-1 text-slate-600 tracking-widest">{studentInfo.id}</p>
                       </div>
                       <div className="absolute bottom-2 text-[7px] text-slate-400 w-full text-center px-4">
                           Property of {settings.schoolName}. If found, please return to {settings.schoolAddress}.
                       </div>
                  </div>

              </div>
              
              {/* PREVIEW ON SCREEN */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative group cursor-default">
                    <div className="w-[300px] aspect-[1.58] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden relative">
                         <div className="absolute inset-0 bg-slate-50">
                             <div className="absolute top-0 w-full h-1/3 bg-slate-900"></div>
                             <div className="absolute bottom-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                         </div>
                         <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start text-white">
                                <div><div className="w-20 h-2 bg-white/20 rounded"></div></div>
                                <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                            </div>
                            <div className="flex gap-4 items-end">
                                <img src={capturedPhotos[0]} className="w-20 h-24 bg-slate-300 rounded border-2 border-white object-cover" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{studentInfo.firstName} {studentInfo.lastName}</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-1">{studentInfo.id}</p>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Front</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center no-print">
                  <button onClick={() => window.print()} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
                      <Printer size={20} /> {t('printId')}
                  </button>
                  <button onClick={handleReset} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                      <Plus size={20} /> New Student
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Registration;