import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface UnifiedPinInputProps {
  onComplete: (pin: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  isVerifying?: boolean;
  error?: string;
  maxAttempts?: number;
  currentAttempt?: number;
  variant?: 'modal' | 'inline' | 'screen';
  showNumberPad?: boolean;
}

export function UnifiedPinInput({ 
  onComplete, 
  onClear,
  disabled = false,
  isVerifying = false,
  error,
  maxAttempts,
  currentAttempt,
  variant = 'screen',
  showNumberPad = true
}: UnifiedPinInputProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  useEffect(() => {
    // Clear PIN when error occurs
    if (error) {
      setPin(['', '', '', '']);
      setCurrentIndex(0);
      if (inputRefs.current[0] && !disabled) {
        inputRefs.current[0].focus();
      }
    }
  }, [error, disabled]);

  const handleInputChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value) || disabled) return; // Only allow digits

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
      setTimeout(() => {
        onComplete(newPin.join(''));
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return;

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
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length === 4) {
      const newPin = digits.split('');
      setPin(newPin);
      setCurrentIndex(3);
      inputRefs.current[3]?.focus();
      onComplete(digits);
    }
  };

  const handleNumberClick = (number: string) => {
    if (disabled || pin.join('').length >= 4) return;
    
    const currentPinString = pin.join('');
    const newPinString = currentPinString + number;
    const newPin = newPinString.split('').concat(['', '', '', '']).slice(0, 4);
    
    setPin(newPin);
    setCurrentIndex(Math.min(newPinString.length, 3));
    
    if (newPinString.length === 4) {
      onComplete(newPinString);
    } else if (inputRefs.current[newPinString.length]) {
      inputRefs.current[newPinString.length]?.focus();
    }
  };

  const handleClear = () => {
    if (disabled) return;
    
    setPin(['', '', '', '']);
    setCurrentIndex(0);
    inputRefs.current[0]?.focus();
    onClear?.();
  };

  const handleBackspace = () => {
    if (disabled) return;
    
    const currentPinString = pin.join('');
    if (currentPinString.length > 0) {
      const newPinString = currentPinString.slice(0, -1);
      const newPin = newPinString.split('').concat(['', '', '', '']).slice(0, 4);
      setPin(newPin);
      setCurrentIndex(Math.max(0, newPinString.length));
      
      if (inputRefs.current[newPinString.length]) {
        inputRefs.current[newPinString.length]?.focus();
      }
    }
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const getContainerClasses = () => {
    switch (variant) {
      case 'modal':
        return 'space-y-6';
      case 'inline':
        return 'space-y-4';
      case 'screen':
      default:
        return 'space-y-8';
    }
  };

  const getPinDisplayClasses = () => {
    switch (variant) {
      case 'modal':
        return 'flex justify-center space-x-3';
      case 'inline':
        return 'flex justify-center space-x-3';
      case 'screen':
      default:
        return 'flex justify-center space-x-4';
    }
  };

  const getInputClasses = (digit: string, index: number) => {
    const baseClasses = 'text-center font-bold border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/70 dark:bg-white/10 backdrop-blur-lg';
    const sizeClasses = variant === 'modal' || variant === 'inline' ? 'w-12 h-12 text-xl' : 'w-16 h-16 text-2xl';
    const errorClasses = error ? 'border-red-500 animate-pulse' : digit ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return `${baseClasses} ${sizeClasses} ${errorClasses} ${disabledClasses}`;
  };

  const getDotClasses = (hasDigit: boolean) => {
    const baseClasses = 'rounded-full transition-all duration-300';
    const sizeClasses = variant === 'modal' || variant === 'inline' ? 'w-2 h-2' : 'w-3 h-3';
    const colorClasses = hasDigit ? 'bg-blue-600' : 'bg-gray-400';
    
    return `${baseClasses} ${sizeClasses} ${colorClasses}`;
  };

  return (
    <div className={getContainerClasses()}>
      {/* PIN Display */}
      <div className={getPinDisplayClasses()}>
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
              className={getInputClasses(digit, index)}
              style={{ color: 'transparent', caretColor: 'transparent' }}
              disabled={disabled || isVerifying}
            />
            {/* Dot indicator for filled inputs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={getDotClasses(!!digit)} />
            </div>
          </div>
        ))}
      </div>

      {/* Number Pad (optional) */}
      {showNumberPad && variant === 'screen' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {numbers.slice(0, 9).map((number) => (
              <Button
                key={number}
                variant="ghost"
                onClick={() => handleNumberClick(number)}
                disabled={disabled || isVerifying}
                className="h-16 text-2xl font-bold backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {number}
              </Button>
            ))}
            
            {/* Bottom row: Clear, 0, Backspace */}
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={disabled || isVerifying}
              className="h-16 backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Trash2 size={20} className="text-gray-600 dark:text-gray-400" />
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => handleNumberClick('0')}
              disabled={disabled || isVerifying}
              className="h-16 text-2xl font-bold backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              0
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleBackspace}
              disabled={disabled || isVerifying}
              className="h-16 backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              ⌫
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons for non-screen variants */}
      {variant !== 'screen' && (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={disabled || isVerifying}
            className="flex-1 h-12 backdrop-blur-xl bg-white/20 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/30 dark:hover:bg-white/10"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
