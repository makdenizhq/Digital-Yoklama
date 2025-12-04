import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Loader2, Check, X } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  label?: string;
  autoStart?: boolean;
  mode?: 'simple' | 'registration';
}

declare global {
  interface Window {
    blazeface: any;
    tf: any;
  }
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
    onCapture, 
    label = "Capture Photo", 
    autoStart = true,
    mode = 'simple' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analysisRef = useRef<number | null>(null);
  const modelRef = useRef<any>(null);
  
  const [error, setError] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  // Registration Mode State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Smart Guides State
  const [faceBox, setFaceBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [isSharp, setIsSharp] = useState(false); // Controls Square Color (Green = Sharp)
  const [isAligned, setIsAligned] = useState(false); // Controls Oval Color (Green = Centered & Sized)

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (analysisRef.current) cancelAnimationFrame(analysisRef.current);
    timeoutRef.current = null;
    analysisRef.current = null;
  }, []);

  const stopCamera = useCallback(() => {
    cleanup();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setIsVideoReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [cleanup]);

  const startCamera = useCallback(async () => {
    try {
      stopCamera(); 
      setError('');
      setIsVideoReady(false);
      setCapturedImage(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
      });
      
      streamRef.current = mediaStream;
      setIsActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // The event listener is handled in the JSX `onPlaying`
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
      setIsActive(false);
      setIsVideoReady(false);
    }
  }, [stopCamera]);

  // Load Face Model
  useEffect(() => {
    if (mode === 'registration' && !modelRef.current && window.blazeface) {
        window.blazeface.load().then((model: any) => {
            modelRef.current = model;
            console.log("Face model loaded");
        });
    }
  }, [mode]);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current && isVideoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.95);
      }
    }
    return null;
  }, [isVideoReady]);

  // Analysis Loop
  useEffect(() => {
    if (!isVideoReady || mode !== 'registration' || capturedImage) {
        if (analysisRef.current) cancelAnimationFrame(analysisRef.current);
        return;
    }

    let consecutiveGoodFrames = 0;
    let lastTime = 0;

    const analyze = async (time: number) => {
        if (time - lastTime < 100) { // Limit to ~10 FPS to save CPU
            analysisRef.current = requestAnimationFrame(analyze);
            return;
        }
        lastTime = time;

        if (!videoRef.current || !canvasRef.current || !modelRef.current) {
             analysisRef.current = requestAnimationFrame(analyze);
             return;
        }

        const video = videoRef.current;
        
        // 1. Detect Face
        let predictions = [];
        try {
            predictions = await modelRef.current.estimateFaces(video, false);
        } catch (e) {
            console.warn("Detection error", e);
        }

        if (predictions.length > 0) {
            const start = predictions[0].topLeft;
            const end = predictions[0].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            
            // Normalize Coordinates (0-1)
            // Note: video is mirrored via CSS, but model coordinates are natural. 
            // We need to flip X for UI display.
            const rawX = start[0];
            const rawY = start[1];
            const rawW = size[0];
            const rawH = size[1];

            const videoW = video.videoWidth;
            const videoH = video.videoHeight;

            // UI Box (Percentage based) - Flip X for mirrored view
            const uiX = 100 - ((rawX + rawW) / videoW * 100); 
            const uiY = (rawY / videoH) * 100;
            const uiW = (rawW / videoW) * 100;
            const uiH = (rawH / videoH) * 100;
            
            setFaceBox({ x: uiX, y: uiY, w: uiW, h: uiH });

            // 2. Check Sharpness (Crop face area and calculate variance)
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                // Draw a small version of the face for pixel analysis
                const sampleSize = 64;
                canvas.width = sampleSize;
                canvas.height = sampleSize;
                ctx.drawImage(video, rawX, rawY, rawW, rawH, 0, 0, sampleSize, sampleSize);
                
                const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
                const data = imageData.data;
                
                // Simple Laplacian-like edge check or Variance
                let sumDiff = 0;
                for(let i=0; i<data.length; i+=4) {
                    // Compare with right neighbor
                    if (i % (sampleSize*4) < (sampleSize-1)*4) {
                        sumDiff += Math.abs(data[i] - data[i+4]);
                    }
                }
                const score = sumDiff / (sampleSize * sampleSize);
                const sharp = score > 15; // Tuning threshold
                setIsSharp(sharp);

                // 3. Check Oval Alignment
                // Oval Definition: Centered, width ~40%, height ~60%
                const ovalCW = 0.5; // Center X
                const ovalCH = 0.5; // Center Y
                const faceCX = (rawX + rawW/2) / videoW;
                const faceCY = (rawY + rawH/2) / videoH;

                // Distance from center (0.1 = 10% tolerance)
                const centered = Math.abs(faceCX - ovalCW) < 0.1 && Math.abs(faceCY - ovalCH) < 0.1;
                
                // Size Check (Face width should be roughly 40-70% of screen width? No, relative to oval)
                // Let's say face should be substantial.
                const sized = (rawW / videoW) > 0.15 && (rawW / videoW) < 0.55;

                const aligned = centered && sized;
                setIsAligned(aligned);

                // 4. Auto Capture Trigger
                if (sharp && aligned) {
                    consecutiveGoodFrames++;
                } else {
                    consecutiveGoodFrames = 0;
                }

                if (consecutiveGoodFrames > 8) { // ~1 second approx
                     const fullImg = captureFrame();
                     if (fullImg) setCapturedImage(fullImg);
                }
            }

        } else {
            setFaceBox(null);
            setIsSharp(false);
            setIsAligned(false);
            consecutiveGoodFrames = 0;
        }

        analysisRef.current = requestAnimationFrame(analyze);
    };

    analysisRef.current = requestAnimationFrame(analyze);

    return () => {
        if (analysisRef.current) cancelAnimationFrame(analysisRef.current);
    };
  }, [isVideoReady, mode, capturedImage, captureFrame]);


  const handleVideoPlaying = () => {
     // Strict Warm-up sequence
     // 1. Wait for playback to actually start
     // 2. Wait an additional 1.5s (blind time) to let Auto-Exposure stabilize
     // 3. Reveal video
     if (!isVideoReady && !timeoutRef.current) {
         timeoutRef.current = setTimeout(() => {
             // Double check readyState
             if (videoRef.current && videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
                 setIsVideoReady(true);
             } else {
                 // Fallback poll
                 const check = setInterval(() => {
                     if (videoRef.current && videoRef.current.readyState >= 3) {
                         setIsVideoReady(true);
                         clearInterval(check);
                     }
                 }, 200);
             }
         }, 1500); // 1.5s blind warm-up
     }
  };

  const handleManualCapture = () => {
      const img = captureFrame();
      if (img) {
          if (mode === 'registration') {
              setCapturedImage(img);
          } else {
              onCapture(img);
          }
      }
  };

  const handleConfirm = () => {
      if (capturedImage) {
          onCapture(capturedImage);
          setCapturedImage(null);
          setIsVideoReady(false);
          setFaceBox(null);
          setTimeout(() => setIsVideoReady(true), 500);
      }
  };

  const handleRetake = () => {
      setCapturedImage(null);
      setFaceBox(null);
      setIsVideoReady(false);
      setTimeout(() => setIsVideoReady(true), 500);
  };

  // Lifecycle
  useEffect(() => {
    if (autoStart) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [autoStart, startCamera, stopCamera]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-2xl isolate group">
      
      {/* Background */}
      <div className="absolute inset-0 bg-black z-0"></div>

      {/* Loading / Error States */}
      {isActive && !isVideoReady && !error && (
         <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white/80 bg-black backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
            <span className="text-sm font-medium tracking-wide animate-pulse">Starting Camera...</span>
         </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-6 text-center bg-gray-900 z-30">
          <div className="bg-red-500/10 p-4 rounded-full mb-3"><Camera size={32} /></div>
          <p className="font-medium">{error}</p>
          <button onClick={startCamera} className="mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm text-white">Retry</button>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlaying={handleVideoPlaying} 
        className={`relative z-10 w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 bg-black ${
            (isActive && isVideoReady && !capturedImage) ? 'opacity-100' : 'opacity-0 invisible'
        }`}
      />

      {/* Captured Image Preview Overlay */}
      {capturedImage && (
          <div className="absolute inset-0 z-40 bg-black flex items-center justify-center animate-in fade-in duration-300">
              <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-6">
                  <button 
                    onClick={handleRetake}
                    className="flex flex-col items-center gap-2 text-red-400 hover:text-red-300 transition"
                  >
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                          <X size={24} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">Delete</span>
                  </button>

                  <button 
                    onClick={handleConfirm}
                    className="flex flex-col items-center gap-2 text-green-400 hover:text-green-300 transition"
                  >
                       <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500">
                          <Check size={28} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">Confirm</span>
                  </button>
              </div>
          </div>
      )}

      {/* --- REGISTRATION SMART GUIDES --- */}
      {mode === 'registration' && isActive && isVideoReady && !capturedImage && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            
            {/* 1. OVAL GUIDE (Static, Centered) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[60%] rounded-[50%] border-[3px] transition-all duration-300 ${
                isAligned ? 'border-green-400 bg-green-400/10 shadow-[0_0_30px_rgba(74,222,128,0.3)]' : 'border-white/30 border-dashed'
            }`}>
                 <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm transition-colors ${
                     isAligned ? 'bg-green-500 text-white' : 'bg-black/50 text-white/70'
                 }`}>
                    {isAligned ? 'Position Good' : 'Fit Face in Oval'}
                 </div>
            </div>

            {/* 2. SQUARE GUIDE (Dynamic, Tracks Face) */}
            {faceBox && (
                <div 
                    className={`absolute border-2 transition-all duration-100 ease-linear ${
                        isSharp ? 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'border-red-500/80'
                    }`}
                    style={{
                        left: `${faceBox.x}%`,
                        top: `${faceBox.y}%`,
                        width: `${faceBox.w}%`,
                        height: `${faceBox.h}%`
                    }}
                >
                     <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm transition-colors ${
                         isSharp ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                     }`}>
                        {isSharp ? 'Focus Locked' : 'Hold Steady'}
                     </div>
                </div>
            )}
            
            {/* Helper Text if no face detected */}
            {!faceBox && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md animate-pulse">
                        Detecting Face...
                    </span>
                </div>
            )}

        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Manual Capture Button (Simple Mode Only) */}
      {mode === 'simple' && isActive && isVideoReady && !capturedImage && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
           <button 
            onClick={handleManualCapture}
            className="bg-white rounded-full p-1 shadow-2xl hover:scale-105 transition active:scale-95"
          >
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent">
                 <div className="w-14 h-14 bg-red-500 rounded-full hover:bg-red-600 transition" />
            </div>
          </button>
        </div>
      )}
      
       {isActive && (
        <button 
          onClick={() => { stopCamera(); setTimeout(startCamera, 100); }}
          className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md z-30"
        >
          <RefreshCw size={18} />
        </button>
       )}
    </div>
  );
};

export default WebcamCapture;