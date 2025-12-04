import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { useAppContext } from '../context/AppContext';
import { Student } from '../types';
import { Check, Plus, Trash2, QrCode, Printer } from 'lucide-react';

const Registration = () => {
  const { addStudent } = useAppContext();
  const [step, setStep] = useState<'details' | 'photos' | 'complete'>('details');
  
  // Data
  const [formData, setFormData] = useState({ name: '', grade: '' });
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [generatedId, setGeneratedId] = useState<string>('');

  const handleStartCapture = (e: React.FormEvent) => {
      e.preventDefault();
      if(formData.name && formData.grade) {
          setStep('photos');
      }
  };

  const handlePhotoCaptured = (photo: string) => {
      const updated = [...capturedPhotos, photo];
      setCapturedPhotos(updated);
      
      if (updated.length >= 5) {
          finishRegistration(updated);
      }
  };

  const finishRegistration = (photos: string[]) => {
      const newId = `STU-${Math.floor(10000 + Math.random() * 90000)}`;
      setGeneratedId(newId);

      const newStudent: Student = {
        id: newId,
        name: formData.name,
        grade: formData.grade,
        photos: photos,
        parentEmail: 'parent@test.com'
      };

      addStudent(newStudent);
      setStep('complete');
  };

  const handleReset = () => {
      setStep('details');
      setFormData({ name: '', grade: '' });
      setCapturedPhotos([]);
      setGeneratedId('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-slate-800">New Student Registration</h2>
            <p className="text-sm text-slate-500">
                {step === 'details' && "Step 1: Enter student details"}
                {step === 'photos' && "Step 2: Capture 5 reference photos"}
                {step === 'complete' && "Registration Complete"}
            </p>
        </div>
        <div className="flex gap-2">
            <div className={`h-2 w-12 rounded-full ${step === 'details' ? 'bg-blue-600' : 'bg-blue-200'}`} />
            <div className={`h-2 w-12 rounded-full ${step === 'photos' ? 'bg-blue-600' : 'bg-blue-200'}`} />
            <div className={`h-2 w-12 rounded-full ${step === 'complete' ? 'bg-blue-600' : 'bg-blue-200'}`} />
        </div>
      </div>
      
      {/* Step 1: Details */}
      {step === 'details' && (
         <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
             <form onSubmit={handleStartCapture} className="space-y-6 max-w-md mx-auto">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Grade / Class</label>
                    <input 
                        required
                        type="text" 
                        value={formData.grade}
                        onChange={e => setFormData({...formData, grade: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 10A"
                    />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    Next: Capture Photos <Plus size={20} />
                </button>
             </form>
         </div>
      )}

      {/* Step 2: Photos */}
      {step === 'photos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                              {capturedPhotos.length + 1}
                          </span>
                          Capture Photo {capturedPhotos.length + 1} of 5
                      </h3>
                      
                      {/* CAMERA COMPONENT */}
                      <div className="rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-inner">
                          <WebcamCapture 
                            onCapture={handlePhotoCaptured} 
                            mode="registration" 
                          />
                      </div>
                      
                      <div className="mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <p className="font-medium text-slate-700 mb-1">Instructions:</p>
                          <ul className="list-disc pl-4 space-y-1">
                              <li>Position face inside the <span className="text-red-500 font-bold">Oval</span>.</li>
                              <li>Hold still until the square turns <span className="text-green-600 font-bold">Green</span>.</li>
                              <li>Photo will auto-capture. Confirm to save.</li>
                          </ul>
                      </div>
                  </div>
              </div>

              {/* Gallery */}
              <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Captured Photos</h3>
                  <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`aspect-square rounded-lg border-2 flex items-center justify-center relative overflow-hidden ${
                              capturedPhotos[i] ? 'border-green-500 bg-slate-100' : 'border-dashed border-slate-300 bg-slate-50'
                          }`}>
                              {capturedPhotos[i] ? (
                                  <>
                                    <img src={capturedPhotos[i]} alt={`Capture ${i}`} className="w-full h-full object-cover" />
                                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                                        <Check size={12} />
                                    </div>
                                  </>
                              ) : (
                                  <span className="text-slate-300 font-bold text-2xl">{i + 1}</span>
                              )}
                          </div>
                      ))}
                  </div>
                  <p className="text-xs text-center text-slate-400">5 photos required to generate ID</p>
              </div>
          </div>
      )}

      {/* Step 3: Complete / ID Card */}
      {step === 'complete' && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
              <p className="text-slate-500 mb-8">Student has been added to the database.</p>

              {/* ID Card Preview */}
              <div className="max-w-sm mx-auto bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xl mb-8 text-left print:shadow-none print:border-2">
                  <div className="bg-blue-900 p-4 text-white flex justify-between items-center">
                      <span className="font-bold tracking-wider">AttendAI SCHOOL</span>
                      <span className="text-xs opacity-70">STUDENT ID</span>
                  </div>
                  <div className="p-6 flex flex-col items-center">
                      <div className="w-32 h-32 rounded-lg bg-slate-200 mb-4 overflow-hidden border-2 border-slate-100">
                          <img src={capturedPhotos[0]} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{formData.name}</h3>
                      <p className="text-blue-600 font-medium mb-4">{formData.grade}</p>
                      
                      <div className="bg-white p-2 border-2 border-slate-900 rounded-lg">
                           <QrCode size={100} className="text-slate-900" />
                      </div>
                      <p className="font-mono text-sm mt-2 text-slate-500 tracking-widest">{generatedId}</p>
                  </div>
              </div>

              <div className="flex gap-4 justify-center">
                  <button onClick={() => window.print()} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 flex items-center gap-2">
                      <Printer size={20} /> Print ID Card
                  </button>
                  <button onClick={handleReset} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2">
                      <Plus size={20} /> Register Another
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Registration;