import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import { verifyFace } from '../services/geminiService';
import { CheckCircle, XCircle, Loader2, User, ScanFace, QrCode, RefreshCcw, ShieldAlert } from 'lucide-react';
import { Student } from '../types';

type ScanStep = 'idle' | 'scanning_qr' | 'verifying_face' | 'success' | 'failure';

const Scanner = () => {
  const { students, markAttendance, t } = useAppContext();
  const [step, setStep] = useState<ScanStep>('scanning_qr');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>(t('qrScanning'));
  const [matchedPhoto, setMatchedPhoto] = useState<string | null>(null);
  
  // Retry Logic
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  // Use state to trigger capture in WebcamCapture
  const [triggerCapture, setTriggerCapture] = useState(false);

  const handleQrDetected = (code: string) => {
    if (step !== 'scanning_qr') return;
    const student = students.find(s => s.id === code);
    
    if (student) {
        setIdentifiedStudent(student);
        setStep('verifying_face');
        setRetryCount(0); // Reset retries on new QR scan
        
        setFeedback("QR Detected! Look at the camera...");
        
        // Wait 1.5 seconds for user to switch
        setTimeout(() => {
             setTriggerCapture(true);
        }, 1500);
    } else {
        setFeedback('Unknown QR Code');
        setTimeout(() => setFeedback(t('qrScanning')), 2000);
    }
  };

  const handleFaceCapture = async (imageSrc: string) => {
    setTriggerCapture(false); // Reset trigger
    if (!identifiedStudent) return;
    
    setFeedback(t('verifying'));
    
    try {
        const result = await verifyFace(identifiedStudent.photos, imageSrc);
        
        if (result.match) {
            setStep('success');
            setFeedback(t('verified'));
            setMatchedPhoto(identifiedStudent.photos[0]); 
            setRetryCount(0);
            markAttendance(identifiedStudent.id, 'face_match', result.confidence, imageSrc);
            setTimeout(() => resetScanner(), 3000); 
        } else {
            // FAILURE LOGIC
            const newCount = retryCount + 1;
            setRetryCount(newCount);
            setStep('failure');
            
            if (newCount >= MAX_RETRIES) {
                setFeedback("Verification Denied. Please contact administration.");
            } else {
                setFeedback(`No match. (${newCount}/${MAX_RETRIES})`);
            }
        }
    } catch (err) {
        setStep('failure');
        setFeedback("System Error");
        setTimeout(() => resetScanner(), 3000);
    }
  };

  const handleRetry = () => {
      if (retryCount >= MAX_RETRIES) {
          // If max retries reached, only allow going back to start
          resetScanner();
          return;
      }
      
      // Allow retry
      setStep('verifying_face');
      setFeedback("Align your face...");
      // Wait 1s then capture
      setTimeout(() => {
          setTriggerCapture(true);
      }, 1000);
  };

  const resetScanner = () => {
      setStep('scanning_qr');
      setIdentifiedStudent(null);
      setMatchedPhoto(null);
      setFeedback(t('qrScanning'));
      setTriggerCapture(false);
      setRetryCount(0);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-6">
      {/* Status Card */}
      <div className={`p-6 rounded-2xl shadow-md transition-all duration-300 flex items-center justify-between
        ${step === 'success' ? 'bg-green-600 text-white shadow-green-600/20' : 
          step === 'failure' ? 'bg-red-600 text-white shadow-red-600/20' : 
          'bg-white border border-slate-100 text-slate-800'}`}>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wide flex items-center gap-3">
                {step === 'scanning_qr' && <><QrCode /> {t('qrReady')}</>}
                {step === 'verifying_face' && <><ScanFace className="animate-pulse"/> {t('verifying')}</>}
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
          <div className="flex-1 relative group">
            <WebcamCapture 
                mode="scanner"
                onQrDetected={handleQrDetected}
                onCapture={handleFaceCapture}
                pauseScan={step !== 'scanning_qr'}
                triggerCapture={triggerCapture} 
                className="w-full h-full object-cover"
                objectDetection={step === 'verifying_face'} 
            />
            
            {/* Visual Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {step === 'scanning_qr' && (
                    <div className="w-64 h-64 border-4 border-white/30 rounded-3xl relative animate-pulse">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-xl"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white/80 font-bold bg-black/20 backdrop-blur-[2px] rounded-2xl">
                            SCAN QR
                        </div>
                    </div>
                )}
                
                {step === 'verifying_face' && (
                     <div className="w-[30%] h-[50%] border-4 border-green-500/50 rounded-[50%] relative animate-pulse shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                        <div className="absolute -top-12 w-full text-center">
                            <span className="bg-black/60 text-white px-4 py-1 rounded-full text-sm font-bold backdrop-blur-md">
                                Look at Camera
                            </span>
                        </div>
                     </div>
                )}
            </div>

            {/* FAILURE OVERLAY */}
            {step === 'failure' && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
                    <div className="text-center max-w-md">
                        {retryCount >= MAX_RETRIES ? (
                            // MAX RETRIES REACHED
                            <div className="bg-red-900/50 p-8 rounded-3xl border border-red-500/50">
                                <ShieldAlert size={64} className="text-red-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-black text-white mb-2">ACCESS DENIED</h3>
                                <p className="text-red-200 mb-6 font-medium">Verification failed {MAX_RETRIES} times.</p>
                                <div className="bg-red-950 p-4 rounded-xl border border-red-900 mb-6">
                                    <p className="text-red-400 font-bold text-sm uppercase tracking-wide">Please Contact Administration</p>
                                </div>
                                <button 
                                    onClick={resetScanner} 
                                    className="bg-white text-red-900 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition pointer-events-auto"
                                >
                                    Back to Scanning
                                </button>
                            </div>
                        ) : (
                            // RETRY ALLOWED
                            <div className="bg-red-600 p-8 rounded-3xl shadow-2xl pointer-events-auto">
                                <XCircle size={64} className="text-white mx-auto mb-4" />
                                <h3 className="text-2xl font-black text-white mb-2">NO MATCH FOUND</h3>
                                <p className="text-red-100 mb-8 font-medium">
                                    The face does not match the record for <b>{identifiedStudent?.firstName}</b>.
                                </p>
                                <button 
                                    onClick={handleRetry} 
                                    className="w-full bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-3 text-lg"
                                >
                                    <RefreshCcw size={20}/> Try Again ({retryCount}/{MAX_RETRIES})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Object Detection Flash/Visuals */}
            {step === 'verifying_face' && (
                <div className="absolute top-4 right-4 z-50">
                     <span className="bg-black/50 text-white text-xs px-2 py-1 rounded border border-white/20 animate-pulse">
                        AI Object Detection Active
                     </span>
                </div>
            )}
          </div>

          {/* Identification Overlay (Bottom Sheet style) */}
          {identifiedStudent && step !== 'failure' && (
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