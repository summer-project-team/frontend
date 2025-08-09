import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from '../App';
import { authService } from '../services/AuthService';
import { toast } from 'sonner';
import { parseError, ErrorInfo } from '../utils/errorHandler';
import ErrorDisplay from './ErrorDisplay';

interface SignupScreenProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

export function SignupScreen({ onSignup, onSwitchToLogin }: SignupScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: 'NG', // Default to Nigeria
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Parse phone number to extract country code and number
  const parsePhoneNumber = (phone: string) => {
    // Remove any non-numeric characters except +
    const cleaned = phone.replace(/[^+\d]/g, '');
    
    // Default mappings for common country codes
    if (cleaned.startsWith('+234') || cleaned.startsWith('234')) {
      return { country_code: 'NG', phone_number: cleaned.replace(/^\+?234/, '') };
    } else if (cleaned.startsWith('+44') || cleaned.startsWith('44')) {
      return { country_code: 'GB', phone_number: cleaned.replace(/^\+?44/, '') };
    } else if (cleaned.startsWith('+1') || cleaned.startsWith('1')) {
      return { country_code: 'US', phone_number: cleaned.replace(/^\+?1/, '') };
    } else {
      // Default to the selected country code
      return { 
        country_code: formData.countryCode, 
        phone_number: cleaned.replace(/^\+/, '') 
      };
    }
  };

  const handleSignup = async () => {
    // Clear any previous errors
    setError(null);
    
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setError({
        message: 'Please fill in all fields',
        type: 'validation',
        suggestions: [
          'Make sure all required fields are completed',
          'Check that your phone number includes the country code'
        ]
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setError({
        message: 'Passwords do not match',
        type: 'validation',
        suggestions: [
          'Make sure both password fields contain the same text',
          'Try typing your password again carefully'
        ]
      });
      return;
    }

    if (password.length < 8) {
      setError({
        message: 'Password must be at least 8 characters long',
        type: 'validation',
        suggestions: [
          'Use a longer password for better security',
          'Include a mix of letters, numbers, and symbols'
        ]
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse phone number
      const { country_code, phone_number } = parsePhoneNumber(phone);
      
      // Call real backend registration API
      const response = await authService.register({
        phone_number,
        country_code,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      
      if (response.success) {
        toast.success('Registration successful! Please check your phone for verification code.');
        
        // For now, we'll redirect to login since phone verification isn't implemented in frontend yet
        // In a real app, you'd show a phone verification screen here
        toast.info('Please login with your credentials');
        onSwitchToLogin();
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorInfo = parseError(error);
      setError(errorInfo);
      
      // Still show toast for backwards compatibility
      toast.error(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;
    return firstName && lastName && email && phone && password && confirmPassword && password === confirmPassword;
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm py-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-3xl flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-lg"></div>
            </div>
          </div>
          <h1 className="text-3xl mb-2 text-blue-600">
            Create Account
          </h1>
          <p className="text-gray-600">Join us and start sending money</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="space-y-5">
            {/* First Name */}
            <div>
              <label className="block text-gray-700 mb-2">First Name</label>
              <div className="relative">
                <UserIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="pl-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl h-12 focus:bg-gray-100 dark:focus:bg-gray-600 transition-all duration-300"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 mb-2">Last Name</label>
              <div className="relative">
                <UserIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="pl-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl h-12 focus:bg-gray-100 dark:focus:bg-gray-600 transition-all duration-300"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl h-12 focus:bg-gray-100 dark:focus:bg-gray-600 transition-all duration-300"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <div className="flex space-x-3">
                <select
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange('countryCode', e.target.value)}
                  className="w-20 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl h-12 px-3 focus:bg-gray-100 dark:focus:bg-gray-600 transition-all duration-300"
                >
                  <option value="NG">🇳🇬</option>
                  <option value="GB">🇬🇧</option>
                  <option value="US">🇺🇸</option>
                </select>
                <div className="relative flex-1">
                  <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl h-12 focus:bg-gray-100 dark:focus:bg-gray-600 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-12 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl h-12 focus:bg-gray-100 dark:focus:bg-gray-600 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-12 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl h-12 focus:bg-gray-100 dark:focus:bg-gray-600 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <ErrorDisplay 
                error={error} 
                onDismiss={() => setError(null)}
                className="mt-4"
              />
            )}

            {/* Terms */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                By signing up, you agree to our{' '}
                <span className="text-blue-600">Terms of Service</span> and{' '}
                <span className="text-blue-600">Privacy Policy</span>
              </p>
            </div>

            {/* Signup Button */}
            <Button
              onClick={handleSignup}
              disabled={!isFormValid() || isLoading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}