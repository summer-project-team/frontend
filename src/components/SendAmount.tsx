import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Tag,
  FileText,
  RefreshCw,
  Fingerprint
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
  // Remove any spaces, dashes, or parentheses
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // If phone starts with +, extract the country code
  if (cleanPhone.startsWith('+')) {
    // Common country codes to match against
    const countryCodes = [
      { code: '+234', length: 4 },  // Nigeria
      { code: '+44', length: 3 },   // UK
      { code: '+1', length: 2 },    // US/Canada
      { code: '+233', length: 4 },  // Ghana
      { code: '+254', length: 4 },  // Kenya
      { code: '+27', length: 3 },   // South Africa
    ];
    
    // Try to match known country codes
    for (const country of countryCodes) {
      if (cleanPhone.startsWith(country.code)) {
        return country.code;
      }
    }
    
    // Fallback: extract first 1-4 digits after +
    const match = cleanPhone.match(/^\+(\d{1,4})/);
    if (match) {
      return `+${match[1]}`;
    }
  }
  
  // Default to Nigeria if we can't determine
  return '+234';
};

// Helper function to get recipient country code
const getRecipientCountryCode = (recipient: Recipient): string => {
  if (recipient.currency === 'CBUSD' && recipient.phone) {
    // For app users, extract country code from phone number
    return extractCountryCode(recipient.phone);
  } else {
    // For bank transfers, use the actual country
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

interface SendAmountProps {
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
}

// Transaction categories
const transactionCategories = [
  { value: 'family_friends', label: '👨‍👩‍👧‍👦 Family & Friends', description: 'Personal transfers' },
  { value: 'business', label: '💼 Business', description: 'Business payments & transactions' },
  { value: 'bills_utilities', label: '🏠 Bills & Utilities', description: 'Rent, electricity, water, etc.' },
  { value: 'education', label: '🎓 Education', description: 'School fees, courses, books' },
  { value: 'medical', label: '🏥 Medical', description: 'Healthcare & medical expenses' },
  { value: 'shopping', label: '🛍️ Shopping', description: 'Online purchases & retail' },
  { value: 'travel', label: '✈️ Travel', description: 'Hotels, flights, transport' },
  { value: 'investment', label: '📈 Investment', description: 'Stocks, crypto, savings' },
  { value: 'other', label: '📌 Other', description: 'Miscellaneous transactions' },
];

export function SendAmount({ 
  recipient, 
  type,
  exchangeRates, 
  onBack, 
  onConfirm,
  onError
}: SendAmountProps) {
  console.log('SendAmount: Component mounted with:', { 
    recipient: recipient.name, 
    type, 
    currency: recipient.currency,
    hasPhone: !!(recipient.phone || recipient.phoneNumber),
    hasAccount: !!recipient.accountNumber
  });
  const [amount, setAmount] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState('');
  
  // PIN authentication states
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);
  const [pinError, setPinError] = useState('');
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(ExchangeRateService.getLastUpdate());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if user has PIN enabled when component mounts
    const checkPinStatus = async () => {
      try {
        console.log('SendAmount: Checking PIN status...');
        const { pinEnabled } = await UserService.getPinStatus();
        console.log('SendAmount: PIN status retrieved:', { pinEnabled });
        setPinRequired(pinEnabled); // Set based on actual PIN status
      } catch (error) {
        console.error('SendAmount: Error checking PIN status:', error);
        setPinRequired(true); // Default to requiring PIN if check fails
      }
    };
    
    checkPinStatus();
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  const exchangeRate = exchangeRates[recipient.currency] || 1;
  const convertedAmount = numericAmount * exchangeRate;
  const transferFee = numericAmount * 0.015; // 1.5% fee
  const totalPayable = numericAmount + transferFee;

  const {
    transaction,
    loading,
    error: txError,
    sendMoney,
    withdraw
  } = useTransaction();

  const handleConfirm = async () => {
    console.log('SendAmount: handleConfirm called with amount:', numericAmount);
    console.log('SendAmount: PIN required:', pinRequired, 'PIN input shown:', showPinInput);
    
    if (numericAmount <= 0) {
      console.log('SendAmount: Invalid amount, returning');
      return;
    }
    
    // If PIN is required and not yet verified, show PIN input
    if (pinRequired && !showPinInput) {
      console.log('SendAmount: Showing PIN input');
      setShowPinInput(true);
      return;
    }

    // If PIN input is shown, this should not be called directly
    if (showPinInput) {
      console.log('SendAmount: PIN input is shown, returning');
      return;
    }

    console.log('SendAmount: Starting transaction without PIN...');
    setIsConfirming(true);
    
    // Validate recipient data before proceeding with transaction
    console.log('=== VALIDATING RECIPIENT DATA (NO PIN) ===');
    debugRecipientData(recipient);
    const validation = validateRecipient(recipient);
    
    if (!validation.isValid) {
      console.error('Recipient validation failed:', validation);
      const error = createIncompleteRecipientError(recipient, validation);
      setIsConfirming(false);
      toast.error(error.message);
      return;
    }
    
    console.log('Recipient validation passed, proceeding with transaction...');
    
    try {
      // Direct transaction calls without quote dependency
      if (type === 'app_transfer' && (recipient.phone || recipient.phoneNumber)) {
        const phoneNumber = recipient.phone || recipient.phoneNumber;
        if (!phoneNumber) {
          throw new Error('Phone number is required for app transfer');
        }
        console.log('Making app transfer with phone:', phoneNumber);
        console.log('Extracted country code:', getRecipientCountryCode(recipient));
        const result = await sendMoney({
          recipient_phone: phoneNumber,
          recipient_country_code: getRecipientCountryCode(recipient),
          amount: numericAmount,
          narration: note
        });
        
        // Call onConfirm with the actual transaction ID from backend
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
          account_holder_name: recipient.name
        });
        
        // Call onConfirm with the actual transaction ID from backend
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

  const handlePinComplete = async (pin: string) => {
    console.log('PIN verification started...');
    setCheckingPin(true);
    setPinError('');
    
    try {
      // First verify the PIN
      console.log('Verifying PIN...');
      await PinService.verifyPin({ pin });
      console.log('PIN verified successfully');
      
      // PIN verified successfully, now validate recipient data before proceeding
      console.log('=== VALIDATING RECIPIENT DATA ===');
      debugRecipientData(recipient);
      const validation = validateRecipient(recipient);
      
      if (!validation.isValid) {
        console.error('Recipient validation failed:', validation);
        const error = createIncompleteRecipientError(recipient, validation);
        throw error;
      }
      
      console.log('Recipient validation passed, proceeding with transaction...');
      setShowPinInput(false);
      setIsConfirming(true);
      setPinAttempts(0); // Reset attempts on success
      
      console.log('Starting transaction...');
      console.log('Transaction type:', type);
      console.log('Recipient:', recipient);
      console.log('Phone number check:', recipient.phone || recipient.phoneNumber);
      console.log('Account number check:', recipient.accountNumber);
      
      if (type === 'app_transfer' && (recipient.phone || recipient.phoneNumber)) {
        const phoneNumber = recipient.phone || recipient.phoneNumber;
        if (!phoneNumber) {
          throw new Error('Phone number is required for app transfer');
        }
        console.log('Making app transfer with phone:', phoneNumber);
        const countryCode = getRecipientCountryCode(recipient);
        console.log('Extracted country code:', countryCode);
        console.log('Raw phone from recipient:', recipient.phone);
        const result = await sendMoney({
          recipient_phone: phoneNumber,
          recipient_country_code: countryCode,
          amount: numericAmount,
          narration: note,
          transaction_pin: pin
        });
        
        console.log('Transfer successful:', result);
        onConfirm({
          amount: amount,
          category,
          note,
          transactionId: result.id,
          exchangeRate: exchangeRate
        });
      } else if (type === 'bank_withdrawal' && recipient.accountNumber) {
        console.log('Making bank withdrawal with account:', recipient.accountNumber);
        const result = await withdraw({
          amount: numericAmount,
          currency: recipient.currency,
          bank_account_number: recipient.accountNumber,
          bank_name: recipient.bankName || 'Unknown Bank',
          account_holder_name: recipient.name,
          transaction_pin: pin
        });
        
        console.log('Withdrawal successful:', result);
        onConfirm({
          amount: amount,
          category,
          note,
          transactionId: result.id,
          exchangeRate: exchangeRate
        });
      } else if (type === 'bank_withdrawal' && !recipient.accountNumber) {
        // Special case: bank withdrawal but missing account details
        throw new Error(`Cannot process bank withdrawal for "${recipient.name}". Account details are missing. Please update this recipient with their bank account information.`);
      } else {
        // Neither condition met - log what we have
        console.error('Transaction type/recipient mismatch:');
        console.error('Type:', type);
        console.error('Has phone:', !!(recipient.phone || recipient.phoneNumber));
        console.error('Has account:', !!recipient.accountNumber);
        console.error('Full recipient:', recipient);
        throw new Error(`Cannot process ${type} transaction with current recipient data`);
      }
    } catch (error) {
      console.error('PIN verification or transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setPinError(errorMessage);
      setPinAttempts(prev => prev + 1);
      
      // Keep PIN input open on error for retry
      setShowPinInput(true);
    } finally {
      setCheckingPin(false);
      setIsConfirming(false);
    }
  };

  const handlePinCancel = () => {
    setShowPinInput(false);
    setPinError('');
    setPinAttempts(0);
  };

  const handlePinClear = () => {
    setPinError('');
  };

  const getChangeIndicator = () => {
    const change = ExchangeRateService.getChangeIndicator(recipient.currency);
    if (change === 'up') return <TrendingUp size={12} className="text-green-600" />;
    if (change === 'down') return <TrendingDown size={12} className="text-red-600" />;
    return null;
  };

  const getChangePercentage = () => {
    const change = ExchangeRateService.getChangePercentage(recipient.currency);
    return Math.abs(change).toFixed(2);
  };

  const formatTimeSinceUpdate = () => {
    const secondsAgo = Math.floor((Date.now() - lastUpdate) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  };

  return (
    <div className="h-screen flex flex-col safe-top">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-4 backdrop-blur-lg bg-white/20 border-b border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30 no-tap-highlight haptic-light touch-target"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-gray-800 no-select">Enter Amount</h2>
        <div className="w-10"></div>
      </div>

      {/* Recipient Card (Collapsed) */}
      <div className="p-6">
        <div className="backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={recipient.avatar} />
              <AvatarFallback>{recipient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-gray-800">{recipient.name}</p>
              <p className="text-sm text-gray-600">{recipient.country}</p>
            </div>
            <div className="flex-1"></div>
            <div className="text-xs bg-white/40 px-2 py-1 rounded-full text-gray-600">
              {recipient.currency}
            </div>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="px-6 mb-6">
        <div className="text-center mb-4">
          <p className="text-gray-600 mb-2">You Send</p>
          <div className="relative">
            <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-3xl text-gray-500">$</span>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-center text-4xl h-20 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl focus:bg-white/40 transition-all duration-300 pl-14 pr-6"
            />
          </div>
        </div>

        {/* Real-time Conversion */}
        {numericAmount > 0 && (
          <div className="text-center">
            <div className="backdrop-blur-md bg-green-500/20 rounded-2xl p-4 border border-green-500/30">
              <p className="text-green-700 mb-1">Recipient gets</p>
              <p className="text-2xl text-green-800">
                {ExchangeRateService.formatRate(convertedAmount, recipient.currency)} {recipient.currency}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category and Note */}
      <div className="px-6 mb-6">
        <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
          <h3 className="text-gray-700 mb-4 flex items-center gap-2">
            <Tag size={18} />
            Transaction Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-gray-700 text-sm font-medium mb-2 block">
                Category (Optional)
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/30 border-white/40 text-gray-800">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {transactionCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-xs text-gray-500">{cat.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="note" className="text-gray-700 text-sm font-medium mb-2 block flex items-center gap-2">
                <FileText size={16} />
                Note (Optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Add a note for this transaction..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                className="bg-white/30 border-white/40 text-gray-800 resize-none h-20"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{note.length}/100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate & Fee Breakdown */}
      <div className="px-6 mb-8">
        <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-700">Rate & Fees</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <RefreshCw size={12} />
              <span>Updated {formatTimeSinceUpdate()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Exchange Rate</span>
              <div className="flex items-center space-x-2">
                {getChangeIndicator()}
                <span className="text-gray-800">
                  1 USD = {ExchangeRateService.formatRate(exchangeRate, recipient.currency)} {recipient.currency}
                </span>
              </div>
            </div>
            {ExchangeRateService.getChangeIndicator(recipient.currency) !== 'neutral' && (
              <div className="flex justify-between">
                <span className="text-gray-600">24h Change</span>
                <span className={`text-sm ${
                  ExchangeRateService.getChangeIndicator(recipient.currency) === 'up' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {ExchangeRateService.getChangeIndicator(recipient.currency) === 'up' ? '+' : '-'}
                  {getChangePercentage()}%
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Transfer Fee (1.5%)</span>
              <span className="text-gray-800">${transferFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/40 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Payable</span>
                <span className="text-gray-800">${totalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Confirmation Button */}
      <div className="flex-1 flex items-end p-6 safe-bottom">
        <Button
          onClick={handleConfirm}
          disabled={numericAmount <= 0 || isConfirming}
          className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 mobile-button no-tap-highlight"
        >
          {isConfirming ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Fingerprint size={24} />
              <span>Confirm with PIN</span>
            </div>
          )}
        </Button>
      </div>

      {/* PIN Input Modal */}
      {showPinInput && (
        <PinInput
          onPinComplete={handlePinComplete}
          onCancel={handlePinCancel}
          onClear={handlePinClear}
          title="Enter Transaction PIN"
          subtitle={`Confirm ${type === 'app_transfer' ? 'transfer' : 'withdrawal'} of $${numericAmount.toFixed(2)}`}
          error={pinError}
          isVerifying={checkingPin}
          currentAttempt={pinAttempts}
          maxAttempts={3}
        />
      )}
    </div>
  );
}