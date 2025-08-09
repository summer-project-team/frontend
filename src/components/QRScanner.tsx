import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { QrCode, Camera, X, Flashlight, FlashlightOff } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestCameraPermission();
    }
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setHasPermission(true);
      // Stop the stream immediately as we're just checking permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setHasPermission(false);
      toast.error('Camera permission denied');
    }
  };

  const startScanning = () => {
    setScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      const mockQRData = {
        type: 'payment',
        recipient: 'John Doe',
        amount: '25.00',
        currency: 'USD',
        account: 'john.doe@example.com'
      };
      
      onScan(JSON.stringify(mockQRData));
      setScanning(false);
      toast.success('QR Code scanned successfully!');
      onClose();
    }, 3000);
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    toast.success(isFlashOn ? 'Flash turned off' : 'Flash turned on');
  };

  const handleClose = () => {
    setScanning(false);
    setIsFlashOn(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black/95 border-gray-800 max-w-sm mx-auto p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">Scan QR Code</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFlash}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {isFlashOn ? (
                  <FlashlightOff size={20} className="text-white" />
                ) : (
                  <Flashlight size={20} className="text-white" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X size={20} className="text-white" />
              </Button>
            </div>
          </div>
          <DialogDescription className="text-white/80">
            Position the QR code within the camera frame to scan payment information
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          {/* Camera View Simulation */}
          <div className="aspect-square bg-gray-900 dark:bg-gray-800 relative overflow-hidden">
            {hasPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <Camera size={48} className="text-gray-400" />
                <p className="text-white text-center px-6">
                  Camera permission is required to scan QR codes
                </p>
                <Button
                  onClick={requestCameraPermission}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                  Grant Permission
                </Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Scanning Frame */}
                <div className="relative w-64 h-64">
                  {/* Corner borders */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white"></div>
                  
                  {/* Scanning line animation */}
                  {scanning && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 animate-pulse"></div>
                  )}
                  
                  {/* Center QR icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode size={64} className="text-white/30" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="p-6 text-center">
            <p className="text-white/80 mb-4">
              {scanning 
                ? 'Scanning...' 
                : 'Position the QR code within the frame to scan'
              }
            </p>
            
            {hasPermission && !scanning && (
              <Button
                onClick={startScanning}
                className="w-full card-gradient hover:opacity-90 text-white"
              >
                <QrCode size={20} className="mr-2" />
                Start Scanning
              </Button>
            )}
            
            {scanning && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-white">Scanning QR code...</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}