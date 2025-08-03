import React, { useEffect, useState } from 'react';
import { CreditCard, Zap, Shield, TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 300);
    const timer2 = setTimeout(() => setCurrentStep(2), 800);
    const timer3 = setTimeout(() => setCurrentStep(3), 1300);
    const timer4 = setTimeout(() => setCurrentStep(4), 1800);
    
    // Start fade out
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);
    
    // Complete animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center text-white px-8">
        {/* Logo Animation */}
        <div className={`mb-8 transition-all duration-1000 ${
          currentStep >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'
        }`}>
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
              <CreditCard size={48} className="text-white" />
            </div>
            
            {/* Pulsing ring animation */}
            <div className={`absolute inset-0 w-24 h-24 mx-auto rounded-3xl border-2 border-white/40 transition-all duration-1000 ${
              currentStep >= 2 ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`}></div>
          </div>
        </div>

        {/* App Name */}
        <div className={`mb-4 transition-all duration-800 delay-300 ${
          currentStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            SecureRemit
          </h1>
        </div>

        {/* Tagline */}
        <div className={`mb-12 transition-all duration-800 delay-500 ${
          currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          <p className="text-white/80 text-lg font-medium">
            Send money worldwide, instantly
          </p>
        </div>

        {/* Feature Icons Animation */}
        <div className={`flex justify-center space-x-8 transition-all duration-1000 delay-700 ${
          currentStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-2 animate-bounce">
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-white/70 text-xs font-medium">Fast</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-2 animate-bounce delay-100">
              <Shield size={24} className="text-white" />
            </div>
            <span className="text-white/70 text-xs font-medium">Secure</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-2 animate-bounce delay-200">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-white/70 text-xs font-medium">Smart</span>
          </div>
        </div>

        {/* Loading indicator */}
        <div className={`mt-16 flex justify-center transition-all duration-800 delay-1000 ${
          currentStep >= 4 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full transition-all duration-1000 ${
          currentStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        } animate-pulse`}></div>
        <div className={`absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full transition-all duration-1000 delay-200 ${
          currentStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        } animate-pulse`}></div>
        <div className={`absolute top-1/2 left-1/6 w-1 h-1 bg-white rounded-full transition-all duration-1000 delay-400 ${
          currentStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        } animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/6 w-1 h-1 bg-white rounded-full transition-all duration-1000 delay-600 ${
          currentStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        } animate-pulse`}></div>
      </div>
    </div>
  );
}
