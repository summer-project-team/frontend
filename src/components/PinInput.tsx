import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface PinInputProps {
  onPinComplete: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  isVerifying?: boolean;
  error?: string;
  maxAttempts?: number;
  currentAttempt?: number;
}

export function PinInput({ 
  onPinComplete, 
  onCancel,
  title = "Enter Transaction PIN",
  subtitle = "Please enter your 4-digit transaction PIN",
  isVerifying = false,
  error,
  maxAttempts = 3,
  currentAttempt = 0,
}: PinInputProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Trigger fade-in animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Focus first input after animation starts
    const focusTimer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      clearTimeout(focusTimer);
    };
  }, []);

  useEffect(() => {
    // Clear PIN when error occurs
    if (error) {
      setPin(['', '', '', '']);
      setCurrentIndex(0);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [error]);

  const handleInputChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      // Move to next input
      setCurrentIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Check if PIN is complete
    if (newPin.every(digit => digit !== '') && newPin.join('').length === 4) {
      onPinComplete(newPin.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...pin];
      
      if (newPin[index]) {
        // Clear current input
        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {
        // Move to previous input and clear it
        newPin[index - 1] = '';
        setPin(newPin);
        setCurrentIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setCurrentIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      setCurrentIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length === 4) {
      const newPin = digits.split('');
      setPin(newPin);
      setCurrentIndex(3);
      inputRefs.current[3]?.focus();
      onPinComplete(digits);
    }
  };

  const clearPin = () => {
    setPin(['', '', '', '']);
    setCurrentIndex(0);
    inputRefs.current[0]?.focus();
  };

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before calling onCancel
    setTimeout(() => {
      onCancel?.();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* PIN Input */}
        <div className="px-6 py-8">
          <div className="flex justify-center space-x-4 mb-6">
            {pin.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-transparent caret-transparent ${
                    error 
                      ? 'border-red-500 shake' 
                      : digit 
                        ? 'border-blue-500 scale-105' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ color: 'transparent' }}
                  disabled={isVerifying}
                />
                {/* Dot indicator for filled inputs */}
                {digit ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 text-center font-medium">{error}</p>
              {maxAttempts && currentAttempt > 0 && (
                <p className="text-xs text-red-600 text-center mt-1">
                  Attempt {currentAttempt} of {maxAttempts}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isVerifying && (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Verifying PIN...
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={clearPin}
              disabled={isVerifying}
              className="flex-1 h-12 text-gray-600"
            >
              Clear
            </Button>
            {onCancel && (
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isVerifying}
                className="flex-1 h-12 text-gray-600"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
