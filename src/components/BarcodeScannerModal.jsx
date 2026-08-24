import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  Upload,
  X,
  RefreshCw,
  Zap,
  ZapOff,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  SwitchCamera
} from 'lucide-react';

// Play a pleasant Web Audio beep on successful scan
const playScanBeep = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // jump to A6

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.debug('Audio beep not available:', e);
  }
};

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.AZTEC,
];

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan Barcode or QR Code'
}) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successCode, setSuccessCode] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);

  const scannerRef = useRef(null);
  const readerElementId = 'barcode-scanner-reader-viewport';
  const isStoppingRef = useRef(false);

  // Stop camera scanning cleanly
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        isStoppingRef.current = false;
        setIsScanning(false);
        setTorchOn(false);
        setHasTorch(false);
      }
    }
  }, []);

  const handleScanSuccess = useCallback((decodedText, result) => {
    playScanBeep();
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    setSuccessCode(decodedText);
    stopScanner();

    setTimeout(() => {
      onScanSuccess(decodedText, result);
      onClose();
    }, 600);
  }, [onScanSuccess, onClose, stopScanner]);

  // Start camera scanning
  const startCamera = useCallback(async (cameraIdOrFacing) => {
    setErrorMessage('');
    setSuccessCode(null);

    // Stop any existing session
    await stopScanner();

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false
        });
      }

      const cameraConfig = cameraIdOrFacing
        ? cameraIdOrFacing
        : { facingMode: 'environment' };

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          // Dynamic rectangular box suitable for both wide 1D barcodes and square QR codes
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const width = Math.min(Math.floor(viewfinderWidth * 0.85), 320);
          const height = Math.min(Math.floor(minEdge * 0.65), 240);
          return { width, height };
        },
        aspectRatio: 1.333,
        showTorchButtonIfSupported: true
      };

      await scannerRef.current.start(
        cameraConfig,
        qrConfig,
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        () => {
          // Frame scan error - ignore per-frame failures
        }
      );

      setIsScanning(true);

      // Check if torch/flashlight is supported
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch (e) {
        setHasTorch(false);
      }
    } catch (err) {
      console.error('Failed to start camera scanner:', err);
      let userMsg = 'Could not access the camera. Please check your browser permissions.';
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        userMsg = 'Camera permission was denied. Please allow camera access in your browser or use the Image Upload option.';
      } else if (err?.name === 'NotFoundError' || err?.message?.includes('No camera')) {
        userMsg = 'No camera found on this device. You can upload a barcode image instead.';
      } else if (err?.name === 'NotReadableError') {
        userMsg = 'Camera is currently in use by another application.';
      }
      setErrorMessage(userMsg);
      setIsScanning(false);
    }
  }, [stopScanner, handleScanSuccess]);

  // Enumerate cameras
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (isMounted && devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if available
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          );
          const selected = backCam ? backCam.id : devices[0].id;
          setSelectedCameraId(selected);
          if (activeTab === 'camera') {
            startCamera(selected);
          }
        } else if (isMounted) {
          // Default to environment facing mode
          if (activeTab === 'camera') {
            startCamera({ facingMode: 'environment' });
          }
        }
      })
      .catch((err) => {
        console.warn('Could not enumerate cameras:', err);
        if (isMounted && activeTab === 'camera') {
          startCamera({ facingMode: 'environment' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setSuccessCode(null);
      setErrorMessage('');
      setTorchOn(false);
    }
  }, [isOpen, stopScanner]);

  // Toggle torch / flash
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  // Switch active camera
  const handleCameraChange = (e) => {
    const nextCamId = e.target.value;
    setSelectedCameraId(nextCamId);
    if (activeTab === 'camera') {
      startCamera(nextCamId);
    }
  };

  // Switch facing mode quickly
  const handleToggleFacingMode = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamId = cameras[nextIndex].id;
      setSelectedCameraId(nextCamId);
      startCamera(nextCamId);
    } else {
      startCamera({ facingMode: 'environment' });
    }
  };

  // Handle image file scan
  const handleFileScan = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setErrorMessage('');
    setFileProcessing(true);

    try {
      let fileScanner = scannerRef.current;
      if (!fileScanner) {
        fileScanner = new Html5Qrcode('barcode-scanner-reader-file-dummy', {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false
        });
      }

      const decodedText = await fileScanner.scanFile(file, true);
      setFileProcessing(false);
      handleScanSuccess(decodedText, { result: decodedText });
    } catch (err) {
      setFileProcessing(false);
      console.error('File scan failed:', err);
      setErrorMessage('No barcode or QR code detected in this image. Please try a clearer or closer photo.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileScan(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileScan(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="scanner-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="scanner-modal-title-wrap">
            <div className="scanner-title-icon-badge">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="modal-title">{title}</h2>
              <p className="scanner-modal-subtitle">Point your camera at any 1D barcode or QR code</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close scanner"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="scanner-tabs">
          <button
            type="button"
            className={`scanner-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('camera');
              if (selectedCameraId) startCamera(selectedCameraId);
            }}
          >
            <Camera size={16} />
            <span>Live Camera</span>
          </button>
          <button
            type="button"
            className={`scanner-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => {
              stopScanner();
              setActiveTab('upload');
            }}
          >
            <Upload size={16} />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="scanner-modal-body">
          {activeTab === 'camera' && (
            <div className="scanner-camera-container">
              {/* Controls bar */}
              <div className="scanner-controls-bar">
                {cameras.length > 1 ? (
                  <div className="scanner-camera-select-wrap">
                    <SwitchCamera size={15} className="scanner-select-icon" />
                    <select
                      className="scanner-camera-select"
                      value={selectedCameraId}
                      onChange={handleCameraChange}
                    >
                      {cameras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label || `Camera ${c.id.slice(0, 5)}...`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="scanner-control-btn"
                    onClick={handleToggleFacingMode}
                    title="Flip camera"
                  >
                    <SwitchCamera size={16} />
                    <span>Flip Camera</span>
                  </button>
                )}

                {hasTorch && (
                  <button
                    type="button"
                    className={`scanner-control-btn ${torchOn ? 'active-torch' : ''}`}
                    onClick={handleToggleTorch}
                    title="Toggle Flash"
                  >
                    {torchOn ? <Zap size={16} /> : <ZapOff size={16} />}
                    <span>{torchOn ? 'Flash On' : 'Flash'}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="scanner-control-btn"
                  onClick={() => startCamera(selectedCameraId)}
                  title="Restart Camera"
                >
                  <RefreshCw size={16} className={isScanning ? '' : 'spin-icon'} />
                  <span>Restart</span>
                </button>
              </div>

              {/* Viewport for Html5Qrcode */}
              <div className="scanner-viewport-wrapper">
                <div id={readerElementId} className="scanner-html5-reader" />

                {/* Laser animation overlay */}
                {isScanning && !successCode && (
                  <div className="scanner-reticle-overlay">
                    <div className="scanner-target-box">
                      <div className="corner-tl" />
                      <div className="corner-tr" />
                      <div className="corner-bl" />
                      <div className="corner-br" />
                      <div className="scanner-laser-beam" />
                    </div>
                  </div>
                )}

                {/* Success Indicator */}
                {successCode && (
                  <div className="scanner-success-overlay">
                    <CheckCircle2 size={48} className="scanner-success-icon" />
                    <span className="scanner-success-text">Scanned!</span>
                    <span className="scanner-code-badge">{successCode}</span>
                  </div>
                )}
              </div>

              <div className="scanner-instructions">
                <span>Align barcode or QR code inside the box to scan automatically</span>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="scanner-upload-container">
              <div
                id="barcode-scanner-reader-file-dummy"
                style={{ display: 'none' }}
              />

              <label
                className={`scanner-dropzone ${dragOver ? 'drag-over' : ''} ${fileProcessing ? 'processing' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="scanner-hidden-file-input"
                  disabled={fileProcessing}
                />
                
                {fileProcessing ? (
                  <div className="scanner-upload-placeholder">
                    <RefreshCw size={36} className="spin-icon text-primary" />
                    <p className="scanner-dropzone-title">Analyzing image...</p>
                    <p className="scanner-dropzone-sub">Decoding barcode or QR code</p>
                  </div>
                ) : (
                  <div className="scanner-upload-placeholder">
                    <div className="scanner-upload-icon-circle">
                      <ImageIcon size={32} />
                    </div>
                    <p className="scanner-dropzone-title">Click to upload or drag & drop</p>
                    <p className="scanner-dropzone-sub">PNG, JPG, JPEG, WEBP containing a barcode or QR code</p>
                    <span className="btn-browse-file">Browse File</span>
                  </div>
                )}
              </label>

              {successCode && (
                <div className="scanner-success-banner">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <span>Found code: <strong>{successCode}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="scanner-error-banner">
              <AlertCircle size={18} className="scanner-error-icon" />
              <p className="scanner-error-text">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="scanner-modal-footer">
          <div className="scanner-formats-tag">
            <span>Supports UPC-A, EAN-13, QR Code, Code 128, & 8+ formats</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary scanner-close-btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
