import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DollarSign, AlertCircle } from 'lucide-react';

interface DepositAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (amount: number, currency: string) => void;
}

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' }
];

export function DepositAmountModal({ isOpen, onClose, onProceed }: DepositAmountModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [errors, setErrors] = useState<{ amount?: string; currency?: string }>({});

  const selectedCurrency = currencies.find(c => c.code === currency);
  const minAmount = currency === 'NGN' ? 1000 : currency === 'USD' ? 10 : 10;

  const validateForm = () => {
    const newErrors: { amount?: string; currency?: string } = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(amount) < minAmount) {
      newErrors.amount = `Minimum amount is ${selectedCurrency?.symbol}${minAmount}`;
    }
    
    if (!currency) {
      newErrors.currency = 'Please select a currency';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (validateForm()) {
      onProceed(parseFloat(amount), currency);
      handleClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setCurrency('NGN');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-gray-800 dark:text-white">
            Top Up Your Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Currency Selection */}
          <div>
            <Label className="text-gray-800 dark:text-white mb-2 block">
              Select Currency
            </Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value)}>
              <SelectTrigger className="bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                      <span>{curr.flag}</span>
                      <span>{curr.code}</span>
                      <span className="text-gray-500">- {curr.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.currency}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" className="text-gray-800 dark:text-white mb-2 block">
              Amount to Deposit
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                {selectedCurrency?.symbol}
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-lg bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white"
                min={minAmount}
                step={currency === 'NGN' ? '100' : '1'}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.amount}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Minimum: {selectedCurrency?.symbol}{minAmount}
            </p>
          </div>

          {/* Fee Information */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-blue-600" />
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Fee Information</p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Deposit Amount:</span>
                  <span className="text-blue-800 dark:text-blue-200">{selectedCurrency?.symbol}{parseFloat(amount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Processing Fee:</span>
                  <span className="text-blue-800 dark:text-blue-200">Free</span>
                </div>
                <hr className="border-blue-300/50" />
                <div className="flex justify-between font-medium">
                  <span className="text-blue-800 dark:text-blue-200">You'll receive:</span>
                  <span className="text-blue-800 dark:text-blue-200">{selectedCurrency?.symbol}{parseFloat(amount || '0').toFixed(2)} in CBUSD</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-1 card-gradient hover:opacity-90 text-white"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
