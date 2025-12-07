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
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden font-sans">
      {/* HEADER */}
      <div className={`h-16 flex items-center justify-between px-6 transition-colors duration-500 border-b border-white/10 relative z-50 backdrop-blur-md
        ${step === 'success' ? 'bg-emerald-600/90 border-emerald-500' : 
          step === 'failure' ? 'bg-rose-600/90 border-rose-500' : 
          'bg-slate-900/80 border-slate-800'}`}>
          
          <div className="flex items-center gap-4 text-white">
            {step === 'scanning_qr' && <QrCode className="animate-pulse text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />}
            {step === 'verifying_face' && <ScanFace className="animate-pulse text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />}
            {step === 'success' && <CheckCircle className="text-white drop-shadow-md" />}
            {step === 'failure' && <XCircle className="text-white drop-shadow-md" />}
            
            <h2 className="text-lg font-black tracking-widest uppercase hidden sm:block font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {step === 'scanning_qr' && "System Ready"}
                {step === 'verifying_face' && "Processing..."}
                {step === 'success' && "Access Granted"}
                {step === 'failure' && "Access Denied"}
            </h2>
          </div>

          {/* Centered Feedback Bubble - Tech Style */}
          <div className="absolute left-1/2 -translate-x-1/2 bg-black/60 px-8 py-2 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl">
             <p className="text-sm font-bold text-white tracking-wide whitespace-nowrap flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${step === 'idle' || step === 'scanning_qr' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                {feedback}
             </p>
          </div>

          <div className="flex items-center gap-3">
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
                className="text-slate-300 hover:text-white text-xs uppercase font-bold border border-white/10 px-4 py-2 rounded-lg transition hover:bg-white/5 hover:border-white/30 tracking-wider"
             >
                {isProjection ? 'Close System' : 'Exit'}
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
                
                {/* QR Guide - Cyberpunk Style */}
                {step === 'scanning_qr' && (
                    <div className="w-64 h-64 sm:w-80 sm:h-80 relative animate-in fade-in duration-500">
                        {/* Glowing corners */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-2xl shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                        
                        {/* Scanning Line Animation */}
                        <div className="absolute w-[90%] h-0.5 bg-blue-400 shadow-[0_0_25px_rgba(96,165,250,1)] left-[5%] top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                        
                        {/* Grid Effect */}
                        <div className="absolute inset-4 border border-blue-500/10 grid grid-cols-3 grid-rows-3 rounded-lg"></div>
                    </div>
                )}
                
                {/* Face Guide */}
                {step === 'verifying_face' && (
                     <div className={`w-64 h-80 sm:w-80 sm:h-96 border-4 rounded-[45%] relative transition-all duration-300
                        ${isFaceDetected 
                            ? 'border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.5)] scale-105' 
                            : 'border-white/20 shadow-none scale-100'}
                      `}>
                        {!isFaceDetected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-white font-bold bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md animate-pulse border border-white/10 text-xs tracking-widest uppercase">
                                    Align Face
                                </p>
                            </div>
                        )}
                        {isFaceDetected && (
                             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-emerald-900/80 text-emerald-100 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
                                 Target Locked
                             </div>
                        )}
                     </div>
                )}
            </div>

            {/* ERROR / FAILURE MODAL */}
            {step === 'failure' && (
                <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-slate-900/90 border border-white/10 p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none"></div>
                        
                        {retryCount >= MAX_RETRIES ? (
                            <>
                                <ShieldAlert size={80} className="text-red-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                                <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">{t('accessDenied')}</h3>
                                <p className="text-slate-400 mb-8 font-medium">Security Limit Reached</p>
                                <button onClick={resetScanner} className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold hover:bg-slate-200 pointer-events-auto transition uppercase tracking-widest text-sm shadow-lg">
                                    {t('backToScanning')}
                                </button>
                            </>
                        ) : (
                            <>
                                <XCircle size={80} className="text-rose-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{t('noMatch')}</h3>
                                <p className="text-slate-400 mb-8">Biometric Mismatch Detected</p>
                                <button onClick={handleRetry} className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 pointer-events-auto transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm shadow-lg shadow-rose-900/50">
                                    <RefreshCcw size={18}/> {t('tryAgain')} <span className="opacity-50">({retryCount}/{MAX_RETRIES})</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
      </div>

      {/* STUDENT INFO BANNER (Success/Verification) - Modernized */}
      {identifiedStudent && step !== 'failure' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-slate-950/95 to-transparent pt-24 pb-12 px-6 z-40">
            <div className="flex items-center gap-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-500"> 
                {matchedPhoto ? (
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-75"></div>
                        <img src={matchedPhoto} alt="Student" className="relative w-24 h-24 rounded-full border-4 border-slate-900 object-cover shadow-2xl" />
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/10 shadow-xl">
                        <User size={40} className="text-white/30" />
                    </div>
                )}
                <div className="text-white">
                    <h1 className="text-4xl font-black leading-none mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        {identifiedStudent.firstName} {identifiedStudent.lastName}
                    </h1>
                    <div className="flex items-center gap-3 text-slate-300">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-sm font-bold border border-white/10">
                            {identifiedStudent.gradeLevel} - {identifiedStudent.section}
                        </span>
                        <span className="font-mono text-sm tracking-widest opacity-60">
                            ID: <span className="text-white font-bold">{identifiedStudent.id}</span>
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