
import React, { useState, useEffect } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { useAppContext } from '../context/AppContext';
import { Student } from '../types';
import { Check, Plus, Printer, User, Book, Phone, Search, Wand2, X, Camera, School, Lock, Unlock, MoveHorizontal, MoveVertical, Settings2, ChevronRight } from 'lucide-react';
// @ts-ignore
import QRCode from 'react-qr-code';

const Registration = () => {
  const { addStudent, t, settings, generateStudentId } = useAppContext();
  const [step, setStep] = useState<'details' | 'complete'>('details');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  
  // --- CAMERA CONTROLS STATE ---
  const [camWidth, setCamWidth] = useState(400);
  const [camHeight, setCamHeight] = useState(530); // Approx 3:4 ratio initial
  const [isLocked, setIsLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(400/530);
  
  // Sidebar Toggle State
  const [isControlsOpen, setIsControlsOpen] = useState(true);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const w = parseInt(e.target.value);
      setCamWidth(w);
      if (isLocked) {
          setCamHeight(w / aspectRatio);
      }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = parseInt(e.target.value);
      setCamHeight(h);
      if (isLocked) {
          setCamWidth(h * aspectRatio);
      }
  };

  const toggleLock = () => {
      if (!isLocked) {
          // Locking: Capture current ratio
          setAspectRatio(camWidth / camHeight);
      }
      setIsLocked(!isLocked);
  };
  // -----------------------------

  const [studentInfo, setStudentInfo] = useState({
      firstName: '', lastName: '', id: '', dob: '', address: '', gender: ''
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
          id: generateStudentId('10'),
          dob: "2008-05-15",
          address: "123 Demo St",
          gender: "Male"
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
        gender: studentInfo.gender as 'Male' | 'Female',
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
      setStudentInfo({ firstName: '', lastName: '', id: '', dob: '', address: '', gender: '' });
      setAcademicInfo({ gradeLevel: '', section: '', classTeacher: '' });
      setGuardianInfo({ name: '', relation: '', phone: '', email: '' });
      setCapturedPhotos([]);
  };

  // --- ID CARD COMPONENT (Rendered for both Screen and Print) ---
  const IdCardFront = () => (
    <div className="w-[85.6mm] h-[53.98mm] rounded-xl overflow-hidden relative shadow-lg border border-slate-200 print:shadow-none print:border-slate-300 bg-white flex-shrink-0">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
            <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-full blur-2xl opacity-60 -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
            {/* Watermark Logo */}
            {settings.schoolLogoUrl && (
                <img src={settings.schoolLogoUrl} className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 grayscale object-contain" />
            )}
        </div>

        <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg p-1 flex items-center justify-center border border-white/20 shadow-sm">
                    {settings.schoolLogoUrl ? (
                         <img src={settings.schoolLogoUrl} className="w-full h-full object-contain" />
                    ) : (
                        <School size={16} />
                    )}
                </div>
                <div>
                    <h1 className="text-[9px] font-bold uppercase tracking-wider opacity-90 leading-tight">
                        {settings.schoolName}
                    </h1>
                    <p className="text-[6px] opacity-70 tracking-widest uppercase">Official Student ID</p>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex gap-3 mt-1 items-end">
                {/* Photo Frame */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur opacity-50"></div>
                    <div className="relative w-[22mm] h-[28mm] bg-slate-200 rounded-lg overflow-hidden border border-white/30 shadow-md">
                        <img src={capturedPhotos[0]} className="w-full h-full object-cover" alt="Student" />
                    </div>
                </div>
                
                {/* Info */}
                <div className="flex-1 mb-1">
                    <h2 className="text-[14px] font-bold leading-none tracking-tight mb-0.5 text-white">
                        {studentInfo.firstName}
                    </h2>
                    <h2 className="text-[14px] font-black leading-tight uppercase tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                        {studentInfo.lastName}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                        <div>
                            <p className="text-[5px] text-blue-200 uppercase font-bold">Class</p>
                            <p className="text-[9px] font-bold">{academicInfo.gradeLevel}-{academicInfo.section}</p>
                        </div>
                        <div>
                            <p className="text-[5px] text-blue-200 uppercase font-bold">Expires</p>
                            <p className="text-[9px] font-bold">06/2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Chip Simulation */}
            <div className="flex justify-between items-end mt-1">
                <div className="w-8 h-6 rounded-md border border-yellow-500/50 bg-gradient-to-br from-yellow-200 to-yellow-500 opacity-80 flex items-center justify-center relative overflow-hidden shadow-sm">
                    <div className="absolute inset-0 border-[0.5px] border-black/20 rounded-md grid grid-cols-2 grid-rows-2"></div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-mono tracking-widest opacity-80">{studentInfo.id}</p>
                </div>
            </div>
        </div>
    </div>
  );

  const IdCardBack = () => (
    <div className="w-[85.6mm] h-[53.98mm] bg-white rounded-xl overflow-hidden relative shadow-lg border border-slate-200 print:shadow-none print:border-slate-300 flex flex-col flex-shrink-0">
        {/* Magnetic Strip Simulation */}
        <div className="w-full h-10 bg-slate-800 mt-4 mb-2"></div>

        <div className="flex-1 flex gap-4 px-6 items-center">
            {/* QR Code */}
            <div className="bg-white p-1 border border-slate-100 rounded flex-shrink-0">
                 {/* @ts-ignore */}
                 <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "22mm" }}
                    value={studentInfo.id || "0000"}
                    viewBox={`0 0 256 256`}
                />
            </div>

            <div className="flex-1 space-y-1">
                <div>
                    <p className="text-[6px] text-slate-400 uppercase font-bold tracking-wider">Student ID Number</p>
                    <p className="text-lg font-mono font-black text-slate-900 tracking-widest">{studentInfo.id}</p>
                </div>
                <div className="w-full h-px bg-slate-100 my-1"></div>
                <div>
                    <p className="text-[6px] text-slate-400 uppercase font-bold tracking-wider">Emergency Contact</p>
                    <p className="text-[8px] font-bold text-slate-800">{guardianInfo.phone}</p>
                </div>
            </div>
        </div>

        {/* Disclaimer */}
        <div className="p-2 text-center bg-slate-50 border-t border-slate-100">
             <p className="text-[5px] text-slate-400 leading-tight">
                This card is property of {settings.schoolName}. <br/>
                If found, please return to: {settings.schoolAddress}.
            </p>
        </div>
    </div>
  );

  // Styles
  const sectionClass = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4";
  const headerClass = "text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50";
  const labelClass = "block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase";
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-sm";

  // Handle Print Action (Standard Browser Print with Fix)
  const handlePrint = (e: React.MouseEvent) => {
      // Prevent default form submission or navigation
      e.preventDefault();
      
      // Delay print dialog to ensure any UI updates settle and browser is ready
      setTimeout(() => {
          window.print();
      }, 100);
  };

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
                <Wand2 size={14}/> {t('fillTestData')}
            </button>
        )}
      </div>
      
      {/* Step 1: Details */}
      {step === 'details' && (
         <form onSubmit={handleStartCapture} className="space-y-6 pb-20 no-print">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={sectionClass}>
                    <h3 className={headerClass}><User size={20} className="text-blue-500"/> {t('personalInfo')}</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>{t('firstName')}</label><input required placeholder={t('firstName')} className={inputClass} value={studentInfo.firstName} onChange={e => setStudentInfo({...studentInfo, firstName: e.target.value})} /></div>
                            <div><label className={labelClass}>{t('lastName')}</label><input required placeholder={t('lastName')} className={inputClass} value={studentInfo.lastName} onChange={e => setStudentInfo({...studentInfo, lastName: e.target.value})} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('gender')}</label>
                                <select className={inputClass} value={studentInfo.gender} onChange={e => setStudentInfo({...studentInfo, gender: e.target.value})}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>{t('dob')}</label><input type="date" className={inputClass} value={studentInfo.dob} onChange={e => setStudentInfo({...studentInfo, dob: e.target.value})} /></div>
                        </div>
                         <div><label className={labelClass}>{t('address')}</label><input placeholder={t('address')} className={inputClass} value={studentInfo.address} onChange={e => setStudentInfo({...studentInfo, address: e.target.value})} /></div>
                    </div>
                </div>
                <div className={sectionClass}>
                    <h3 className={headerClass}><Book size={20} className="text-purple-500"/> {t('academicInfo')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>{t('grade')}</label><select required className={inputClass} value={academicInfo.gradeLevel} onChange={e => setAcademicInfo({...academicInfo, gradeLevel: e.target.value})}><option value="">Select</option>{[9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                        <div><label className={labelClass}>{t('section')}</label><select required className={inputClass} value={academicInfo.section} onChange={e => setAcademicInfo({...academicInfo, section: e.target.value})}><option value="">Select</option>{['A','B','C','D','E'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                    <div><label className={labelClass}>{t('teacher')}</label><input required placeholder={t('teacher')} className={inputClass} value={academicInfo.classTeacher} onChange={e => setAcademicInfo({...academicInfo, classTeacher: e.target.value})} /></div>
                </div>
                 <div className={`${sectionClass} md:col-span-2`}>
                    <h3 className={headerClass}><Phone size={20} className="text-green-500"/> {t('guardianInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div><label className={labelClass}>{t('parentName')}</label><input required placeholder={t('parentName')} className={inputClass} value={guardianInfo.name} onChange={e => setGuardianInfo({...guardianInfo, name: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>{t('relation')}</label><select required className={inputClass} value={guardianInfo.relation} onChange={e => setGuardianInfo({...guardianInfo, relation: e.target.value})}><option value="">Select</option><option value="Father">Father</option><option value="Mother">Mother</option><option value="Relative">Relative</option></select></div>
                            <div><label className={labelClass}>{t('phone')}</label><input required placeholder={t('phone')} className={inputClass} value={guardianInfo.phone} onChange={e => setGuardianInfo({...guardianInfo, phone: e.target.value})} /></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-3 text-lg shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                    <Camera size={24} /> {t('startCapture')}
                </button>
            </div>
         </form>
      )}

      {/* CAMERA POPUP */}
      {showCameraModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 no-print">
             <div className="bg-black w-full max-w-7xl h-[95vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative">
                 <div className="flex justify-between items-center p-6 text-white bg-slate-900/50 z-50 flex-shrink-0 backdrop-blur-sm border-b border-white/5">
                     <h2 className="text-xl font-bold flex items-center gap-3"><Camera className="text-green-400" size={24} /> {t('capturePhotos')} ({capturedPhotos.length}/5)</h2>
                     <button type="button" onClick={() => setShowCameraModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
                 </div>
                 
                 {/* SPLIT LAYOUT: Camera Center, Controls Right */}
                 <div className="flex-1 min-h-0 relative flex flex-row overflow-hidden">
                    
                    {/* CENTER: CAMERA CANVAS */}
                    <div className="flex-1 flex items-center justify-center bg-black p-4 overflow-auto relative custom-scrollbar">
                        <div 
                            className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black transition-all duration-200 ease-linear flex-shrink-0"
                            style={{ width: `${camWidth}px`, height: `${camHeight}px` }}
                        >
                            <WebcamCapture onCapture={handlePhotoCaptured} mode="registration" className="w-full h-full object-contain" />
                            
                            <div className="absolute top-2 left-0 right-0 text-center pointer-events-none z-40">
                                <p className="inline-block bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-lg font-medium border border-white/10 shadow-lg">
                                    {capturedPhotos.length < 5 ? "Align face in the oval. Hold still." : "All photos captured!"}
                                </p>
                            </div>
                        </div>

                        {/* MAGNIFY POPUP (Centered over Camera Area) */}
                        {activePhotoIndex !== null && capturedPhotos[activePhotoIndex] && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm">
                                <div className="bg-white p-3 rounded-3xl shadow-2xl animate-in zoom-in duration-200">
                                    <img src={capturedPhotos[activePhotoIndex]} className="w-[300px] h-[400px] object-cover rounded-2xl shadow-inner" alt="Preview"/>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: CONTROLS SIDEBAR (COLLAPSIBLE) */}
                    <div className={`relative bg-slate-950 border-l border-white/5 flex flex-col z-30 shadow-2xl transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-64' : 'w-0'}`}>
                        
                        {/* Toggle Button */}
                        <button 
                            type="button"
                            onClick={() => setIsControlsOpen(!isControlsOpen)}
                            className="absolute top-6 -left-12 bg-slate-900 text-white w-12 h-12 rounded-l-2xl border-y border-l border-white/20 shadow-xl flex items-center justify-center hover:bg-slate-800 transition-colors z-50"
                        >
                            {isControlsOpen ? <ChevronRight size={24}/> : <Settings2 size={24}/>}
                        </button>

                        <div className={`p-6 flex flex-col gap-8 h-full w-64 ${isControlsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-200 overflow-y-auto custom-scrollbar`}>
                            
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-2">Aspect Ratio</h3>
                                {/* Lock Toggle */}
                                <button 
                                    type="button" 
                                    onClick={toggleLock} 
                                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all font-medium text-sm
                                    ${isLocked ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}`}
                                >
                                    <span>{isLocked ? "Ratio Locked" : "Free Ratio"}</span>
                                    {isLocked ? <Lock size={16}/> : <Unlock size={16}/>}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-2">Dimensions</h3>
                                
                                {/* Width Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-2"><MoveHorizontal size={14} className="text-blue-500"/> Width</span>
                                        <span className="font-mono text-white">{camWidth}px</span>
                                    </div>
                                    <input 
                                        type="range" min="200" max="1000" 
                                        value={camWidth} onChange={handleWidthChange}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>

                                {/* Height Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-2"><MoveVertical size={14} className="text-purple-500"/> Height</span>
                                        <span className="font-mono text-white">{camHeight}px</span>
                                    </div>
                                    <input 
                                        type="range" min="200" max="800" 
                                        value={camHeight} onChange={handleHeightChange}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                                <p className="text-[10px] text-blue-300 leading-relaxed text-center">
                                    Adjust the frame to match the student's height and distance. 
                                    <br/>Ensure good lighting.
                                </p>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* BOTTOM: GALLERY STRIP */}
                 <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex-shrink-0 z-40">
                     <div className="h-32 flex gap-4 overflow-x-auto pb-2 snap-x items-center justify-center custom-scrollbar">
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
                                            {/* Trash Button */}
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newPhotos = [...capturedPhotos];
                                                    newPhotos.splice(i, 1);
                                                    setCapturedPhotos(newPhotos);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                                title={t('delete')}
                                            >
                                                <X size={12} />
                                            </button>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-none">
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
          <div className="max-w-4xl mx-auto">
              {/* SCREEN ONLY VIEW */}
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center animate-in zoom-in duration-300 no-print">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Check size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">{t('registrationComplete')}</h2>
                  <p className="text-slate-500 mb-10">The student has been successfully added to the system.</p>
                  
                  {/* Cards Preview on Screen */}
                  <div className="flex flex-col lg:flex-row justify-center items-center gap-10 mb-12">
                     <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Front Side</span>
                        <div className="transform hover:scale-105 transition duration-300">
                             <IdCardFront />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Back Side</span>
                        <div className="transform hover:scale-105 transition duration-300">
                            <IdCardBack />
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                      <button type="button" onClick={handlePrint} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
                          <Printer size={20} /> {t('printId')}
                      </button>
                      <button type="button" onClick={handleReset} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition">
                          <Plus size={20} /> {t('newStudent')}
                      </button>
                  </div>
              </div>

              {/* PRINT ONLY VIEW - HIDDEN ON SCREEN, VISIBLE ON PRINT */}
              <div className="print-only hidden flex-col items-center justify-center gap-10">
                   <div className="flex flex-col gap-10 items-center justify-center h-full w-full">
                       <IdCardFront />
                       <IdCardBack />
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Registration;
