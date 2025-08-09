import React, { useState } from 'react';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface ModernPinInputProps {
  onComplete: (pin: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function ModernPinInput({ onComplete, onClear, disabled = false }: ModernPinInputProps) {
  const [pin, setPin] = useState('');

  const handleNumberClick = (number: string) => {
    if (disabled || pin.length >= 4) return;
    
    const newPin = pin + number;
    setPin(newPin);
    
    if (newPin.length === 4) {
      onComplete(newPin);
    }
  };

  const handleClear = () => {
    if (disabled) return;
    setPin('');
    onClear();
  };

  const handleBackspace = () => {
    if (disabled) return;
    setPin(prev => prev.slice(0, -1));
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="space-y-8">
      {/* PIN Display */}
      <div className="flex justify-center space-x-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              pin.length > index
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        {/* Numbers 1-9 */}
        {numbers.slice(0, 9).map((number) => (
          <Button
            key={number}
            onClick={() => handleNumberClick(number)}
            disabled={disabled}
            className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl font-semibold text-gray-800 dark:text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {number}
          </Button>
        ))}

        {/* Bottom row: Clear, 0, Backspace */}
        <Button
          onClick={handleClear}
          disabled={disabled}
          className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={20} />
        </Button>

        <Button
          onClick={() => handleNumberClick('0')}
          disabled={disabled}
          className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl font-semibold text-gray-800 dark:text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          0
        </Button>

        <Button
          onClick={handleBackspace}
          disabled={disabled}
          className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⌫
        </Button>
      </div>

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your 4-digit transaction PIN
        </p>
      </div>
    </div>
  );
}
