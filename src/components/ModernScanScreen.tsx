import React, { useState } from 'react';
import { ArrowLeft, QrCode, Scan, Share2, Download, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { QRScanner } from './QRScanner';
import { toast } from 'sonner';

interface ModernScanScreenProps {
  onBack: () => void;
  user?: any; // Add user prop for generating payment QR
}

export function ModernScanScreen({ onBack, user }: ModernScanScreenProps) {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const handleQRScan = (data: string) => {
    console.log('QR Scanned:', data);
    toast.success('QR Code scanned successfully!');
    setIsQRScannerOpen(false);
    // Here you would process the QR data for payment
  };

  const generatePaymentQR = () => {
    const qrData = {
      type: 'payment_request',
      recipient: user?.name || 'User',
      phone: user?.phoneNumber || '',
      amount: paymentAmount,
      note: paymentNote,
      timestamp: Date.now()
    };
    
    return `crossbridge://pay?data=${encodeURIComponent(JSON.stringify(qrData))}`;
  };

  const copyQRData = () => {
    const data = generatePaymentQR();
    navigator.clipboard.writeText(data);
    toast.success('Payment link copied to clipboard!');
  };

  const shareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CrossBridge Payment Request',
        text: `Pay ${user?.name || 'me'} via CrossBridge`,
        url: generatePaymentQR()
      });
    } else {
      copyQRData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">QR Code</h1>
        <div className="w-10"></div>
      </div>

      {/* Tab Navigation */}
      <div className="p-4 flex-shrink-0">
        <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${
              activeTab === 'scan'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Scan size={18} />
            <span className="font-medium">Scan QR</span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${
              activeTab === 'generate'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <QrCode size={18} />
            <span className="font-medium">Generate QR</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-24">
        {activeTab === 'scan' ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-24 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center">
              <Scan size={48} className="text-white" />
            </div>
            
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Scan to Pay</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Point your camera at a CrossBridge QR code to send money instantly
              </p>
            </div>

            <Button
              onClick={() => setIsQRScannerOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8"
            >
              <Scan className="mr-2" size={20} />
              Start Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Payment QR Code</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Generate a QR code for others to pay you
              </p>
            </div>

            {/* Amount Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">
                Amount (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-center text-2xl h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 pl-12 pr-6 text-gray-800 dark:text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Note Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="What's this payment for?"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 text-gray-800 dark:text-white placeholder:text-gray-400 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300"
              />
            </div>

            {/* QR Code Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center space-y-4">
                {/* Placeholder QR Code */}
                <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-200">
                  <div className="text-center">
                    <QrCode size={80} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">QR Code will appear here</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {user?.name || 'Your Name'}
                  </p>
                  {paymentAmount && (
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      ${paymentAmount}
                    </p>
                  )}
                  {paymentNote && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {paymentNote}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={shareQR}
                    variant="outline"
                    className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={copyQRData}
                    variant="outline"
                    className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}
