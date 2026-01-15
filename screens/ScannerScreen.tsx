import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, ZapOff, Keyboard, Layers, ScanLine, Maximize, Target, RefreshCw, Beaker } from 'lucide-react';
import { AppScreen } from '../types';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onScanSuccess: (rawCode: string, quantity?: number) => void;
}

interface DetectionBox {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, onScanSuccess }) => {
  const [flashOn, setFlashOn] = useState(false);
  const [mode, setMode] = useState<'BARCODE' | 'COUNT'>('BARCODE');
  const [detectedCount, setDetectedCount] = useState(0);
  const [boxes, setBoxes] = useState<DetectionBox[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  // Initialize Real Camera
  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        // Broad support for all major barcode types
        const formatsToSupport = [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.DATA_MATRIX
        ];

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15, // Higher FPS for better scanning
            qrbox: { width: 280, height: 280 },
            // Removed aspectRatio to prevent OverconstrainedError on devices that don't support the exact window ratio
            formatsToSupport: formatsToSupport
          },
          (decodedText) => {
             // Success callback
             if (mounted && !isCapturing) {
               handleRealScan(decodedText);
             }
          },
          (errorMessage) => {
            // Error callback (scanning...)
          }
        );
        isScanningRef.current = true;
      } catch (err: any) {
        console.error("Error starting scanner", err);
        // Handle specific OverconstrainedError if it still happens despite removing aspectRatio
        const msg = err?.name === 'OverconstrainedError' 
            ? "Camera constraints not supported by this device." 
            : "Camera access denied or unavailable.";
        if (mounted) setCameraError(msg);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => startScanner(), 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (scannerRef.current && isScanningRef.current) {
         scannerRef.current.stop().then(() => {
             scannerRef.current?.clear();
         }).catch(console.error);
         isScanningRef.current = false;
      }
    };
  }, []); // Run once on mount

  // Handle flashlight toggle (if supported by device)
  useEffect(() => {
    if (scannerRef.current && isScanningRef.current) {
        // applyVideoConstraints returns a Promise. We must catch errors to prevent unhandled rejections
        // which manifest as "Unsupported constraint" on devices without torch support.
        scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: flashOn }]
        } as any).catch((err) => {
            console.debug("Torch not supported on this device:", err);
            // Optionally reset flash state if it failed
            // if (flashOn) setFlashOn(false); 
        });
    }
  }, [flashOn]);

  // Simulation loop for YOLO v9 Object Detection (Visual Overlay Only)
  useEffect(() => {
    if (mode !== 'COUNT') {
      setBoxes([]);
      setDetectedCount(0);
      return;
    }
    
    // We keep the overlay "AR" style boxes on top of the real camera feed
    const interval = setInterval(() => {
      const time = Date.now();
      const baseCount = 5; 
      const newBoxes: DetectionBox[] = [];
      for (let i = 0; i < baseCount; i++) {
        const driftX = Math.sin(time / 800 + i) * 3; 
        const driftY = Math.cos(time / 1200 + i * 2) * 2;
        const conf = 0.88 + (Math.sin(time / 500 + i) * 0.05);

        newBoxes.push({
          id: i,
          x: 20 + (i * 14) + driftX, 
          y: 35 + (i % 2 === 0 ? -8 : 8) + driftY,
          w: 12 + Math.sin(time / 600) * 1,
          h: 12 + Math.cos(time / 600) * 1,
          confidence: conf
        });
      }
      setBoxes(newBoxes);
      setDetectedCount(baseCount);
    }, 50);

    return () => clearInterval(interval);
  }, [mode]);

  const handleRealScan = (decodedText: string) => {
      // Vibrate if possible
      if (navigator.vibrate) navigator.vibrate(200);
      
      // Stop scanning to prevent duplicate reads
      if (scannerRef.current && isScanningRef.current) {
          scannerRef.current.pause(true);
      }
      
      setIsCapturing(true);
      setTimeout(() => {
         onScanSuccess(decodedText, 1);
      }, 500);
  };

  const handleSimulation = () => {
      setIsCapturing(true);
      // Fallback Mock Data generation ONLY for simulation button
      setTimeout(() => {
          if (mode === 'BARCODE') {
              // Mock GS1
              const gtin = '00885544' + Math.floor(100000 + Math.random() * 900000);
              const date = new Date();
              date.setDate(date.getDate() + Math.floor(Math.random() * 365));
              const yy = date.getFullYear().toString().substr(-2);
              const mm = (date.getMonth() + 1).toString().padStart(2, '0');
              const dd = date.getDate().toString().padStart(2, '0');
              const lot = 'L' + Math.floor(Math.random() * 9999);
              const mockUDI = `(01)${gtin}(17)${yy}${mm}${dd}(10)${lot}`;
              onScanSuccess(mockUDI, 1);
          } else {
              // Mock Count
              const mockUDI = `(01)BATCH${Math.floor(Math.random() * 90000)}(10)AUTO-COUNT`;
              onScanSuccess(mockUDI, detectedCount || 5);
          }
      }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full font-sans overflow-hidden">
      
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-8 flex justify-between items-center z-30">
        <button 
            onClick={() => onNavigate(AppScreen.DASHBOARD)}
            className="p-2 text-white bg-black/20 backdrop-blur-md rounded-full hover:bg-white/10 transition-colors"
        >
            <X size={24} />
        </button>
        
        {/* Mode Toggle Pill */}
        <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button 
            onClick={() => setMode('BARCODE')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${mode === 'BARCODE' ? 'bg-white text-black shadow-sm' : 'text-white/70 hover:text-white'}`}
          >
            Scan
          </button>
          <button 
            onClick={() => setMode('COUNT')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${mode === 'COUNT' ? 'bg-indigo-500 text-white shadow-sm' : 'text-white/70 hover:text-white'}`}
          >
            <Layers size={12} />
            AI Count
          </button>
        </div>

        {/* Debug / Simulate Button */}
        <button 
            onClick={handleSimulation}
            className="p-2 text-white bg-blue-600/30 backdrop-blur-md rounded-full hover:bg-blue-600/50 transition-colors border border-blue-500/50"
            title="Simulate Scan (Test Mode)"
        >
            <Beaker size={20} />
        </button>
      </div>

      {/* Camera View Area */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
         {/* The ID 'reader' is used by html5-qrcode library */}
         <div id="reader" className="w-full h-full object-cover"></div>

         {/* Error State */}
         {cameraError && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-6 text-center">
                 <div>
                    <RefreshCw size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold mb-2">Camera Unavailable</p>
                    <p className="text-sm text-gray-400 mb-4">{cameraError}</p>
                    <button 
                        onClick={handleSimulation}
                        className="bg-blue-600 px-6 py-2 rounded-full text-sm font-medium"
                    >
                        Run Test Simulation
                    </button>
                 </div>
             </div>
         )}

         {/* --- BARCODE MODE OVERLAY --- */}
         <div className={`absolute inset-0 transition-opacity duration-500 flex items-center justify-center p-8 ${mode === 'BARCODE' ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'}`}>
            {!cameraError && (
                <>
                <div className="w-full aspect-square max-w-xs relative rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                    {/* Corner Markers */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl shadow-sm"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl shadow-sm"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl shadow-sm"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl shadow-sm"></div>
                    
                    {/* Scanning Laser */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-blue-500/40 border-b-2 border-blue-400 animate-scan"></div>
                    
                    {/* Center Reticle */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <ScanLine size={48} className="text-white" />
                    </div>
                </div>
                <div className="absolute bottom-32 left-0 right-0 text-center">
                <p className="text-white font-medium text-sm bg-black/50 inline-block px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
                    Scanning automatic...
                </p>
                </div>
                </>
            )}
         </div>

         {/* --- YOLO COUNT MODE OVERLAY --- */}
         <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${mode === 'COUNT' ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'}`}>
             {/* Model Info Overlay */}
             <div className="absolute top-24 right-4 text-right pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-md text-indigo-300 text-[10px] font-mono p-2 rounded-lg border border-indigo-500/30 shadow-lg">
                  <p className="mb-1 flex items-center justify-end gap-1"><Target size={10} /> YOLOv9-c <span className="text-white">Active</span></p>
                  <p>Inference: <span className="text-white">24ms</span></p>
                </div>
             </div>

             {/* Bounding Boxes */}
             {boxes.map((box) => (
               <div
                  key={box.id}
                  className="absolute border-2 border-indigo-400 bg-indigo-500/20 rounded-lg transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`
                  }}
               >
                 <div className="absolute -top-7 left-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    ITEM {(box.confidence * 100).toFixed(0)}%
                 </div>
               </div>
             ))}

             {/* Prominent Count Display HUD */}
             <div className="absolute bottom-36 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/70 backdrop-blur-xl border border-indigo-500/50 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-6 transform transition-all duration-300 hover:scale-105 pointer-events-auto">
                  <div className="flex flex-col items-center">
                      <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-0.5">Detected</span>
                      <span className="text-4xl font-mono font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200">
                          {detectedCount}
                      </span>
                  </div>
                  <div className="h-10 w-px bg-white/10"></div>
                  <div className="text-indigo-400 flex flex-col items-center gap-1">
                      <Layers size={24} />
                      <span className="text-[9px] font-medium opacity-80">AUTO</span>
                  </div>
                </div>
             </div>
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/80 backdrop-blur-xl p-8 pb-12 flex flex-col items-center gap-6 z-20 border-t border-white/5 relative">
         <div className="flex items-center gap-12 w-full justify-center">
            <button 
                className="text-white/60 flex flex-col items-center gap-2 hover:text-white transition-colors group"
                onClick={() => onNavigate(AppScreen.DATA_REVIEW)} 
            >
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                    <Keyboard size={24} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wide">Manual</span>
            </button>

            {/* FLASHLIGHT / VISUAL INDICATOR BUTTON (No longer generates mock data) */}
            <button 
                onClick={() => setFlashOn(!flashOn)}
                disabled={isCapturing}
                className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center bg-transparent active:scale-95 transition-all duration-200
                  ${mode === 'COUNT' ? 'border-indigo-500' : 'border-white'}
                  ${isCapturing ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                `}
            >
                <div className={`w-16 h-16 rounded-full transition-colors duration-300 flex items-center justify-center
                   ${mode === 'COUNT' ? 'bg-indigo-500' : 'bg-white'}
                `}>
                   {flashOn ? <Zap className="text-black/50" /> : <ZapOff className="text-black/50" />}
                </div>
            </button>
            
            <div className="w-12 flex flex-col items-center text-white/40">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Maximize size={20} />
                 </div>
                 <span className="text-[10px] font-medium mt-2 uppercase">Full</span>
            </div>
         </div>
         {isCapturing && (
             <p className="text-white/90 text-sm font-medium animate-pulse bg-black/50 px-3 py-1 rounded-full absolute bottom-4">
                Processing...
             </p>
         )}
      </div>

      <style>{`
        @keyframes scan {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(200%); opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};