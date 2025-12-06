import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import { verifyFace } from '../services/geminiService';
import { CheckCircle, XCircle, User, ScanFace, QrCode, RefreshCcw, ShieldAlert } from 'lucide-react';
import { Student } from '../types';

// Ses Dosyaları (URL'leri kendi dosyalarınızla değiştirebilirsiniz)
const AUDIO = {
  BEEP: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),
  SUCCESS: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
  FAIL: new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3')
};

type ScanStep = 'idle' | 'scanning_qr' | 'verifying_face' | 'success' | 'failure';

const Scanner = () => {
  const { students, markAttendance, t, navigateTo, settings } = useAppContext();
  
  // State Tanımları
  const [step, setStep] = useState<ScanStep>('scanning_qr');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>("Please scan your ID Card's QR CODE");
  const [matchedPhoto, setMatchedPhoto] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [triggerCapture, setTriggerCapture] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const MAX_RETRIES = 3;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Component unmount olduğunda timer'ları temizle (Memory Leak Önlemi)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Güvenli Timeout Fonksiyonu
  const safeTimeout = useCallback((callback: () => void, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(callback, ms);
  }, []);

  const playSound = (type: 'BEEP' | 'SUCCESS' | 'FAIL') => {
    try {
      AUDIO[type].currentTime = 0;
      AUDIO[type].play().catch(() => {}); // Hata olursa yoksay
    } catch (e) {}
  };

  const handleQrDetected = (code: string) => {
    if (step !== 'scanning_qr') return;

    const student = students.find(s => s.id === code);
    
    if (student) {
        playSound('BEEP');
        setIdentifiedStudent(student);
        setStep('verifying_face');
        setRetryCount(0);
        setFeedback("Please stand in front of the camera");
        
        // Kullanıcıya hazırlanması için süre ver
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
            playSound('SUCCESS');
            setStep('success');
            setFeedback(t('verified'));
            setMatchedPhoto(identifiedStudent.photos[0]);
            setRetryCount(0);
            markAttendance(identifiedStudent.id, 'face_match', result.confidence, imageSrc);
            safeTimeout(() => resetScanner(), 3500);
        } else {
            handleFailure();
        }
    } catch (err) {
        handleFailure(true);
    }
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
      setFeedback("Please stand in front of the camera");
      safeTimeout(() => setTriggerCapture(true), 1000);
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

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className={`h-16 flex items-center justify-between px-6 transition-colors duration-500 border-b border-white/10 relative z-50
        ${step === 'success' ? 'bg-green-600' : step === 'failure' ? 'bg-red-600' : 'bg-slate-900'}`}>
          
          <div className="flex items-center gap-4 text-white">
            {step === 'scanning_qr' && <QrCode className="animate-pulse" />}
            {step === 'verifying_face' && <ScanFace className="animate-pulse text-yellow-400" />}
            {step === 'success' && <CheckCircle />}
            {step === 'failure' && <XCircle />}
            <h2 className="text-lg font-bold uppercase hidden sm:block">
                {step === 'scanning_qr' ? "Ready to Scan" : step === 'verifying_face' ? "Verifying..." : step === 'success' ? "Access Granted" : "Access Denied"}
            </h2>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
             <p className="text-sm font-medium text-white/90 whitespace-nowrap">{feedback}</p>
          </div>

          <button onClick={() => navigateTo('dashboard')} className="text-white/70 hover:text-white text-xs uppercase font-bold border border-white/20 px-4 py-2 rounded-lg transition hover:bg-white/10">Exit</button>
      </div>

      {/* CAMERA & OVERLAY */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
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
            
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* QR Guide */}
                {step === 'scanning_qr' && (
                    <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-white/30 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-xl"></div>
                        <div className="absolute w-[90%] h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,1)] left-[5%] top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                )}
                
                {/* Face Guide - BURASI İSTEDİĞİNİZ KISIM */}
                {step === 'verifying_face' && (
                     <div className={`w-48 h-64 sm:w-60 sm:h-72 border-4 rounded-[45%] relative transition-all duration-300
                        ${isFaceDetected 
                            ? 'border-green-500/80 shadow-[0_0_60px_rgba(34,197,94,0.5)] scale-105' // Yüz algılandı (Yeşil)
                            : 'border-red-500/80 shadow-[0_0_60px_rgba(239,68,68,0.5)] scale-100'   // Yüz Yok/Hatalı (Kırmızı)
                        }
                      `}>
                        {!isFaceDetected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-white font-bold bg-red-600/80 px-4 py-2 rounded-lg backdrop-blur-sm animate-pulse shadow-lg">
                                    ALIGN FACE
                                </p>
                            </div>
                        )}
                     </div>
                )}
            </div>

            {/* FAILURE MODAL */}
            {step === 'failure' && (
                <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                        <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">{t('noMatch')}</h3>
                        <p className="text-slate-400 mb-6">Verification failed.</p>
                        <button onClick={retryCount >= MAX_RETRIES ? resetScanner : handleRetry} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 pointer-events-auto transition">
                            {retryCount >= MAX_RETRIES ? t('backToScanning') : `${t('tryAgain')} (${retryCount}/${MAX_RETRIES})`}
                        </button>
                    </div>
                </div>
            )}
      </div>

      {/* STUDENT BANNER */}
      {identifiedStudent && step !== 'failure' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-8 px-6 z-40">
            <div className="flex items-center gap-6 max-w-4xl mx-auto"> 
                {matchedPhoto ? (
                    <img src={matchedPhoto} className="w-20 h-20 rounded-full border-4 border-green-500 object-cover shadow-lg" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/10"><User size={32} className="text-white/30" /></div>
                )}
                <div className="text-white">
                    <h1 className="text-3xl font-bold leading-none mb-2">{identifiedStudent.firstName} {identifiedStudent.lastName}</h1>
                    <span className="px-3 py-1 bg-white/10 rounded-md text-sm font-bold text-white border border-white/10">{identifiedStudent.gradeLevel} - {identifiedStudent.section}</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;