import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from '../App';

interface SignupScreenProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

export function SignupScreen({ onSignup, onSwitchToLogin }: SignupScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name || !email || !phone || !password || !confirmPassword) return;
    if (password !== confirmPassword) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name,
      email: email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`,
      balance: 100.00, // Welcome bonus
      currency: 'USD',
      phoneNumber: phone,
      verificationLevel: 'basic'
    };
    
    // Save user data to localStorage
    localStorage.setItem(`user_${newUser.id}`, JSON.stringify(newUser));
    
    setIsLoading(false);
    onSignup(newUser);
  };

  const isFormValid = () => {
    const { name, email, phone, password, confirmPassword } = formData;
    return name && email && phone && password && confirmPassword && password === confirmPassword;
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm py-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            </div>
          </div>
          <h1 className="text-3xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600">Join us and start sending money</p>
        </div>

        {/* Signup Form */}
        <div className="backdrop-blur-lg bg-white/30 rounded-3xl p-8 border border-white/40 shadow-2xl mb-6">
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <UserIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-12 focus:bg-white/40 transition-all duration-300"
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
                  className="pl-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-12 focus:bg-white/40 transition-all duration-300"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-12 focus:bg-white/40 transition-all duration-300"
                />
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
                  className="pl-12 pr-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-12 focus:bg-white/40 transition-all duration-300"
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
                  className="pl-12 pr-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-12 focus:bg-white/40 transition-all duration-300"
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
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
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