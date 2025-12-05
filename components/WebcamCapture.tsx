import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Loader2, Check, X } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onQrDetected?: (code: string) => void; 
  label?: string;
  autoStart?: boolean;
  mode?: 'simple' | 'registration' | 'scanner';
  pauseScan?: boolean; 
  triggerCapture?: boolean; // New prop to trigger capture externally
  className?: string;
}

declare global {
  interface Window {
    blazeface: any;
    tf: any;
    jsQR: any; 
  }
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
    onCapture, 
    onQrDetected,
    label = "Capture Photo", 
    autoStart = true,
    mode = 'simple',
    pauseScan = false,
    triggerCapture = false,
    className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisRef = useRef<number | null>(null);
  const modelRef = useRef<any>(null);
  
  const [error, setError] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Registration Mode State
  const [faceBox, setFaceBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [isSharp, setIsSharp] = useState(false);
  const [isAligned, setIsAligned] = useState(false);

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
      
      let mediaStream;
      try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: mode === 'registration' ? 'user' : 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
          });
      } catch (err) {
          console.warn("High-spec camera request failed, retrying with defaults...", err);
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      streamRef.current = mediaStream;
      setIsActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions or hardware.");
      setIsActive(false);
      setIsVideoReady(false);
    }
  }, [stopCamera, mode]);

  useEffect(() => {
    if (mode === 'registration' && !modelRef.current && window.blazeface) {
        window.blazeface.load().then((model: any) => {
            modelRef.current = model;
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
        
        if (mode === 'registration') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.95);
      }
    }
    return null;
  }, [isVideoReady, mode]);

  // Handle external trigger for capture (e.g. from Scanner)
  useEffect(() => {
    if (triggerCapture && isVideoReady) {
        const img = captureFrame();
        if (img) {
            onCapture(img);
        }
    }
  }, [triggerCapture, isVideoReady, captureFrame, onCapture]);

  // Analysis Loop
  useEffect(() => {
    if (!isVideoReady || capturedImage || pauseScan) {
        if (analysisRef.current) cancelAnimationFrame(analysisRef.current);
        return;
    }

    let consecutiveGoodFrames = 0;
    let lastTime = 0;

    const analyze = async (time: number) => {
        if (time - lastTime < 100) { 
            analysisRef.current = requestAnimationFrame(analyze);
            return;
        }
        lastTime = time;

        if (!videoRef.current || !canvasRef.current) {
             analysisRef.current = requestAnimationFrame(analyze);
             return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // --- QR SCANNER LOGIC ---
        if (mode === 'scanner' && window.jsQR && onQrDetected) {
             if (video.videoWidth > 0) {
                 canvas.width = video.videoWidth;
                 canvas.height = video.videoHeight;
                 if(ctx) {
                     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                     const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                         inversionAttempts: "dontInvert",
                     });

                     if (code && code.data) {
                         onQrDetected(code.data); 
                         return; 
                     }
                 }
             }
        }

        // --- REGISTRATION LOGIC ---
        if (mode === 'registration' && modelRef.current) {
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
                
                const rawX = start[0];
                const rawY = start[1];
                const rawW = size[0];
                const rawH = size[1];

                const videoW = video.videoWidth;
                const videoH = video.videoHeight;

                const uiX = 100 - ((rawX + rawW) / videoW * 100); 
                const uiY = (rawY / videoH) * 100;
                const uiW = (rawW / videoW) * 100;
                const uiH = (rawH / videoH) * 100;
                
                setFaceBox({ x: uiX, y: uiY, w: uiW, h: uiH });

                if (ctx) {
                    const sampleSize = 64;
                    canvas.width = sampleSize;
                    canvas.height = sampleSize;
                    ctx.drawImage(video, rawX, rawY, rawW, rawH, 0, 0, sampleSize, sampleSize);
                    
                    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
                    const data = imageData.data;
                    
                    let sumDiff = 0;
                    for(let i=0; i<data.length; i+=4) {
                        if (i % (sampleSize*4) < (sampleSize-1)*4) {
                            sumDiff += Math.abs(data[i] - data[i+4]);
                        }
                    }
                    const score = sumDiff / (sampleSize * sampleSize);
                    const sharp = score > 15; 
                    setIsSharp(sharp);

                    const ovalCW = 0.5; 
                    const ovalCH = 0.5; 
                    const faceCX = (rawX + rawW/2) / videoW;
                    const faceCY = (rawY + rawH/2) / videoH;

                    const centered = Math.abs(faceCX - ovalCW) < 0.1 && Math.abs(faceCY - ovalCH) < 0.1;
                    // Adjusted for smaller face relative to screen (since oval is smaller)
                    // Updated logic for narrower oval: Face should be between 15% and 40% of screen width.
                    const sized = (rawW / videoW) > 0.15 && (rawW / videoW) < 0.40;

                    const aligned = centered && sized;
                    setIsAligned(aligned);

                    if (sharp && aligned) {
                        consecutiveGoodFrames++;
                    } else {
                        consecutiveGoodFrames = 0;
                    }

                    if (consecutiveGoodFrames > 8) {
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
        }

        analysisRef.current = requestAnimationFrame(analyze);
    };

    analysisRef.current = requestAnimationFrame(analyze);

    return () => {
        if (analysisRef.current) cancelAnimationFrame(analysisRef.current);
    };
  }, [isVideoReady, mode, capturedImage, pauseScan, captureFrame, onQrDetected, triggerCapture]);


  const handleVideoPlaying = () => {
     if (!isVideoReady && !timeoutRef.current) {
         timeoutRef.current = setTimeout(() => {
             if (videoRef.current && videoRef.current.readyState >= 3) {
                 setIsVideoReady(true);
             } else {
                 const check = setInterval(() => {
                     if (videoRef.current && videoRef.current.readyState >= 3) {
                         setIsVideoReady(true);
                         clearInterval(check);
                     }
                 }, 200);
             }
         }, 1000); 
     }
  };

  const handleConfirm = () => {
      if (capturedImage) {
          onCapture(capturedImage);
          setCapturedImage(null);
          setIsVideoReady(false);
          setTimeout(() => setIsVideoReady(true), 500);
      }
  };

  const handleRetake = () => {
      setCapturedImage(null);
      setFaceBox(null);
      setIsVideoReady(false);
      setTimeout(() => setIsVideoReady(true), 500);
  };

  useEffect(() => {
    if (autoStart) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [autoStart, startCamera, stopCamera]);

  return (
    <div className={`relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl isolate group ${mode === 'scanner' ? 'aspect-auto' : 'aspect-[4/3]'} ${className}`}>
      
      <div className="absolute inset-0 bg-black z-0"></div>

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

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlaying={handleVideoPlaying} 
        className={`relative z-10 w-full h-full object-cover transition-opacity duration-500 bg-black object-contain ${
            (isActive && isVideoReady && !capturedImage) ? 'opacity-100' : 'opacity-0 invisible'
        } ${mode === 'registration' ? 'transform scale-x-[-1]' : ''}`} 
      />

      {capturedImage && mode === 'registration' && (
          <div className="absolute inset-0 z-40 bg-black flex items-center justify-center animate-in fade-in duration-300">
              <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-6">
                  <button onClick={handleRetake} className="flex flex-col items-center gap-2 text-red-400 hover:text-red-300 transition">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50"><X size={24} /></div>
                  </button>
                  <button onClick={handleConfirm} className="flex flex-col items-center gap-2 text-green-400 hover:text-green-300 transition">
                       <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500"><Check size={28} /></div>
                  </button>
              </div>
          </div>
      )}

      {mode === 'registration' && isActive && isVideoReady && !capturedImage && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {/* UPDATED OVAL SHAPE: Vertical Ellipse, smaller width */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[55%] rounded-[50%] border-[3px] transition-all duration-300 ${isAligned ? 'border-green-400 bg-green-400/10' : 'border-white/30 border-dashed'}`} />
            {faceBox && (
                <div 
                    className={`absolute border-2 transition-all duration-100 ease-linear ${isSharp ? 'border-green-400' : 'border-red-500/80'}`}
                    style={{ left: `${faceBox.x}%`, top: `${faceBox.y}%`, width: `${faceBox.w}%`, height: `${faceBox.h}%` }}
                />
            )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

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