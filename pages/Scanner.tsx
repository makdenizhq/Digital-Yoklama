import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import { verifyFace } from '../services/geminiService';
import { CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { Student } from '../types';

type ScanStep = 'idle' | 'scanning_qr' | 'verifying_face' | 'success' | 'failure';

const Scanner = () => {
  const { students, markAttendance, t } = useAppContext();
  const [step, setStep] = useState<ScanStep>('scanning_qr');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>(t('qrScanning'));
  const [matchedPhoto, setMatchedPhoto] = useState<string | null>(null);
  
  // Use state to trigger capture in WebcamCapture
  const [triggerCapture, setTriggerCapture] = useState(false);

  const handleQrDetected = (code: string) => {
    if (step !== 'scanning_qr') return;
    const student = students.find(s => s.id === code);
    
    if (student) {
        setIdentifiedStudent(student);
        setStep('verifying_face');
        setFeedback(t('verifying'));
        
        // Wait 1 second for user to see name, then trigger capture
        setTimeout(() => {
             setTriggerCapture(true);
        }, 1000);
    } else {
        setFeedback('Unknown QR Code');
        setTimeout(() => setFeedback(t('qrScanning')), 2000);
    }
  };

  const handleFaceCapture = async (imageSrc: string) => {
    setTriggerCapture(false); // Reset trigger
    if (!identifiedStudent) return;
    
    try {
        const result = await verifyFace(identifiedStudent.photos, imageSrc);
        
        if (result.match) {
            setStep('success');
            setFeedback(t('verified'));
            setMatchedPhoto(identifiedStudent.photos[0]); 
            markAttendance(identifiedStudent.id, 'face_match', result.confidence, imageSrc);
            setTimeout(() => resetScanner(), 3000); 
        } else {
            setStep('failure');
            setFeedback(result.reason || t('failed'));
            setTimeout(() => resetScanner(), 3000);
        }
    } catch (err) {
        setStep('failure');
        setFeedback("System Error");
        setTimeout(() => resetScanner(), 3000);
    }
  };

  const resetScanner = () => {
      setStep('scanning_qr');
      setIdentifiedStudent(null);
      setMatchedPhoto(null);
      setFeedback(t('qrScanning'));
      setTriggerCapture(false);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-6">
      {/* Status Card */}
      <div className={`p-6 rounded-2xl shadow-md transition-all duration-300 flex items-center justify-between
        ${step === 'success' ? 'bg-green-600 text-white shadow-green-600/20' : 
          step === 'failure' ? 'bg-red-600 text-white shadow-red-600/20' : 
          'bg-white border border-slate-100 text-slate-800'}`}>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wide">
                {step === 'scanning_qr' && t('qrReady')}
                {step === 'verifying_face' && t('verifying')}
                {step === 'success' && t('verified')}
                {step === 'failure' && t('failed')}
            </h2>
            <p className="text-sm font-medium opacity-90 mt-1">{feedback}</p>
          </div>
          {step === 'verifying_face' && <Loader2 className="animate-spin w-8 h-8" />}
          {step === 'success' && <CheckCircle size={40} />}
          {step === 'failure' && <XCircle size={40} />}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-slate-900 flex flex-col">
          
          {/* Camera fills available space */}
          <div className="flex-1 relative">
            <WebcamCapture 
                mode="scanner"
                onQrDetected={handleQrDetected}
                onCapture={handleFaceCapture}
                pauseScan={step !== 'scanning_qr'}
                triggerCapture={triggerCapture} 
                className="w-full h-full object-cover"
            />
          </div>

          {/* Identification Overlay (Bottom Sheet style) */}
          {identifiedStudent && (
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-6 border-t border-white/20 animate-in slide-in-from-bottom duration-300 z-20">
                   <div className="flex items-center gap-6 max-w-3xl mx-auto">
                        {step === 'success' && matchedPhoto ? (
                            <img src={matchedPhoto} className="w-24 h-24 rounded-full border-4 border-green-500 object-cover shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-lg">
                                <User size={40} className="text-slate-400" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">
                                {identifiedStudent.firstName} {identifiedStudent.lastName}
                            </h1>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-lg font-bold">
                                Class {identifiedStudent.gradeLevel}-{identifiedStudent.section}
                            </span>
                        </div>
                   </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Scanner;