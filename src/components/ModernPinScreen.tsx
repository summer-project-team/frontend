import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertCircle, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { UnifiedPinInput } from './UnifiedPinInput.tsx';
import PinService from '../services/PinService';

interface ModernPinScreenProps {
  onBack: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  subtitle?: string;
  purpose?: 'verify' | 'setup' | 'change';
  requireCurrentPin?: boolean;
  onCurrentPinVerified?: () => void;
}

export function ModernPinScreen({ 
  onBack, 
  onSuccess, 
  title,
  subtitle,
  purpose = 'verify',
  requireCurrentPin = false,
  onCurrentPinVerified
}: ModernPinScreenProps) {
  const [currentStep, setCurrentStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Determine the initial step based on purpose and requirements
  useEffect(() => {
    if (purpose === 'verify' || (purpose === 'change' && requireCurrentPin)) {
      setCurrentStep('current');
    } else if (purpose === 'setup') {
      setCurrentStep('new');
    }
  }, [purpose, requireCurrentPin]);

  const getStepTitle = () => {
    if (title) return title;
    
    switch (currentStep) {
      case 'current':
        return purpose === 'change' ? 'Enter Current PIN' : 'Enter Your PIN';
      case 'new':
        return purpose === 'change' ? 'Enter New PIN' : 'Create Your PIN';
      case 'confirm':
        return 'Confirm Your PIN';
      default:
        return 'Enter PIN';
    }
  };

  const getStepSubtitle = () => {
    if (subtitle && currentStep === 'current') return subtitle;
    
    switch (currentStep) {
      case 'current':
        return purpose === 'change' 
          ? 'Please enter your current 4-digit PIN to continue'
          : 'Please enter your 4-digit transaction PIN';
      case 'new':
        return purpose === 'change'
          ? 'Create a new 4-digit PIN for your account'
          : 'Create a secure 4-digit PIN for transactions';
      case 'confirm':
        return 'Please enter your PIN again to confirm';
      default:
        return '';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'current':
        return <Shield size={28} className="text-white" />;
      case 'new':
        return <Lock size={28} className="text-white" />;
      case 'confirm':
        return <Shield size={28} className="text-white" />;
      default:
        return <Shield size={28} className="text-white" />;
    }
  };

  const getStepIconColor = () => {
    switch (currentStep) {
      case 'current':
        return 'from-blue-500 to-indigo-600';
      case 'new':
        return 'from-green-500 to-emerald-600';
      case 'confirm':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const handlePinComplete = async (pin: string) => {
    setError('');
    setIsLoading(true);

    try {
      switch (currentStep) {
        case 'current':
          // Verify current PIN
          await PinService.verifyPin({ pin });
          setCurrentPin(pin);
          
          if (purpose === 'verify') {
            // For verification, we're done
            onSuccess(pin);
          } else if (purpose === 'change') {
            // For change, move to new PIN step
            onCurrentPinVerified?.();
            setCurrentStep('new');
          }
          break;

        case 'new':
          // Set new PIN (for setup or change)
          setNewPin(pin);
          setCurrentStep('confirm');
          break;

        case 'confirm':
          // Confirm new PIN
          if (pin !== newPin) {
            setError('PINs do not match. Please try again.');
            setCurrentStep('new');
            setNewPin('');
            return;
          }

          if (purpose === 'setup') {
            await PinService.setupPin({ pin, confirmPin: pin });
            toast.success('PIN setup successfully!');
          } else if (purpose === 'change') {
            await PinService.changePin({ 
              currentPin, 
              newPin: pin, 
              confirmNewPin: pin 
            });
            toast.success('PIN changed successfully!');
          }
          
          onSuccess(pin);
          break;
      }
      
      setAttempts(0);
    } catch (error: any) {
      console.error('PIN operation failed:', error);
      setAttempts(prev => prev + 1);
      
      if (attempts >= maxAttempts - 1) {
        setError('Too many failed attempts. Please try again later.');
        setTimeout(() => onBack(), 2000);
      } else {
        setError(error.message || 'Operation failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setError('');
  };

  const handleStepBack = () => {
    setError('');
    
    switch (currentStep) {
      case 'new':
        if (purpose === 'change') {
          setCurrentStep('current');
          setCurrentPin('');
        } else {
          onBack();
        }
        break;
      case 'confirm':
        setCurrentStep('new');
        setNewPin('');
        break;
      default:
        onBack();
    }
  };

  const getProgress = () => {
    const steps = purpose === 'verify' ? 1 : purpose === 'setup' ? 2 : 3;
    const current = currentStep === 'current' ? 1 : currentStep === 'new' ? (purpose === 'setup' ? 1 : 2) : steps;
    return (current / steps) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-gradient-to-tl from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-16">
          <button
            onClick={handleStepBack}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">PIN Security</h1>
          
          <div className="w-12"> {/* Spacer */}</div>
        </div>

        {/* Progress Bar */}
        {(purpose === 'setup' || purpose === 'change') && (
          <div className="mx-6 mb-8">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {currentStep === 'current' ? 1 : currentStep === 'new' ? (purpose === 'setup' ? 1 : 2) : (purpose === 'setup' ? 2 : 3)}</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 px-6 pb-6">
          <div className="backdrop-blur-xl bg-white/40 dark:bg-white/5 rounded-3xl p-8 border border-white/30 dark:border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 max-w-2xl mx-auto">
            
            {/* Step Icon and Title */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${getStepIconColor()} rounded-2xl flex items-center justify-center shadow-lg`}>
                {getStepIcon()}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600 dark:text-gray-400">{getStepSubtitle()}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 backdrop-blur-xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/30 dark:border-red-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
                {maxAttempts && attempts > 0 && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    Attempt {attempts} of {maxAttempts}
                  </p>
                )}
              </div>
            )}

            {/* PIN Input */}
            <UnifiedPinInput
              onComplete={handlePinComplete}
              onClear={handleClear}
              disabled={isLoading}
              isVerifying={isLoading}
              error={error}
              maxAttempts={maxAttempts}
              currentAttempt={attempts}
            />

            {/* Loading State */}
            {isLoading && (
              <div className="text-center mt-6">
                <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentStep === 'current' ? 'Verifying PIN...' : 'Processing...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
