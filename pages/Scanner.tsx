
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import { verifyFace } from '../services/geminiService';
import { CheckCircle, XCircle, User, ScanFace, QrCode, RefreshCcw, ShieldAlert, Maximize, Minimize, X } from 'lucide-react';
import { Student } from '../types';

// Simple Audio Assets
const AUDIO = {
  BEEP: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),
  SUCCESS: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
  FAIL: new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3')
};

type ScanStep = 'idle' | 'scanning_qr' | 'verifying_face' | 'success' | 'failure';

interface ScannerProps {
    onExit?: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onExit }) => {
  const { students, markAttendance, t, navigateTo, settings } = useAppContext();
  const [step, setStep] = useState<ScanStep>('scanning_qr');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>("Please scan your ID Card's QR CODE");
  const [matchedPhoto, setMatchedPhoto] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Detect Projection Mode
  const isProjection = new URLSearchParams(window.location.search).get('mode') === 'projection';

  // Retry Logic
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  const [triggerCapture, setTriggerCapture] = useState(false);

  // --- SAFETY: Timer Management ---
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const safeTimeout = useCallback((callback: () => void, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(callback, ms);
  }, []);

  // --- HELPER: Play Sound ---
  const playSound = (type: 'BEEP' | 'SUCCESS' | 'FAIL') => {
    try {
      AUDIO[type].currentTime = 0;
      AUDIO[type].play().catch(e => console.warn("Audio play failed", e));
    } catch (e) { console.warn("Audio not supported"); }
  };

  // --- FULLSCREEN HANDLER ---
  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
      } else {
          document.exitFullscreen().then(() => setIsFullscreen(false));
      }
  };

  // --- HANDLERS ---

  const handleQrDetected = (code: string) => {
    if (step !== 'scanning_qr') return;

    const student = students.find(s => s.id === code);
    
    if (student) {
        playSound('BEEP'); // Feedback
        setIdentifiedStudent(student);
        setStep('verifying_face');
        setRetryCount(0);
        
        setFeedback("Please stand in front of the camera and look at it");
        
        // Wait 1.5 seconds for user to switch attention to camera
        safeTimeout(() => {
             setTriggerCapture(true);
        }, 1500);

    } else {
        playSound('FAIL');
        setFeedback('Unknown QR Code');
        safeTimeout(() => setFeedback("Please scan your ID Card's QR CODE"), 2000);
    }
  };

  const handleFaceCapture = async (imageSrc: string) => {
    setTriggerCapture(false);
    if (!identifiedStudent) return;
    
    setFeedback(t('verifying') + "...");
    
    try {
        const result = await verifyFace(
            identifiedStudent.photos, 
            imageSrc, 
            settings.verificationThreshold || 'medium'
        );
        
        if (result.match) {
            handleSuccess(result.confidence, imageSrc);
        } else {
            handleFailure();
        }
    } catch (err) {
        console.error("Verification Error", err);
        handleFailure(true); 
    }
  };

  const handleSuccess = (confidence: number, imageSrc: string) => {
      playSound('SUCCESS');
      setStep('success');
      setFeedback(t('verified'));
      if (identifiedStudent) setMatchedPhoto(identifiedStudent.photos[0]);
      setRetryCount(0);
      
      if (identifiedStudent) {
          markAttendance(identifiedStudent.id, 'face_match', confidence, imageSrc);
      }

      safeTimeout(() => resetScanner(), 3500);
  };

  const handleFailure = (isSystemError = false) => {
      playSound('FAIL');
      
      if (isSystemError) {
          setStep('failure');
          setFeedback("System Error - Retrying...");
          safeTimeout(() => resetScanner(), 3000);
          return;
      }

      const newCount = retryCount + 1;
      setRetryCount(newCount);
      setStep('failure');
      
      if (newCount >= MAX_RETRIES) {
          setFeedback(t('contactAdmin'));
      } else {
          setFeedback(t('noMatch') + ` (${newCount}/${MAX_RETRIES})`);
      }
  };

  const handleRetry = () => {
      if (retryCount >= MAX_RETRIES) {
          resetScanner();
          return;
      }
      
      setStep('verifying_face');
      setFeedback("Please stand in front of the camera and look at it");
      
      safeTimeout(() => {
          setTriggerCapture(true);
      }, 1000);
  };

  const resetScanner = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStep('scanning_qr');
      setIdentifiedStudent(null);
      setMatchedPhoto(null);
      setFeedback("Please scan your ID Card's QR CODE");
      setTriggerCapture(false);
      setRetryCount(0);
      setIsFaceDetected(false);
  };

  const handleExit = () => {
      if (isProjection) {
          window.close();
      } else if (onExit) {
          onExit();
      } else {
          navigateTo('dashboard');
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className={`h-16 flex items-center justify-between px-6 transition-colors duration-500 border-b border-white/10 relative z-50
        ${step === 'success' ? 'bg-green-600' : 
          step === 'failure' ? 'bg-red-600' : 
          'bg-slate-900'}`}>
          
          <div className="flex items-center gap-4 text-white">
            {step === 'scanning_qr' && <QrCode className="animate-pulse" />}
            {step === 'verifying_face' && <ScanFace className="animate-pulse text-yellow-400" />}
            {step === 'success' && <CheckCircle className="text-white" />}
            {step === 'failure' && <XCircle className="text-white" />}
            
            <h2 className="text-lg font-bold tracking-wide uppercase hidden sm:block">
                {step === 'scanning_qr' && "Ready to Scan"}
                {step === 'verifying_face' && "Verifying..."}
                {step === 'success' && "Access Granted"}
                {step === 'failure' && "Access Denied"}
            </h2>
          </div>

          {/* Centered Feedback Bubble */}
          <div className="absolute left-1/2 -translate-x-1/2 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
             <p className="text-sm font-medium text-white/90 whitespace-nowrap">
                {feedback}
             </p>
          </div>

          <div className="flex items-center gap-2">
             {isProjection && (
                 <button 
                    onClick={toggleFullscreen} 
                    className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
                    title="Toggle Fullscreen"
                 >
                    {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}
                 </button>
             )}
             <button 
                onClick={handleExit} 
                className="text-white/70 hover:text-white text-xs uppercase font-bold border border-white/20 px-4 py-2 rounded-lg transition hover:bg-white/10"
             >
                {isProjection ? 'Close' : 'Exit'}
             </button>
          </div>
      </div>

      {/* MAIN CAMERA AREA */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          
          {/* Webcam Container */}
          <div className="w-full h-full relative">
            <WebcamCapture 
              mode="scanner"
              onQrDetected={handleQrDetected}
              onCapture={handleFaceCapture}
              pauseScan={step !== 'scanning_qr'}
              triggerCapture={triggerCapture} 
              className="w-full h-full object-cover" 
              objectDetection={step === 'verifying_face'}
              onFaceDetected={setIsFaceDetected}
            />
          </div>
            
            {/* OVERLAYS */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                
                {/* QR Guide */}
                {step === 'scanning_qr' && (
                    <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-white/30 rounded-3xl relative animate-in fade-in duration-500">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-xl"></div>
                        <div className="absolute w-[90%] h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,1)] left-[5%] top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                )}
                
                {/* Face Guide */}
                {step === 'verifying_face' && (
                     <div className={`w-64 h-80 sm:w-80 sm:h-96 border-4 rounded-[40%] relative transition-all duration-300
                        ${isFaceDetected 
                            ? 'border-green-500/60 shadow-[0_0_60px_rgba(34,197,94,0.4)] scale-105' 
                            : 'border-white/30 shadow-none scale-100'}
                      `}>
                        {!isFaceDetected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-white/80 font-bold bg-black/40 px-3 py-1 rounded backdrop-blur-sm animate-pulse">
                                    NO FACE DETECTED
                                </p>
                            </div>
                        )}
                     </div>
                )}
            </div>

            {/* ERROR / FAILURE MODAL */}
            {step === 'failure' && (
                <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                        
                        {retryCount >= MAX_RETRIES ? (
                            <>
                                <ShieldAlert size={64} className="text-red-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">{t('accessDenied')}</h3>
                                <p className="text-slate-400 mb-6">Verification failed limit reached.</p>
                                <button onClick={resetScanner} className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 pointer-events-auto transition">
                                    {t('backToScanning')}
                                </button>
                            </>
                        ) : (
                            <>
                                <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{t('noMatch')}</h3>
                                <p className="text-slate-400 mb-6">Face verification failed.</p>
                                <button onClick={handleRetry} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 pointer-events-auto transition flex items-center justify-center gap-2">
                                    <RefreshCcw size={18}/> {t('tryAgain')} ({retryCount}/{MAX_RETRIES})
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
      </div>

      {/* STUDENT INFO BANNER */}
      {identifiedStudent && step !== 'failure' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-8 px-6 z-40">
            <div className="flex items-center gap-6 max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-500"> 
                {matchedPhoto ? (
                    <img src={matchedPhoto} alt="Student" className="w-20 h-20 rounded-full border-4 border-green-500 object-cover shadow-green-900/50 shadow-lg" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/10">
                        <User size={32} className="text-white/30" />
                    </div>
                )}
                <div className="text-white">
                    <h1 className="text-3xl font-bold leading-none mb-2 tracking-tight">
                        {identifiedStudent.firstName} {identifiedStudent.lastName}
                    </h1>
                    <div className="flex items-center gap-3 text-slate-400">
                        <span className="px-3 py-1 bg-white/10 rounded-md text-sm font-bold text-white border border-white/10">
                            {identifiedStudent.gradeLevel} - {identifiedStudent.section}
                        </span>
                        <span className="font-mono text-sm tracking-widest opacity-60">
                            ID: {identifiedStudent.id}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
