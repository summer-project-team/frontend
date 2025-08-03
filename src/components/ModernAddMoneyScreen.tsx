import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, CreditCard, Smartphone, QrCode, DollarSign, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { User } from '../App';
import { toast } from 'sonner';

interface ModernAddMoneyScreenProps {
  user: User;
  onBack: () => void;
  onComplete: (amount: number, currency: string, method: string) => void;
}

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' }
];

const depositMethods = [
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Transfer from your bank account',
    icon: CreditCard,
    processingTime: '1-5 minutes',
    fee: 'Free'
  },
  {
    id: 'ussd',
    name: 'Bank USSD',
    description: 'Use USSD code from your phone',
    icon: Smartphone,
    processingTime: 'Instant',
    fee: 'Free'
  },
  {
    id: 'qr',
    name: 'QR Code',
    description: 'Scan QR with your banking app',
    icon: QrCode,
    processingTime: 'Instant',
    fee: 'Free'
  }
];

type Step = 'amount' | 'method' | 'instructions' | 'confirmation';

export function ModernAddMoneyScreen({ user, onBack, onComplete }: ModernAddMoneyScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositInstructions, setDepositInstructions] = useState<any>(null);

  const selectedCurrency = currencies.find(c => c.code === currency);
  const selectedDepositMethod = depositMethods.find(m => m.id === selectedMethod);
  const minAmount = currency === 'NGN' ? 1000 : currency === 'USD' ? 10 : 10;

  const formatCurrency = (value: number, currencyCode: string = currency): string => {
    if (isNaN(value)) return '0.00';
    const curr = currencies.find(c => c.code === currencyCode);
    return `${curr?.symbol || ''}${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const validateAmount = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numAmount < minAmount) {
      newErrors.amount = `Minimum amount is ${formatCurrency(minAmount)}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountNext = () => {
    if (validateAmount()) {
      setCurrentStep('method');
    }
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setCurrentStep('instructions');
    generateDepositInstructions(methodId);
  };

  const generateDepositInstructions = (methodId: string) => {
    const numAmount = parseFloat(amount);
    const reference = `DEP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const instructions = {
      bank: {
        bankName: 'CrossBridge Bank',
        accountNumber: '1234567890',
        accountName: 'CrossBridge Payments Ltd',
        reference: reference,
        amount: numAmount,
        currency: currency,
        steps: [
          'Log into your banking app or visit your bank',
          'Select "Transfer" or "Send Money"',
          `Transfer ${formatCurrency(numAmount)} to account ${1234567890}`,
          `Use reference: ${reference}`,
          'Complete the transfer',
          'Your wallet will be credited within 1-5 minutes'
        ]
      },
      ussd: {
        ussdCode: '*737*1*Amount*1234567890#',
        reference: reference,
        amount: numAmount,
        currency: currency,
        steps: [
          `Dial *737*1*${numAmount}*1234567890# on your phone`,
          'Enter your bank PIN when prompted',
          `Use reference: ${reference}`,
          'Confirm the transaction',
          'Your wallet will be credited instantly'
        ]
      },
      qr: {
        qrData: `crossbridge://deposit?amount=${numAmount}&currency=${currency}&ref=${reference}`,
        reference: reference,
        amount: numAmount,
        currency: currency,
        steps: [
          'Open your banking app',
          'Find the "QR Code" or "Scan to Pay" option',
          'Scan the QR code below',
          'Confirm the payment details',
          'Complete the transaction',
          'Your wallet will be credited instantly'
        ]
      }
    };

    setDepositInstructions(instructions[methodId as keyof typeof instructions]);
  };

  const handleComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onComplete(parseFloat(amount), currency, selectedMethod);
      toast.success('Deposit instructions generated! Follow the steps to complete your deposit.');
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {['amount', 'method', 'instructions'].map((step, index) => (
          <React.Fragment key={step}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              currentStep === step 
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/30' 
                : index < ['amount', 'method', 'instructions'].indexOf(currentStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-white/30 dark:bg-white/10 text-gray-600 dark:text-gray-400'
            }`}>
              {index < ['amount', 'method', 'instructions'].indexOf(currentStep) ? (
                <CheckCircle size={16} />
              ) : (
                index + 1
              )}
            </div>
            {index < 2 && (
              <div className={`w-8 h-0.5 transition-all duration-300 ${
                index < ['amount', 'method', 'instructions'].indexOf(currentStep)
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">How much would you like to add?</h2>
        <p className="text-gray-600 dark:text-gray-400">Enter the amount you want to deposit to your wallet</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-gray-700 dark:text-gray-300 mb-2 block font-medium">Select Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="bg-white/70 dark:bg-white/10 backdrop-blur-lg border-white/50 dark:border-white/20 text-gray-800 dark:text-white h-14 text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  <div className="flex items-center space-x-2">
                    <span>{curr.flag}</span>
                    <span>{curr.symbol} {curr.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-gray-700 dark:text-gray-300 mb-2 block font-medium">Amount</Label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min. ${formatCurrency(minAmount)}`}
              className="bg-white/70 dark:bg-white/10 backdrop-blur-lg border-white/50 dark:border-white/20 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg pl-12 h-14"
            />
            <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          </div>
          {errors.amount && (
            <div className="flex items-center space-x-2 mt-2 text-red-500 dark:text-red-400">
              <AlertCircle size={16} />
              <span className="text-sm">{errors.amount}</span>
            </div>
          )}
        </div>

        {amount && !errors.amount && parseFloat(amount) >= minAmount && (
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">You'll receive:</span>
              <span className="text-gray-800 dark:text-white font-semibold text-lg">{formatCurrency(parseFloat(amount))}</span>
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={handleAmountNext}
        disabled={!amount || parseFloat(amount) < minAmount}
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white h-14 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 text-lg"
      >
        Continue
      </Button>
    </div>
  );

  const renderMethodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Choose deposit method</h2>
        <p className="text-gray-600 dark:text-gray-400">Select how you want to add money to your wallet</p>
      </div>

      <div className="space-y-4">
        {depositMethods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className="w-full p-6 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-3xl border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300 text-left group shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-blue-500/30">
                  <Icon size={26} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-800 dark:text-white font-semibold text-lg">{method.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{method.description}</p>
                  <div className="flex space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span>• {method.processingTime}</span>
                    <span>• {method.fee}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100/50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                  <ExternalLink size={20} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button 
        onClick={() => setCurrentStep('amount')}
        className="w-full h-14 backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 text-gray-700 dark:text-gray-300 font-medium text-lg"
      >
        Back
      </button>
    </div>
  );

  const renderInstructionsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Follow these steps</h2>
        <p className="text-gray-600 dark:text-gray-400">Complete your {selectedDepositMethod?.name} deposit</p>
      </div>

      {depositInstructions && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <p className="text-gray-800 dark:text-white font-semibold">{formatCurrency(depositInstructions.amount)}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Method:</span>
                <p className="text-gray-800 dark:text-white font-semibold">{selectedDepositMethod?.name}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Reference:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-gray-800 dark:text-white font-mono text-sm">{depositInstructions.reference}</p>
                  <button
                    onClick={() => copyToClipboard(depositInstructions.reference)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Transfer Details */}
          {selectedMethod === 'bank' && (
            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg">
              <h3 className="text-gray-800 dark:text-white font-semibold mb-4">Bank Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Bank Name:</span>
                  <span className="text-gray-800 dark:text-white">{depositInstructions.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Account Number:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 dark:text-white font-mono">{depositInstructions.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(depositInstructions.accountNumber)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Account Name:</span>
                  <span className="text-gray-800 dark:text-white">{depositInstructions.accountName}</span>
                </div>
              </div>
            </div>
          )}

          {/* USSD Code */}
          {selectedMethod === 'ussd' && (
            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg">
              <h3 className="text-gray-800 dark:text-white font-semibold mb-4">USSD Code</h3>
              <div className="flex items-center space-x-2">
                <code className="text-blue-600 dark:text-blue-400 font-mono text-lg">{depositInstructions.ussdCode}</code>
                <button
                  onClick={() => copyToClipboard(depositInstructions.ussdCode)}
                  className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-500/30 transition-all duration-300"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {/* QR Code */}
          {selectedMethod === 'qr' && (
            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg text-center">
              <h3 className="text-gray-800 dark:text-white font-semibold mb-4">QR Code</h3>
              <div className="w-48 h-48 bg-white rounded-2xl mx-auto flex items-center justify-center">
                <QrCode size={120} className="text-gray-800" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">Scan this QR code with your banking app</p>
            </div>
          )}

          {/* Steps */}
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg">
            <h3 className="text-gray-800 dark:text-white font-semibold mb-4">Instructions</h3>
            <ol className="space-y-2">
              {depositInstructions.steps.map((step: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button 
          onClick={handleComplete}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white h-14 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-600/30 text-lg disabled:opacity-50"
        >
          {isProcessing ? 'Generating...' : 'I\'ve Completed the Transfer'}
        </button>
        <button 
          onClick={() => setCurrentStep('method')}
          className="w-full h-14 backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 text-gray-700 dark:text-gray-300 font-medium text-lg"
        >
          Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <button
            onClick={onBack}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Add Money</h1>
          <div className="w-12"></div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <div className="max-w-md mx-auto">
          {currentStep === 'amount' && renderAmountStep()}
          {currentStep === 'method' && renderMethodStep()}
          {currentStep === 'instructions' && renderInstructionsStep()}
        </div>
      </div>
    </div>
  );
}
