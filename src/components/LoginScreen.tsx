import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from '../App';
import { authService } from '../services/AuthService';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

export function LoginScreen({ onLogin, onSwitchToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call real backend login API
      const response = await authService.login({ email, password });
      
      if (response.success) {
        // Convert backend user to frontend User type
        const userObj: User = {
          id: response.user.id.toString(),
          name: `${response.user.first_name} ${response.user.last_name}`,
          email: response.user.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.first_name + ' ' + response.user.last_name)}&background=6366f1&color=fff`,
          balance: 1000, // Default balance for new users
          currency: 'USDC',
          phoneNumber: response.user.phone_number || '',
          verificationLevel: response.user.kyc_status === 'verified' ? 'verified' : 'basic'
        };
        
        // Save user data to localStorage (already done in authService, but for compatibility)
        localStorage.setItem(`user_${userObj.id}`, JSON.stringify(userObj));
        
        toast.success('Login successful!');
        onLogin(userObj);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
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
    <div className="h-screen flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            </div>
          </div>
          <h1 className="text-3xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="backdrop-blur-lg bg-white/30 rounded-3xl p-8 border border-white/40 shadow-2xl mb-6">
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-14 focus:bg-white/40 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-14 focus:bg-white/40 transition-all duration-300"
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

            {/* Forgot Password */}
            <div className="text-right">
              <button className="text-blue-600 hover:text-blue-700 transition-colors">
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
        </div>

        {/* Biometric Login */}
        <div className="backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30 mb-6">
          <Button
            variant="outline"
            className="w-full h-12 backdrop-blur-md bg-white/20 border-white/40 rounded-xl hover:bg-white/30 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span>Use Biometric Login</span>
            </div>
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}