import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import { verifyFace } from '../services/geminiService';
import { Scan, QrCode, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { Student } from '../types';

type ScanStep = 'idle' | 'scanning_qr' | 'verifying_face' | 'processing' | 'success' | 'failure';

const Scanner = () => {
  const { students, markAttendance } = useAppContext();
  const [step, setStep] = useState<ScanStep>('idle');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  
  // Simulation of QR Scanning
  const handleQRScan = () => {
    setStep('scanning_qr');
    // Simulate a delay for "scanning"
    setTimeout(() => {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        if (randomStudent) {
            setIdentifiedStudent(randomStudent);
            setStep('verifying_face');
            setFeedback(`QR Code detected: ${randomStudent.name} (${randomStudent.id})`);
        } else {
            setStep('idle');
            setFeedback('No students in database to scan.');
        }
    }, 1500);
  };

  const handleManualID = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const id = formData.get('studentId') as string;
      const student = students.find(s => s.id === id || s.name.toLowerCase().includes(id.toLowerCase()));
      if (student) {
          setIdentifiedStudent(student);
          setStep('verifying_face');
          setFeedback(`Student Identified: ${student.name}`);
      } else {
          setFeedback('Student not found.');
      }
  };

  const handleFaceCapture = async (imageSrc: string) => {
    if (!identifiedStudent) return;
    setStep('processing');
    setFeedback('Verifying identity with Gemini...');

    try {
        // Pass the array of photos
        const result = await verifyFace(identifiedStudent.photos, imageSrc);
        
        if (result.match) {
            setStep('success');
            setFeedback(`Identity Verified! Welcome, ${identifiedStudent.name}.`);
            // Pass imageSrc to enable enrichment (learning)
            markAttendance(identifiedStudent.id, 'face_match', result.confidence, imageSrc);
            
            setTimeout(() => {
                resetScanner();
            }, 3000);
        } else {
            setStep('failure');
            setFeedback(`Verification Failed: ${result.reason}`);
        }
    } catch (err) {
        setStep('failure');
        setFeedback("System Error during verification.");
    }
  };

  const resetScanner = () => {
      setStep('idle');
      setIdentifiedStudent(null);
      setFeedback('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header / Status Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
              <h2 className="text-xl font-bold text-slate-800">Attendance Scanner</h2>
              <p className="text-sm text-slate-500">Scan QR Code then verify face</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                step === 'idle' ? 'bg-slate-100 text-slate-600' :
                step === 'success' ? 'bg-green-100 text-green-700' :
                step === 'failure' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
            }`}>
                {step === 'idle' && 'Ready'}
                {step === 'scanning_qr' && 'Scanning QR...'}
                {step === 'verifying_face' && 'Waiting for Face'}
                {step === 'processing' && 'Analyzing...'}
                {step === 'success' && 'Verified'}
                {step === 'failure' && 'Failed'}
            </span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Panel: Actions & Info */}
        <div className="space-y-6">
            
            {/* ID Card Display */}
            {identifiedStudent ? (
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 animate-slide-in">
                    <div className="flex items-start gap-4">
                        <img 
                            src={identifiedStudent.photos[0]} 
                            alt={identifiedStudent.name} 
                            className="w-20 h-20 rounded-lg object-cover bg-slate-200"
                        />
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{identifiedStudent.name}</h3>
                            <p className="text-slate-500">{identifiedStudent.id}</p>
                            <p className="text-xs text-blue-600 font-medium mt-1 uppercase tracking-wide">{identifiedStudent.grade}</p>
                            <p className="text-xs text-slate-400 mt-2">{identifiedStudent.photos.length} ref photos</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center py-12">
                    <User className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-500">No student identified yet</p>
                </div>
            )}

            {/* Controls */}
            {step === 'idle' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
                    <button 
                        onClick={handleQRScan}
                        className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-lg hover:shadow-xl"
                    >
                        <QrCode size={24} />
                        Simulate QR Scan
                    </button>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Or enter manually</span>
                        </div>
                    </div>

                    <form onSubmit={handleManualID} className="flex gap-2">
                        <input 
                            name="studentId"
                            type="text" 
                            placeholder="Enter Name or ID..." 
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button type="submit" className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">
                            Find
                        </button>
                    </form>
                </div>
            )}

            {/* Messages */}
            {feedback && (
                <div className={`p-4 rounded-lg border text-sm font-medium ${
                    step === 'failure' ? 'bg-red-50 border-red-200 text-red-700' : 
                    step === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 
                    'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                    {feedback}
                </div>
            )}
            
            {(step === 'success' || step === 'failure') && (
                <button onClick={resetScanner} className="w-full py-2 text-slate-500 hover:text-slate-800 underline text-sm">
                    Reset / Next Student
                </button>
            )}
        </div>

        {/* Right Panel: Active View */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl min-h-[400px] flex flex-col items-center justify-center relative">
            
            {step === 'idle' && (
                <div className="text-center text-white/50 p-8">
                    <Scan size={64} className="mx-auto mb-4 opacity-50" />
                    <p>Waiting for QR Scan...</p>
                </div>
            )}

            {step === 'scanning_qr' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <QrCode size={24} className="text-white" />
                        </div>
                    </div>
                    <p className="text-white mt-4 font-medium tracking-wide">Scanning Code...</p>
                </div>
            )}

            {(step === 'verifying_face' || step === 'processing') && (
                <div className="w-full h-full relative">
                    <WebcamCapture 
                        onCapture={handleFaceCapture} 
                        label="Verify Identity" 
                        autoStart={true}
                        mode="simple" // Simple mode for attendance, no guides needed
                    />
                    {step === 'processing' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <Loader2 className="h-12 w-12 text-white animate-spin mb-3" />
                            <p className="text-white font-medium">Verifying Face Match...</p>
                        </div>
                    )}
                </div>
            )}

            {step === 'success' && (
                <div className="text-center p-8 animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                        <CheckCircle size={48} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Authenticated</h3>
                    <p className="text-green-200">Attendance Marked & Profile Updated</p>
                </div>
            )}

            {step === 'failure' && (
                <div className="text-center p-8 animate-in shake duration-300">
                    <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                        <XCircle size={48} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Access Denied</h3>
                    <p className="text-red-200">Face does not match records</p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Scanner;