import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Tag,
  FileText,
  RefreshCw,
  Fingerprint,
  Send,
  Calculator,
  Wallet,
  Shield
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Recipient } from '../App';
import { ExchangeRateService } from '../services/ExchangeRateService';
import { useTransaction } from '../hooks/useTransaction';
import { SendMoneyRequest, WithdrawRequest } from '../types/transaction';
import { UserService } from '../services/UserService';
import PinService from '../services/PinService';
import { PinInput } from './PinInput';
import { validateRecipient, getRecipientTypeFromTransaction, createIncompleteRecipientError, debugRecipientData } from '../utils/recipientValidation';
import { toast } from 'sonner';

// Helper function to extract country code from phone number
const extractCountryCode = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  if (cleanPhone.startsWith('+')) {
    const countryCodes = [
      { code: '+234', length: 4 },  // Nigeria
      { code: '+44', length: 3 },   // UK
      { code: '+1', length: 2 },    // US/Canada
      { code: '+233', length: 4 },  // Ghana
      { code: '+254', length: 4 },  // Kenya
      { code: '+27', length: 3 },   // South Africa
    ];
    
    for (const country of countryCodes) {
      if (cleanPhone.startsWith(country.code)) {
        return country.code;
      }
    }
    
    const match = cleanPhone.match(/^\+(\d{1,4})/);
    if (match) {
      return `+${match[1]}`;
    }
  }
  
  return '+234';
};

const getRecipientCountryCode = (recipient: Recipient): string => {
  if (recipient.currency === 'CBUSD' && recipient.phone) {
    return extractCountryCode(recipient.phone);
  } else {
    const countryCodeMap: { [key: string]: string } = {
      'Nigeria': '+234',
      'United Kingdom': '+44',
      'United States': '+1',
      'Ghana': '+233',
      'Kenya': '+254',
      'South Africa': '+27'
    };
    return countryCodeMap[recipient.country] || '+234';
  }
};

interface ModernSendAmountProps {
  recipient: Recipient & {
    phoneNumber?: string;
    bankCode?: string;
    accountNumber?: string;
  };
  type: 'app_transfer' | 'bank_withdrawal';
  exchangeRates: { [key: string]: number };
  onBack: () => void;
  onConfirm: (params: {
    amount: string;
    category?: string;
    note?: string;
    transactionId?: string;
    exchangeRate?: number;
  }) => void;
  onError?: (error: Error) => void;
  onNavigateToPin?: (config: {
    purpose: 'verify' | 'setup' | 'change';
    title?: string;
    subtitle?: string;
    requireCurrentPin?: boolean;
    onSuccess?: (pin: string) => void;
    onCurrentPinVerified?: () => void;
    returnScreen?: 'login' | 'signup' | 'home' | 'recipients' | 'amount' | 'success' | 'failure' | 'profile' | 'history' | 'receipt' | 'notifications' | 'analytics' | 'deposit-instructions' | 'withdraw' | 'bank-accounts' | 'add-money' | 'pin';
  }) => void;
}

const transactionCategories = [
  { value: 'family_friends', label: 'Family & Friends', description: 'Personal transfers' },
  { value: 'business', label: 'Business', description: 'Business payments' },
  { value: 'bills_utilities', label: 'Bills & Utilities', description: 'Regular payments' },
  { value: 'education', label: 'Education', description: 'School fees, courses' },
  { value: 'medical', label: 'Medical', description: 'Healthcare expenses' },
  { value: 'shopping', label: 'Shopping', description: 'Purchases and goods' },
  { value: 'travel', label: 'Travel', description: 'Tourism and travel' },
  { value: 'investment', label: 'Investment', description: 'Investment transfers' },
  { value: 'other', label: 'Other', description: 'Other purposes' }
];

// Helper function to format amount for display
const formatAmount = (amount: number, currency: string): string => {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function ModernSendAmount({
  recipient,
  type,
  exchangeRates,
  onBack,
  onConfirm,
  onError,
  onNavigateToPin
}: ModernSendAmountProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [lastRateUpdate, setLastRateUpdate] = useState(Date.now());

  const { sendMoney, withdraw, loading: transactionLoading, error: transactionError } = useTransaction();

  const numericAmount = parseFloat(amount) || 0;
  const convertedAmount = numericAmount * exchangeRate;
  const estimatedFee = numericAmount * 0.02; // 2% fee
  const totalAmount = numericAmount + estimatedFee;

  useEffect(() => {
    const updateExchangeRate = () => {
      if (recipient.currency && recipient.currency !== 'CBUSD') {
        const rate = ExchangeRateService.getRate(recipient.currency) || 1;
        setExchangeRate(rate);
        setLastRateUpdate(Date.now());
      }
    };

    updateExchangeRate();
    const interval = setInterval(updateExchangeRate, 30000);
    return () => clearInterval(interval);
  }, [recipient.currency]);

  const isFormValid = () => {
    return numericAmount > 0 && numericAmount <= 100000;
  };

  const handlePinComplete = async (pin: string) => {
    setCheckingPin(true);
    setPinError('');
    
    try {
      await PinService.verifyPin({ pin });
      
      const validation = validateRecipient(recipient);
      if (!validation.isValid) {
        const error = createIncompleteRecipientError(recipient, validation);
        throw error;
      }
      
      setShowPinInput(false);
      setIsConfirming(true);
      setPinAttempts(0);
      
      await executeTransaction(pin);
      
    } catch (err) {
      console.error('PIN verification or transaction failed:', err);
      setPinAttempts(prev => prev + 1);
      if (pinAttempts >= 2) {
        setShowPinInput(false);
        onError?.(new Error('Too many failed PIN attempts. Please try again later.'));
      } else {
        setPinError(err instanceof Error ? err.message : 'Invalid PIN');
      }
    } finally {
      setCheckingPin(false);
    }
  };

  const executeTransaction = async (transactionPin?: string) => {
    try {
      if (type === 'app_transfer' && (recipient.phone || recipient.phoneNumber)) {
        const phoneNumber = recipient.phone || recipient.phoneNumber;
        if (!phoneNumber) {
          throw new Error('Phone number is required for app transfer');
        }
        
        const result = await sendMoney({
          recipient_phone: phoneNumber,
          recipient_country_code: getRecipientCountryCode(recipient),
          amount: numericAmount,
          narration: note,
          transaction_pin: transactionPin
        });
        
        onConfirm({
          amount: amount,
          category,
          note,
          transactionId: result.id,
          exchangeRate: exchangeRate
        });
      } else if (type === 'bank_withdrawal' && recipient.accountNumber) {
        const result = await withdraw({
          amount: numericAmount,
          currency: recipient.currency,
          bank_account_number: recipient.accountNumber,
          bank_name: recipient.bankName || 'Unknown Bank',
          account_holder_name: recipient.name,
          transaction_pin: transactionPin
        });
        
        onConfirm({
          amount: amount,
          category,
          note,
          transactionId: result.id,
          exchangeRate: exchangeRate
        });
      } else {
        throw new Error('Invalid recipient information for the selected transfer type');
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      onError?.(err instanceof Error ? err : new Error('Transaction failed'));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirm = async () => {
    if (!isFormValid()) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const { pinEnabled } = await UserService.getPinStatus();
      
      if (pinEnabled) {
        if (onNavigateToPin) {
          onNavigateToPin({
            purpose: 'verify',
            title: 'Confirm Transaction',
            subtitle: `Send ${formatAmount(numericAmount, recipient.currency)} to ${recipient.name}`,
            onSuccess: handlePinComplete,
            returnScreen: 'amount'
          });
        } else {
          // Fallback to modal if navigation not available
          setShowPinInput(true);
        }
      } else {
        // PIN is not setup, show modal
        setShowPinSetupModal(true);
      }
    } catch (err) {
      console.error('Error checking PIN status:', err);
      onError?.(err instanceof Error ? err : new Error('Failed to process transaction'));
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  };

  if (showPinInput) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="flex items-center justify-between p-4 pt-8 backdrop-blur-lg bg-white/30 dark:bg-white/10 border-b border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPinInput(false)}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-gray-800 dark:text-white font-semibold">Enter PIN</h2>
          <div className="w-10"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <PinInput
              onPinComplete={handlePinComplete}
              isVerifying={checkingPin}
              error={pinError}
              currentAttempt={pinAttempts}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-8 backdrop-blur-lg bg-white/30 dark:bg-white/10 border-b border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Send Money</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Recipient Card */}
        <div className="p-4 pt-6">
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 border-2 border-white/50">
                <AvatarImage src={recipient.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                  {recipient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-white font-semibold">{recipient.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{recipient.country}</p>
              </div>
              <div className="px-3 py-1 bg-indigo-500/20 rounded-full">
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">{recipient.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="px-4 mb-6">
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Send size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">You Send</p>
              </div>
              
              <div className="relative">
                <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-3xl text-gray-500 dark:text-gray-400">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-center text-4xl h-16 bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/20 rounded-2xl focus:bg-white/60 dark:focus:bg-white/10 transition-all duration-300 pl-14 pr-6 text-gray-800 dark:text-white placeholder:text-gray-400"
                />
              </div>
              
              {numericAmount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Fee: ${estimatedFee.toFixed(2)} • Total: ${totalAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Real-time Conversion */}
            {numericAmount > 0 && recipient.currency !== 'CBUSD' && (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-4 border border-green-500/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                    <Calculator size={12} className="text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-700 dark:text-green-400 font-medium text-sm">Recipient gets</p>
                </div>
                <p className="text-center text-2xl text-green-800 dark:text-green-300 font-bold">
                  {ExchangeRateService.formatRate(convertedAmount, recipient.currency)} {recipient.currency}
                </p>
                <p className="text-center text-xs text-green-600 dark:text-green-400 mt-1">
                  Rate: 1 USD = {exchangeRate.toFixed(4)} {recipient.currency} • {formatTimeAgo(lastRateUpdate)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="px-4 mb-6">
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Tag size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-gray-800 dark:text-white font-semibold">Transaction Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 block">
                  Category (Optional)
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/20 text-gray-800 dark:text-white rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-white/50 dark:border-gray-700">
                    {transactionCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div>
                          <div className="font-medium">{cat.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{cat.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="note" className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 block">
                  Note (Optional)
                </Label>
                <Textarea
                  id="note"
                  placeholder="Add a note for this transaction..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/20 rounded-xl resize-none text-gray-800 dark:text-white placeholder:text-gray-400"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="p-4 pb-28 backdrop-blur-lg bg-white/30 dark:bg-white/10 border-t border-white/20">
        <Button
          onClick={handleConfirm}
          disabled={!isFormValid() || isConfirming || transactionLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl h-14 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isConfirming || transactionLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Processing...
            </>
          ) : (
            <>
              <Send className="mr-2" size={20} />
              Send ${numericAmount.toFixed(2)}
            </>
          )}
        </Button>
      </div>

      {/* PIN Setup Modal */}
      {showPinSetupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md border border-gray-200/30 dark:border-white/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">PIN Not Setup</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You need to setup a transaction PIN before you can send money securely.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowPinSetupModal(false);
                  onNavigateToPin?.({
                    purpose: 'setup',
                    title: 'Setup Transaction PIN',
                    subtitle: 'Create a 4-digit PIN to secure your transactions',
                    returnScreen: 'amount'
                  });
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl h-12"
              >
                Setup PIN Now
              </Button>
              
              <Button
                onClick={() => setShowPinSetupModal(false)}
                variant="outline"
                className="w-full rounded-2xl h-12 border-gray-200 dark:border-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
