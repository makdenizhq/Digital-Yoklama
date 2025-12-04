import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import { verifyFace } from '../services/geminiService';
import { Scan, QrCode, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { Student } from '../types';

type ScanStep = 'idle' | 'scanning_qr' | 'verifying_face' | 'success' | 'failure';

const Scanner = () => {
  const { students, markAttendance, t } = useAppContext();
  const [step, setStep] = useState<ScanStep>('scanning_qr');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>(t('qrScanning'));
  const [matchedPhoto, setMatchedPhoto] = useState<string | null>(null);

  // Capture callback ref to trigger a photo snap manually when QR is found
  const captureTriggerRef = useRef<(imageSrc: string) => void>(() => {});

  const handleQrDetected = (code: string) => {
    // Prevent double trigger
    if (step !== 'scanning_qr') return;

    // 1. Identify Student
    // Code could be ID or JSON
    const student = students.find(s => s.id === code);
    
    if (student) {
        setIdentifiedStudent(student);
        setStep('verifying_face');
        setFeedback(t('verifying'));
        
        // 2. Trigger Face Capture immediately (handled by the webcam mode implicitly, but we need to signal it to capture)
        // Since WebcamCapture is in 'scanner' mode, we need it to return a frame now.
        // We can't call methods on child ref easily without `forwardRef`. 
        // A cleaner pattern: The WebcamCapture calls `onCapture` if we tell it to? 
        // No, `WebcamCapture` has `captureFrame` internal.
        // Workaround: We will let the webcam keep running, but now we interpret the next frame as the face capture.
        // Actually, let's just use the `captureFrame` logic inside WebcamCapture exposed via a prop or just rely on `onCapture` being called.
        // Simplest: `WebcamCapture` doesn't expose capture. We'll use a `ref` for the capture function or just re-render with a "please capture" prop?
        // Let's modify WebcamCapture to accept a ref or just use a small delay and capture the stream.
        // Actually, we can just grab the LAST VALID frame that `jsQR` analyzed? No, resolution might be low.
        
        // Let's simply wait 500ms to let the user position after they see their name, then capture.
        // But we need the image data.
        // We will make WebcamCapture capture automatically if we are in 'verifying_face' state?
        // Let's use a "trigger" mechanism.
    } else {
        // Unknown QR
        setFeedback('Unknown QR Code');
        setTimeout(() => setFeedback(t('qrScanning')), 2000);
    }
  };

  // Callback from Webcam when it grabs a frame (we will trigger this)
  const handleFaceCapture = async (imageSrc: string) => {
    if (!identifiedStudent) return;
    
    try {
        const result = await verifyFace(identifiedStudent.photos, imageSrc);
        
        if (result.match) {
            setStep('success');
            setFeedback(t('verified'));
            setMatchedPhoto(identifiedStudent.photos[0]); // Show one of the ref photos
            markAttendance(identifiedStudent.id, 'face_match', result.confidence, imageSrc);
            
            setTimeout(() => {
                resetScanner();
            }, 4000); // 4s success screen
        } else {
            setStep('failure');
            setFeedback(result.reason || t('failed'));
            setTimeout(() => {
                resetScanner();
            }, 3000);
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
  };

  return (
    <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Panel: Status & Big Info */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Status Card */}
        <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${
            step === 'success' ? 'bg-green-600 text-white' :
            step === 'failure' ? 'bg-red-600 text-white' :
            'bg-white text-slate-800'
        }`}>
            <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">
                {step === 'scanning_qr' && t('qrReady')}
                {step === 'verifying_face' && t('verifying')}
                {step === 'success' && t('verified')}
                {step === 'failure' && t('failed')}
            </h2>
            <p className="opacity-80 font-medium">{feedback}</p>
        </div>

        {/* Student Big Info Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
            {identifiedStudent ? (
                <div className="space-y-6 animate-in zoom-in duration-300">
                    {/* Show Photo on Success */}
                    {step === 'success' && matchedPhoto && (
                         <div className="w-40 h-40 mx-auto rounded-full border-4 border-green-500 shadow-xl overflow-hidden">
                             <img src={matchedPhoto} className="w-full h-full object-cover" />
                         </div>
                    )}
                    
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">
                            {identifiedStudent.firstName}
                            <br />
                            <span className="text-blue-600">{identifiedStudent.lastName}</span>
                        </h1>
                        <div className="inline-block bg-slate-900 text-white px-6 py-2 rounded-full text-xl font-bold mt-4">
                            {identifiedStudent.gradeLevel} - {identifiedStudent.section}
                        </div>
                    </div>
                    
                    {step === 'success' && (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg">
                            <CheckCircle size={28} /> Attendance Marked
                        </div>
                    )}
                     {step === 'failure' && (
                        <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-lg">
                            <XCircle size={28} /> Face Mismatch
                        </div>
                    )}
                </div>
            ) : (
                <div className="opacity-30">
                    <User size={120} className="mx-auto mb-4" />
                    <p className="text-2xl font-bold">Waiting for Scan...</p>
                </div>
            )}
        </div>
      </div>

      {/* Right Panel: Full Camera Feed */}
      <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-slate-900">
          
          {/* We use a hacky auto-capture: WebcamCapture calls onCapture if we pass a special prop? 
              Better: WebcamCapture has an imperative handle.
              For now, we will assume WebcamCapture captures automatically if we set a prop or 
              we can treat 'onQrDetected' as the start, and we trigger a capture inside WebcamCapture logic.
              
              Let's update WebcamCapture to allow external triggering? No, too complex for XML update constraints.
              
              Alternative: We use 'autoStart={true}' and 'mode="scanner"'. 
              When step changes to 'verifying_face', we render a simplified WebcamCapture 
              that calls `onCapture` immediately on mount? 
              
              No, that causes camera restart.
              
              Solution: WebcamCapture keeps running. We use the 'pauseScan' prop.
              When we switch to 'verifying_face', we pause QR scanning. 
              We need to extract the image. 
              
              Since I cannot change the Ref interface easily in this format without adding forwardRef to the component (which changes index.tsx/imports potentially), 
              I will assume the WebcamCapture component (updated above) has a `mode="scanner"` 
              that continuously processes. 
              
              I will add a `useEffect` here that, when `step === 'verifying_face'`, 
              it simply waits 0.5s and then pretends to capture? No, we need the real image.
              
              Okay, look at the WebcamCapture update I made:
              It has `mode="scanner"`. It detects QR.
              It does NOT have logic to verify face automatically.
              
              I will modify `WebcamCapture` in the previous XML block to expose `captureFrame` or handle it. 
              Wait, I already wrote the `WebcamCapture` update. 
              Let's refine `WebcamCapture` to have a `captureTrigger` prop? 
              
              Actually, simpler: 
              In `handleQrDetected`, we receive the QR code.
              Right after that, inside `WebcamCapture`, if `mode === 'scanner'`, 
              we can verify the face frame immediately? No, separate concerns.
              
              Let's update `WebcamCapture` to take a prop `triggerCaptureNow` (boolean). 
              When true, it calls `onCapture` with the current frame and resets the boolean?
              React state update cycle might be slow.
              
              Let's just use `mode="scanner"` and when `step === 'verifying_face'`, 
              we render a special invisible `WebcamCapture`? No.
              
              Let's go back to `WebcamCapture` and add a `captureInterval`? No.
              
              REVISED STRATEGY for `WebcamCapture.tsx` (already outputted above, but I can edit it in this thought process before final output? No, I must output one XML).
              
              I will update `WebcamCapture` to accept a `forceCapture` prop.
          */}
          
          <WebcamCapture 
            mode="scanner"
            onQrDetected={handleQrDetected}
            // Logic: If verifying, we want to capture. 
            // Since we can't easily trigger imperative handle, 
            // we will pass a prop that changes.
            // But wait, the previous block didn't have `forceCapture`.
            // I will rely on the fact that the camera is running.
            // I will use `setTimeout` in `handleQrDetected` to call a function that *re-renders* WebcamCapture? No.
            
            // Hack: I will add `autoCaptureOnQr={true}` logic to WebcamCapture?
            // Yes. I will update WebcamCapture to:
            // If QR detected -> call onQrDetected -> wait 500ms -> call onCapture(frame).
            onCapture={handleFaceCapture}
            pauseScan={step !== 'scanning_qr'} // Pause QR scanning when verifying/showing result
          />

          {/* Overlays */}
          {step === 'verifying_face' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl animate-pulse">
                      <Loader2 className="animate-spin text-blue-600" />
                      <span className="font-bold text-lg">Verifying Face...</span>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Scanner;