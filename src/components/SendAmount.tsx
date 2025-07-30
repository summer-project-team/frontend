import React, { useState, useEffect } from 'react';
import { ArrowLeft, Fingerprint, RefreshCw, TrendingUp, TrendingDown, Tag, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Recipient } from '../App';
import { ExchangeRateService } from '../services/ExchangeRateService';

interface SendAmountProps {
  recipient: Recipient;
  exchangeRates: { [key: string]: number };
  onBack: () => void;
  onConfirm: (amount: string, category?: string, note?: string) => void;
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

export function SendAmount({ recipient, exchangeRates, onBack, onConfirm }: SendAmountProps) {
  const [amount, setAmount] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(ExchangeRateService.getLastUpdate());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  const exchangeRate = exchangeRates[recipient.currency] || 1;
  const convertedAmount = numericAmount * exchangeRate;
  const transferFee = numericAmount * 0.015; // 1.5% fee
  const totalPayable = numericAmount + transferFee;

  const handleConfirm = async () => {
    if (numericAmount <= 0) return;
    
    setIsConfirming(true);
    
    // Simulate biometric authentication delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onConfirm(amount, category, note);
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 backdrop-blur-lg bg-white/20 border-b border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-gray-800">Enter Amount</h2>
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
      <div className="flex-1 flex items-end p-6">
        <Button
          onClick={handleConfirm}
          disabled={numericAmount <= 0 || isConfirming}
          className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
        >
          {isConfirming ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Fingerprint size={24} />
              <span>Confirm with Fingerprint</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}