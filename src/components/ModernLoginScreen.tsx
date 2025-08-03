import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from '../App';
import { authService } from '../services/AuthService';
import { toast } from 'sonner';
import { parseError, ErrorInfo } from '../utils/errorHandler';
import ErrorDisplay from './ErrorDisplay';

interface ModernLoginScreenProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

export function ModernLoginScreen({ onLogin, onSwitchToSignup }: ModernLoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);

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
      // Default to Nigeria if no country code detected
      return {
        country_code: 'NG',
        phone_number: cleaned.startsWith('0') ? cleaned.substring(1) : cleaned
      };
    }
  };

  const handleLogin = async () => {
    // Clear any previous errors
    setError(null);
    
    if (!phone || !password) {
      setError({
        message: 'Please enter both phone number and password',
        type: 'validation',
        suggestions: [
          'Make sure your phone number includes the country code',
          'Check that your password is not empty'
        ]
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse phone number
      const { country_code, phone_number } = parsePhoneNumber(phone);
      
      // Call real backend login API
      const response = await authService.login({ phone_number, country_code, password });
      
      if (response.success) {
        // Convert backend user to frontend User type
        const userWithDefaults = {
          id: response.user.id.toString(),
          name: `${response.user.first_name} ${response.user.last_name}`,
          email: response.user.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.first_name + ' ' + response.user.last_name)}&background=6366f1&color=fff`,
          balance: 1000, // Default balance
          currency: 'CBUSD',
          phoneNumber: response.user.phone_number || '',
          verificationLevel: (response.user.kyc_status === 'verified' ? 'verified' : 'basic') as 'verified' | 'basic' | 'premium',
        };        
        
        // Save user data to localStorage (already done in authService, but for compatibility)
        localStorage.setItem(`user_${userWithDefaults.id}`, JSON.stringify(userWithDefaults));
        
        toast.success('Login successful!');
        onLogin(userWithDefaults);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorInfo = parseError(error);
      setError(errorInfo);
      
      // Still show toast for backwards compatibility
      toast.error(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
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
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          {/* Modern Logo/Title */}
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <CreditCard size={32} className="text-indigo-600" />
                </div>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Welcome Text */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Sign in to continue
              </p>
            </div>
          </div>

          {/* Modern Login Form */}
          <div className="backdrop-blur-xl bg-white/40 dark:bg-white/5 rounded-3xl p-8 border border-white/30 dark:border-white/10 shadow-2xl mb-8 hover:shadow-3xl transition-all duration-500">
            <div className="space-y-6">
              {/* Phone Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300 z-10" />
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyPress={handleKeyPress}
                    className="pl-12 backdrop-blur-xl bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl h-14 focus:bg-white/50 dark:focus:bg-white/10 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-indigo-300 focus:border-indigo-400 relative z-10"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300 z-10" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyPress={handleKeyPress}
                    className="pl-12 pr-12 backdrop-blur-xl bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl h-14 focus:bg-white/50 dark:focus:bg-white/10 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-indigo-300 focus:border-indigo-400 relative z-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors duration-300 z-10"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <ErrorDisplay 
                  error={error} 
                  onDismiss={() => setError(null)}
                  className="mt-4"
                />
              )}

              {/* Forgot Password */}
              <div className="text-right">
                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300 font-medium text-sm">
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={!phone || !password || isLoading}
                className="w-full h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-800 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg border border-white/20"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white font-medium">Signing In...</span>
                  </div>
                ) : (
                  <span className="text-white font-medium text-lg">Sign In</span>
                )}
              </Button>
            </div>
          </div>

          {/* Biometric Login */}
          <div className="backdrop-blur-xl bg-white/25 dark:bg-white/5 rounded-2xl p-4 border border-white/30 dark:border-white/10 mb-8 hover:bg-white/35 dark:hover:bg-white/10 transition-all duration-300">
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Use Biometric Login</span>
              </div>
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300 font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
