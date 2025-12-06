
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import { verifyFace } from '../services/geminiService';
import { CheckCircle, XCircle, Loader2, User, ScanFace, QrCode, RefreshCcw, ShieldAlert, Maximize2, Minimize2 } from 'lucide-react';
import { Student } from '../types';

type ScanStep = 'idle' | 'scanning_qr' | 'verifying_face' | 'success' | 'failure';

const Scanner = () => {
  const { students, markAttendance, t, navigateTo, settings } = useAppContext();
  const [step, setStep] = useState<ScanStep>('scanning_qr');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>("Please scan your ID Card's QR CODE");
  const [matchedPhoto, setMatchedPhoto] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  
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
        
        setFeedback("Please stand in front of the camera and look at it");
        
        // Wait 1.5 seconds for user to switch
        setTimeout(() => {
             setTriggerCapture(true);
        }, 1500);
    } else {
        setFeedback('Unknown QR Code');
        setTimeout(() => setFeedback("Please scan your ID Card's QR CODE"), 2000);
    }
  };

  const handleFaceCapture = async (imageSrc: string) => {
    setTriggerCapture(false); // Reset trigger
    if (!identifiedStudent) return;
    
    setFeedback(t('verifying') + "...");
    
    try {
        const result = await verifyFace(
            identifiedStudent.photos, 
            imageSrc, 
            settings.verificationThreshold || 'medium'
        );
        
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
                setFeedback(t('contactAdmin'));
            } else {
                setFeedback(t('noMatch') + ` (${newCount}/${MAX_RETRIES})`);
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
      setFeedback("Please stand in front of the camera and look at it");
      // Wait 1s then capture
      setTimeout(() => {
          setTriggerCapture(true);
      }, 1000);
  };

  const resetScanner = () => {
      setStep('scanning_qr');
      setIdentifiedStudent(null);
      setMatchedPhoto(null);
      setFeedback("Please scan your ID Card's QR CODE");
      setTriggerCapture(false);
      setRetryCount(0);
      setIsFaceDetected(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      {/* Top Thin Status Bar */}
      <div className={`h-16 flex items-center justify-between px-6 transition-colors duration-300 border-b border-white/10 relative z-50
        ${step === 'success' ? 'bg-green-600' : 
          step === 'failure' ? 'bg-red-600' : 
          'bg-slate-900'}`}>
          
          <div className="flex items-center gap-4 text-white">
            {step === 'scanning_qr' && <QrCode className="animate-pulse" />}
            {step === 'verifying_face' && <ScanFace className="animate-pulse" />}
            {step === 'success' && <CheckCircle />}
            {step === 'failure' && <XCircle />}
            
            <h2 className="text-lg font-bold tracking-wide uppercase">
                {step === 'scanning_qr' && "Ready to Scan"}
                {step === 'verifying_face' && "Verifying Identity"}
                {step === 'success' && "Access Granted"}
                {step === 'failure' && "Access Denied"}
            </h2>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
             <p className="text-sm font-medium text-white/90 whitespace-nowrap animate-pulse">
                {feedback}
             </p>
          </div>

          <div className="flex items-center gap-2">
             <button 
                onClick={() => navigateTo('dashboard')} 
                className="text-white/50 hover:text-white text-xs uppercase font-bold border border-white/20 px-3 py-1 rounded transition hover:bg-white/10"
             >
                Exit Fullscreen
             </button>
          </div>
      </div>

      {/* Main Camera Area */}
      <div className="flex-1 relative bg-black">
          {/* Camera fills available space */}
          <WebcamCapture 
            mode="scanner"
            onQrDetected={handleQrDetected}
            onCapture={handleFaceCapture}
            pauseScan={step !== 'scanning_qr'}
            triggerCapture={triggerCapture} 
            className="w-full h-full object-contain"
            objectDetection={step === 'verifying_face'}
            onFaceDetected={setIsFaceDetected}
          />
            
            {/* Visual Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {step === 'scanning_qr' && (
                    <div className="w-72 h-72 border-2 border-white/40 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-lg"></div>
                        
                        <div className="absolute -bottom-12 w-full text-center">
                             <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Align QR Code Here</p>
                        </div>
                    </div>
                )}
                
                {step === 'verifying_face' && (
                     <div className={`w-[30%] h-[50%] border-4 rounded-[50%] relative transition-colors duration-200 shadow-[0_0_50px_rgba(0,0,0,0.5)]
                        ${isFaceDetected ? 'border-green-500/80 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]'}
                     `}>
                        {!isFaceDetected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-red-500 font-bold bg-black/50 px-2 rounded">NO FACE</p>
                            </div>
                        )}
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
                                <h3 className="text-2xl font-black text-white mb-2">{t('accessDenied')}</h3>
                                <p className="text-red-200 mb-6 font-medium">Verification failed {MAX_RETRIES} times.</p>
                                <div className="bg-red-950 p-4 rounded-xl border border-red-900 mb-6">
                                    <p className="text-red-400 font-bold text-sm uppercase tracking-wide">{t('contactAdmin')}</p>
                                </div>
                                <button 
                                    onClick={resetScanner} 
                                    className="bg-white text-red-900 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition pointer-events-auto"
                                >
                                    {t('backToScanning')}
                                </button>
                            </div>
                        ) : (
                            // RETRY ALLOWED
                            <div className="bg-red-600 p-8 rounded-3xl shadow-2xl pointer-events-auto">
                                <XCircle size={64} className="text-white mx-auto mb-4" />
                                <h3 className="text-2xl font-black text-white mb-2">{t('noMatch')}</h3>
                                <p className="text-red-100 mb-8 font-medium">
                                    The face does not match the record for <b>{identifiedStudent?.firstName}</b>.
                                </p>
                                <button 
                                    onClick={handleRetry} 
                                    className="w-full bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-3 text-lg"
                                >
                                    <RefreshCcw size={20}/> {t('tryAgain')} ({retryCount}/{MAX_RETRIES})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
      </div>

      {/* Bottom Result Banner - KOMPAKT VERSİYON */}
{identifiedStudent && step !== 'failure' && (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-4 px-6 z-40">
        <div className="flex items-center gap-4 max-w-4xl mx-auto"> 
            {step === 'success' && matchedPhoto ? (
                <img src={matchedPhoto} className="w-16 h-16 rounded-full border-2 border-green-500 object-cover shadow-lg" />
            ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-lg backdrop-blur-md">
                    <User size={28} className="text-white/50" />
                </div>
            )}
            <div className="text-white">
                <h1 className="text-2xl font-bold leading-none mb-1">
                    {identifiedStudent.firstName} {identifiedStudent.lastName}
                </h1>
                <div className="flex items-center gap-2 opacity-80">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold border border-white/10">
                        {identifiedStudent.gradeLevel}-{identifiedStudent.section}
                    </span>
                    <span className="font-mono text-xs tracking-widest">{identifiedStudent.id}</span>
                </div>
            </div>
        </div>
    </div>
)}
    </div>
  );
};

export default Scanner;
