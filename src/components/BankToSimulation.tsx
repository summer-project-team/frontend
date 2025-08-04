/**
 * Bank-to-Bank Simulation UI
 * Shows live simulation of the 5-step CrossBridge flow
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle, Clock, ArrowRight, Smartphone, Globe, Coins, CreditCard, MessageSquare, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface SimulationStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  details: string[];
  duration: number; // seconds
  color: string;
}

interface BankToSimulationProps {
  onBack: () => void;
}

const simulationSteps: SimulationStep[] = [
  {
    id: 1,
    title: 'Fiat Simulation Start',
    description: 'Flutterwave Sandbox - ₦100k GTBank Transfer',
    icon: Smartphone,
    details: [
      'User initiates ₦100,000 transfer from GTBank',
      'Flutterwave sandbox processes payment',
      'Webhook signature verification',
      'Transaction status: Successful'
    ],
    duration: 3,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'CrossBridge Core Processing',
    description: 'KYC + Rate Lock + Route Selection',
    icon: Shield,
    details: [
      'KYC verification: VERIFIED ✓',
      'Exchange rate lock: ₦1 = £0.0025',
      'Route selection: Polygon Bridge',
      'Compliance checks passed'
    ],
    duration: 4,
    color: 'bg-purple-500'
  },
  {
    id: 3,
    title: 'Polygon Token Logic',
    description: 'CBUSD Minting + DEX Simulation',
    icon: Coins,
    details: [
      'Network: Polygon Mumbai Testnet',
      'CBUSD minting: £249.50 equivalent',
      'DEX protocol: QuickSwap Mumbai',
      'Smart contract execution'
    ],
    duration: 5,
    color: 'bg-green-500'
  },
  {
    id: 4,
    title: 'GBP Payout Simulation',
    description: 'Mock UK Bank Transfer',
    icon: CreditCard,
    details: [
      'Amount: £249.50',
      'Recipient bank: NatWest Bank',
      'Account: GB29 NWBK 6016 1331 9268 19',
      'SWIFT processing simulation'
    ],
    duration: 6,
    color: 'bg-indigo-500'
  },
  {
    id: 5,
    title: 'Integration Complete',
    description: 'SMS + Logging + Notifications',
    icon: MessageSquare,
    details: [
      'SMS notification sent to recipient',
      'Transaction logged in system',
      'Audit trail created',
      'Total time: ~5-10 minutes'
    ],
    duration: 2,
    color: 'bg-emerald-500'
  }
];

export function BankToSimulation({ onBack }: BankToSimulationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setStepProgress(0);
    setCompletedSteps([]);
  };

  const startSimulation = () => {
    if (completedSteps.length === simulationSteps.length) {
      resetSimulation();
    }
    setIsRunning(true);
  };

  const pauseSimulation = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentStep < simulationSteps.length) {
      const step = simulationSteps[currentStep];
      const progressIncrement = 100 / (step.duration * 10); // 100ms intervals
      
      interval = setInterval(() => {
        setStepProgress(prev => {
          const newProgress = prev + progressIncrement;
          
          if (newProgress >= 100) {
            // Step completed
            setCompletedSteps(prev => [...prev, currentStep]);
            setCurrentStep(prev => prev + 1);
            setStepProgress(0);
            
            // Check if all steps are completed
            if (currentStep === simulationSteps.length - 1) {
              setIsRunning(false);
            }
            
            return 0;
          }
          
          return newProgress;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentStep]);

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) return 'completed';
    if (stepIndex === currentStep && isRunning) return 'active';
    if (stepIndex < currentStep) return 'completed';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/30 dark:border-white/20"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Bank-to-Bank Simulation
        </h1>
        
        <div className="w-10" />
      </div>

      {/* Control Panel */}
      <div className="px-6 mb-8">
        <div className="backdrop-blur-xl bg-white/40 dark:bg-white/10 rounded-3xl p-6 border border-white/30 dark:border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                CrossBridge Flow Simulation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Simulating ₦100,000 → £249.50 transfer via Flutterwave & Polygon
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={isRunning ? pauseSimulation : startSimulation}
                className={`${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-xl px-4 py-2`}
              >
                {isRunning ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="rounded-xl px-4 py-2"
              >
                <RotateCcw size={16} className="mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>{completedSteps.length}/{simulationSteps.length} steps</span>
            </div>
            <Progress 
              value={(completedSteps.length / simulationSteps.length) * 100} 
              className="h-2"
            />
          </div>
        </div>
      </div>

      {/* Simulation Steps */}
      <div className="px-6 space-y-4">
        {simulationSteps.map((step, index) => {
          const status = getStepStatus(index);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const isPending = status === 'pending';
          
          return (
            <div
              key={step.id}
              className={`backdrop-blur-xl border rounded-3xl p-6 transition-all duration-500 ${
                isActive 
                  ? 'bg-white/60 dark:bg-white/15 border-blue-300 dark:border-blue-500 shadow-lg scale-[1.02]'
                  : isCompleted
                  ? 'bg-white/40 dark:bg-white/10 border-green-300 dark:border-green-500'
                  : 'bg-white/30 dark:bg-white/5 border-white/30 dark:border-white/20'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Step Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : isActive ? step.color : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={24} className="text-white" />
                  ) : isActive ? (
                    <Clock size={24} className="text-white animate-pulse" />
                  ) : (
                    <step.icon size={24} className="text-white" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Step {step.id}: {step.title}
                    </h3>
                    {isActive && (
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                        <Clock size={16} />
                        <span className="text-sm font-medium">Processing...</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {step.description}
                  </p>

                  {/* Step Progress Bar */}
                  {isActive && (
                    <div className="mb-3">
                      <Progress value={stepProgress} className="h-1" />
                    </div>
                  )}

                  {/* Step Details */}
                  <div className="space-y-1">
                    {step.details.map((detail, detailIndex) => (
                      <div
                        key={detailIndex}
                        className={`flex items-center space-x-2 text-sm transition-all duration-300 ${
                          isCompleted 
                            ? 'text-green-700 dark:text-green-400'
                            : isActive && stepProgress > (detailIndex / step.details.length) * 100
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-500'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted || (isActive && stepProgress > (detailIndex / step.details.length) * 100)
                            ? 'bg-current'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow to next step */}
                {index < simulationSteps.length - 1 && (
                  <div className={`transition-all duration-300 ${
                    isCompleted ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedSteps.length === simulationSteps.length && (
        <div className="px-6 mt-8 mb-6">
          <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-300 dark:border-green-500 rounded-3xl p-6 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              Simulation Complete!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Successfully simulated ₦100,000 → £249.50 transfer through CrossBridge infrastructure
            </p>
            <Button
              onClick={resetSimulation}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2"
            >
              Run Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
