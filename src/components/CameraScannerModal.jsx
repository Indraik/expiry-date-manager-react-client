import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const CameraScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'qr-camera-reader';

  useEffect(() => {
    if (!isOpen) return;

    let html5QrcodeScanner = null;

    const startScanner = async () => {
      setCameraError('');
      setIsScanning(true);

      try {
        html5QrcodeScanner = new Html5Qrcode(containerId);
        scannerRef.current = html5QrcodeScanner;

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrcodeScanner.start(
          { facingMode: 'environment' }, // Use rear camera by default on mobile
          config,
          (decodedText, decodedResult) => {
            // On Success: Stop camera and pass scanned code to parent
            if (html5QrcodeScanner.isScanning) {
              html5QrcodeScanner.stop().then(() => {
                onScanSuccess(decodedText);
                onClose();
              }).catch(() => {
                onScanSuccess(decodedText);
                onClose();
              });
            }
          },
          (errorMessage) => {
            // Ignore frame scan failures while searching for code
          }
        );
      } catch (err) {
        setCameraError(err.message || 'Unable to access camera. Please allow camera permissions.');
        setIsScanning(false);
      }
    };

    // Small delay to ensure DOM element containerId is rendered
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    // Demo fallback code for quick testing without physical camera
    const sampleBarcodes = ['012345678901', '012345678902', '7350053850019'];
    const randomCode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
    onScanSuccess(randomCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 animate-scale-up">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Camera Barcode / QR Scanner</h2>
              <p className="text-xs text-slate-500">Point camera at product barcode or QR code</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Camera Error Message */}
        {cameraError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            <p className="font-bold mb-1">Camera Permission / Error:</p>
            <p>{cameraError}</p>
          </div>
        )}

        {/* Camera Reader Element */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden mb-4 min-h-[260px] flex items-center justify-center">
          <div id={containerId} className="w-full h-full"></div>
          
          {/* Scanning Target Box Indicator */}
          {!cameraError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-56 h-56 border-2 border-primary border-dashed rounded-2xl shadow-2xl animate-pulse"></div>
              <p className="text-white text-xs font-semibold mt-3 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm">
                Align barcode / QR within frame
              </p>
            </div>
          )}
        </div>

        {/* Fallback & Modal Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleSimulateScan}
            className="w-full sm:w-auto text-xs font-semibold text-primary hover:text-primary-dark bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-all"
          >
            ⚡ Test Scan (Sample Barcode)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default CameraScannerModal;
