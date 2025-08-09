import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertCircle, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { UnifiedPinInput } from './UnifiedPinInput';
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
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [canSave, setCanSave] = useState(false);
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

    switch (currentStep) {
      case 'current':
        // For current PIN verification, proceed immediately
        setIsLoading(true);
        try {
          await PinService.verifyPin({ pin });
          setCurrentPin(pin);
          
          if (purpose === 'verify') {
            onSuccess(pin);
          } else if (purpose === 'change') {
            onCurrentPinVerified?.();
            setCurrentStep('new');
          }
          setAttempts(0);
        } catch (error: any) {
          console.error('PIN verification failed:', error);
          setAttempts(prev => prev + 1);
          
          if (attempts >= maxAttempts - 1) {
            setError('Too many failed attempts. Please try again later.');
            setTimeout(() => onBack(), 2000);
          } else {
            setError(error.message || 'Invalid PIN. Please try again.');
          }
        } finally {
          setIsLoading(false);
        }
        break;

      case 'new':
        // For new PIN, just save it and enable save button
        setNewPin(pin);
        setCanSave(true);
        break;

      case 'confirm':
        // For confirm PIN, just save it and check if it matches
        setConfirmPin(pin);
        if (pin === newPin) {
          setCanSave(true);
          setError('');
        } else {
          setError('PINs do not match. Please try again.');
          setCanSave(false);
        }
        break;
    }
  };

  const handleSavePin = async () => {
    if (currentStep === 'new') {
      // Move to confirm step
      setCurrentStep('confirm');
      setCanSave(false);
      return;
    }

    if (currentStep === 'confirm') {
      if (confirmPin !== newPin) {
        setError('PINs do not match. Please try again.');
        return;
      }

      setIsLoading(true);
      try {
        if (purpose === 'setup') {
          await PinService.setupPin({ pin: newPin, confirmPin: confirmPin });
          toast.success('PIN setup successfully!');
        } else if (purpose === 'change') {
          await PinService.changePin({ 
            currentPin, 
            newPin: confirmPin, 
            confirmNewPin: confirmPin 
          });
          toast.success('PIN changed successfully!');
        }
        
        onSuccess(confirmPin);
      } catch (error: any) {
        console.error('PIN save failed:', error);
        setError(error.message || 'Failed to save PIN. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStepBack}
            className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </Button>
          
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
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 px-6 pb-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 transition-all duration-500 max-w-2xl mx-auto">
            
            {/* Step Icon and Title */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 ${getStepIconColor()} rounded-2xl flex items-center justify-center`}>
                {getStepIcon()}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600 dark:text-gray-400">{getStepSubtitle()}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-500 rounded-2xl p-4">
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
              key={currentStep} // Force re-render when step changes to clear PIN input
              onComplete={handlePinComplete}
              onClear={handleClear}
              disabled={isLoading}
              isVerifying={isLoading}
              error={error}
              maxAttempts={maxAttempts}
              currentAttempt={attempts}
            />

            {/* Save Button for new and confirm steps */}
            {(currentStep === 'new' || currentStep === 'confirm') && (
              <div className="mt-6">
                <Button
                  onClick={handleSavePin}
                  disabled={!canSave || isLoading}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                    canSave && !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : currentStep === 'new' ? (
                    'Continue to Confirm'
                  ) : (
                    'Save PIN'
                  )}
                </Button>
              </div>
            )}

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
