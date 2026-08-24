import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Zap } from 'lucide-react';

const CameraScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [cameraError, setCameraError] = useState('');
  const [isScanning,  setIsScanning]  = useState(false);
  const scannerRef  = useRef(null);
  const containerId = 'qr-camera-reader';

  useEffect(() => {
    if (!isOpen) return;

    let scanner = null;

    const startScanner = async () => {
      setCameraError('');
      setIsScanning(true);
      try {
        scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (text) => {
            if (scanner.isScanning) {
              scanner.stop().catch(() => {}).finally(() => {
                onScanSuccess(text);
                onClose();
              });
            }
          },
          () => {} // ignore frame errors
        );
      } catch (err) {
        setCameraError(err.message || 'Unable to access camera. Please allow camera permissions.');
        setIsScanning(false);
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulate = () => {
    const codes = ['012345678901', '012345678902', '7350053850019'];
    onScanSuccess(codes[Math.floor(Math.random() * codes.length)]);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="camera-modal-box">

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: '1rem' }}>Camera Scanner</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.1rem' }}>Point camera at barcode or QR code</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Error */}
        {cameraError && (
          <div className="form-error" style={{ margin: '1rem 1.5rem 0', borderRadius: 'var(--r-md)' }}>
            <strong>Camera Error:</strong>&nbsp;{cameraError}
          </div>
        )}

        {/* Camera viewport */}
        <div style={{
          position: 'relative', background: '#0f172a', margin: '1rem 1.5rem',
          borderRadius: 'var(--r-lg)', overflow: 'hidden', minHeight: 260,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div id={containerId} style={{ width: '100%' }} />

          {/* Targeting overlay */}
          {!cameraError && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.75rem'
            }}>
              <div style={{
                width: 220, height: 220,
                border: '2px dashed rgba(16,185,129,.7)',
                borderRadius: 'var(--r-lg)',
                animation: 'pulse 2s ease-in-out infinite',
                boxShadow: '0 0 0 4px rgba(16,185,129,.1)'
              }} />
              <span style={{
                color: '#fff', fontSize: '.75rem', fontWeight: 600,
                background: 'rgba(15,23,42,.7)', padding: '.3rem .9rem',
                borderRadius: 'var(--r-full)', backdropFilter: 'blur(4px)'
              }}>
                Align barcode within the frame
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleSimulate}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}
          >
            <Zap size={14} /> Test Scan
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScannerModal;
