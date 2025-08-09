import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, ArrowLeft, ArrowRight, CreditCard, Shield, CheckCircle, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from '../App';
import { authService } from '../services/AuthService';
import { toast } from 'sonner';
import { parseError, ErrorInfo } from '../utils/errorHandler';
import ErrorDisplay from './ErrorDisplay';

interface ModernSignupScreenProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

type SignupStep = 'personal' | 'contact' | 'security' | 'verification' | 'complete';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  pin: string;
  confirmPin: string;
}

export function ModernSignupScreen({ onSignup, onSwitchToLogin }: ModernSignupScreenProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('personal');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: 'NG',
    password: '',
    confirmPassword: '',
    pin: '',
    confirmPin: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const parsePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/[^+\d]/g, '');
    
    if (cleaned.startsWith('+234') || cleaned.startsWith('234')) {
      return { country_code: 'NG', phone_number: cleaned.replace(/^\+?234/, '') };
    } else if (cleaned.startsWith('+44') || cleaned.startsWith('44')) {
      return { country_code: 'GB', phone_number: cleaned.replace(/^\+?44/, '') };
    } else if (cleaned.startsWith('+1') || cleaned.startsWith('1')) {
      return { country_code: 'US', phone_number: cleaned.replace(/^\+?1/, '') };
    } else {
      return { 
        country_code: formData.countryCode, 
        phone_number: cleaned.replace(/^\+/, '') 
      };
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return formData.firstName.trim() && formData.lastName.trim();
      case 'contact':
        return formData.email.trim() && formData.phone.trim();
      case 'security':
        return formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword && 
               formData.password.length >= 8;
      case 'verification':
        return formData.pin && formData.confirmPin && 
               formData.pin === formData.confirmPin && 
               formData.pin.length === 4;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      setError({
        message: 'Please complete all required fields correctly',
        type: 'validation',
        suggestions: ['Check all fields are filled', 'Ensure passwords match', 'PIN must be 4 digits']
      });
      return;
    }

    const steps: SignupStep[] = ['personal', 'contact', 'security', 'verification', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      setError(null);
    }
  };

  const handleBack = () => {
    const steps: SignupStep[] = ['personal', 'contact', 'security', 'verification', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      setError(null);
    }
  };

  const handleSignup = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { country_code, phone_number } = parsePhoneNumber(formData.phone);
      
      const response = await authService.register({
        phone_number,
        country_code,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      if (response.success) {
        setCurrentStep('complete');
        toast.success('Account created successfully!');
        
        setTimeout(() => {
          toast.info('Please login with your credentials');
          onSwitchToLogin();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorInfo = parseError(error);
      setError(errorInfo);
      toast.error(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    const steps: SignupStep[] = ['personal', 'contact', 'security', 'verification'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-2xl flex items-center justify-center">
                <UserIcon size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Personal Information</h2>
              <p className="text-gray-600 dark:text-gray-400">We'd love to know your name</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">First Name</label>
                <div className="relative group">
                  <UserIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                  <Input
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pl-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Last Name</label>
                <div className="relative group">
                  <UserIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                  <Input
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="pl-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-2xl flex items-center justify-center">
                <Mail size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Contact Details</h2>
              <p className="text-gray-600 dark:text-gray-400">You're doing a great job?</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Email Address</label>
                <div className="relative group">
                  <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-green-300 focus:border-green-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Phone Number</label>
                <div className="flex space-x-3">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    className="w-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl h-14 px-3 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white"
                  >
                    <option value="NG">🇳🇬</option>
                    <option value="GB">🇬🇧</option>
                    <option value="US">🇺🇸</option>
                  </select>
                  <div className="relative flex-1 group">
                    <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                    <Input
                      type="tel"
                      placeholder="+234 801 234 5678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-green-300 focus:border-green-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-2xl flex items-center justify-center">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Secure Your Account</h2>
              <p className="text-gray-600 dark:text-gray-400">Just a few more steps!</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Password</label>
                <div className="relative group">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-12 pr-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-red-300 focus:border-red-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Password strength: {formData.password.length >= 8 ? '✅ Strong' : '⚠️ Weak (min 8 characters)'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Confirm Password</label>
                <div className="relative group">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-12 pr-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-red-300 focus:border-red-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-2xl flex items-center justify-center">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Transaction PIN</h2>
              <p className="text-gray-600 dark:text-gray-400">And finally...</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Create PIN</label>
                <div className="relative group">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
                  <Input
                    type={showPin ? "text" : "password"}
                    placeholder="Enter 4-digit PIN"
                    value={formData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      handleInputChange('pin', value);
                    }}
                    className="pl-12 pr-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-purple-300 focus:border-purple-400 text-center tracking-widest"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors duration-300"
                  >
                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Confirm PIN</label>
                <div className="relative group">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
                  <Input
                    type={showConfirmPin ? "text" : "password"}
                    placeholder="Confirm 4-digit PIN"
                    value={formData.confirmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      handleInputChange('confirmPin', value);
                    }}
                    className="pl-12 pr-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-14 focus:bg-gray-50 dark:focus:bg-gray-700 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-purple-300 focus:border-purple-400 text-center tracking-widest"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors duration-300"
                  >
                    {showConfirmPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPin && formData.pin !== formData.confirmPin && (
                  <p className="text-red-500 text-sm mt-1">PINs do not match</p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 This PIN will be used to authorize transactions and sensitive operations
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Aboard! 🎉</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Your account has been created successfully</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-2xl p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-800 dark:text-green-300">What's Next?</h3>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                  <li>✅ Verify your phone number</li>
                  <li>✅ Complete KYC verification</li>
                  <li>✅ Start sending money instantly</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Redirecting you to login...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-indigo-600 rounded-3xl flex items-center justify-center border border-gray-200 dark:border-gray-700 rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <CreditCard size={28} className="text-indigo-600" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              Ready to go borderless?
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create your account in a few simple steps
            </p>
          </div>

          {/* Progress Bar */}
          {currentStep !== 'complete' && (
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Step {['personal', 'contact', 'security', 'verification'].indexOf(currentStep) + 1} of 4</span>
                <span>{Math.round(getStepProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getStepProgress()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 mb-8 transition-all duration-500">
            {renderStepContent()}

            {/* Error Display */}
            {error && (
              <div className="mt-6">
                <ErrorDisplay 
                  error={error} 
                  onDismiss={() => setError(null)}
                />
              </div>
            )}

            {/* Terms */}
            {currentStep === 'security' && (
              <div className="text-center mt-6">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  By continuing, you agree to our{' '}
                  <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Terms of Service</span> and{' '}
                  <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Privacy Policy</span>
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== 'complete' && (
              <div className="flex justify-between mt-8 space-x-4">
                <Button
                  onClick={currentStep === 'personal' ? onSwitchToLogin : handleBack}
                  variant="outline"
                  className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  {currentStep === 'personal' ? 'Sign In' : 'Back'}
                </Button>

                <Button
                  onClick={currentStep === 'verification' ? handleSignup : handleNext}
                  disabled={!validateCurrentStep() || isLoading}
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <>
                      {currentStep === 'verification' ? 'Create Account' : 'Continue'}
                      {currentStep !== 'verification' && <ArrowRight size={20} className="ml-2" />}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Login Link */}
          {currentStep !== 'complete' && currentStep !== 'personal' && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
