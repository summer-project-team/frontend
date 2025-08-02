import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { AlertCircle, Landmark, Loader2, ArrowLeft, Lock, Shield } from 'lucide-react';
import { bankingService, type BankAccount } from '../services/BankingService';
import { PinInput } from './PinInput';

interface WithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onWithdraw: (amount: number, selectedAccount: any, pin: string, twoFactorCode?: string) => void;
}

export function WithdrawDialog({ isOpen, onClose, userBalance, onWithdraw }: WithdrawDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');

  // Load linked bank accounts when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadLinkedAccounts();
    }
  }, [isOpen]);

  const loadLinkedAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const accounts = await bankingService.getAccounts();
      setLinkedAccounts(accounts);
      
      if (accounts.length === 0) {
        toast.error('No linked bank accounts found. Please link a bank account first.');
      }
    } catch (error: any) {
      console.error('Error loading bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const getWithdrawalFee = (withdrawAmount: number) => {
    return withdrawAmount * 0.004; // 0.4% withdrawal fee (matches backend)
  };

  const isHighValueWithdrawal = (amount: number) => {
    return amount > 1000000; // Same threshold as backend
  };

  // Convert NGN to CBUSD (1500 NGN = 1 CBUSD)
  const convertNgnToCbusd = (ngnAmount: number) => {
    return ngnAmount / 1500;
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (numAmount > userBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (numAmount < 10) {
      toast.error('Minimum withdrawal amount is ₦10');
      return;
    }
    
    if (linkedAccounts.length === 0) {
      toast.error('No linked bank accounts found. Please link a bank account first.');
      return;
    }
    
    setStep(2);
  };

  const handleAccountSelect = (account: BankAccount) => {
    setSelectedAccount(account);
  };

  const handleAccountNext = () => {
    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return;
    }
    
    const numAmount = parseFloat(amount);
    // Check if high value withdrawal requires 2FA
    if (isHighValueWithdrawal(numAmount)) {
      setStep(4); // Go to 2FA step
    } else {
      setStep(3); // Go directly to PIN step
    }
  };

  const handlePinComplete = async (enteredPin: string) => {
    setPin(enteredPin);
    setPinError('');
    
    // Automatically trigger withdrawal when PIN is completed
    console.log('WithdrawDialog: PIN completed, automatically triggering withdrawal');
    
    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return;
    }
    
    const numAmount = parseFloat(amount);
    const fee = getWithdrawalFee(numAmount);
    const totalDeduction = numAmount + fee;
    
    if (totalDeduction > userBalance) {
      toast.error('Insufficient balance including fees');
      return;
    }
    
    const bankDetails = {
      id: selectedAccount.id,
      account_number: selectedAccount.account_number,
      bank_name: selectedAccount.bank_name,
      bank_code: selectedAccount.bank_code,
      account_name: selectedAccount.account_name,
      account_type: selectedAccount.account_type,
      currency: selectedAccount.currency
    };
    
    console.log('WithdrawDialog: Setting isLoading to true');
    setIsLoading(true);
    
    try {
      console.log('WithdrawDialog: Calling onWithdraw with:', { numAmount, bankDetails, pin: enteredPin, twoFactorCode });
      await onWithdraw(numAmount, bankDetails, enteredPin, twoFactorCode || undefined);
      console.log('WithdrawDialog: onWithdraw completed successfully');
      onClose();
      resetForm();
    } catch (error) {
      console.error('WithdrawDialog: onWithdraw failed:', error);
      toast.error('Withdrawal failed. Please try again.');
      // Clear the PIN so user can try again
      setPin('');
    } finally {
      console.log('WithdrawDialog: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleTwoFactorNext = () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit 2FA code');
      return;
    }
    setTwoFactorError('');
    setStep(3); // Go to PIN step
  };

  const handlePinClear = () => {
    setPin('');
    setPinError('');
  };

  const handleWithdraw = async () => {
    console.log('WithdrawDialog: handleWithdraw called');
    console.log('WithdrawDialog: Current state - pin:', pin, 'pin.length:', pin?.length, 'isLoading:', isLoading);
    
    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return;
    }
    if (!pin || pin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }
    const numAmount = parseFloat(amount);
    const fee = getWithdrawalFee(numAmount);
    const totalDeduction = numAmount + fee;
    if (totalDeduction > userBalance) {
      toast.error('Insufficient balance including fees');
      return;
    }
    const bankDetails = {
      id: selectedAccount.id,
      account_number: selectedAccount.account_number,
      bank_name: selectedAccount.bank_name,
      bank_code: selectedAccount.bank_code,
      account_name: selectedAccount.account_name,
      account_type: selectedAccount.account_type,
      currency: selectedAccount.currency
    };
    
    console.log('WithdrawDialog: Setting isLoading to true');
    setIsLoading(true);
    
    try {
      console.log('WithdrawDialog: Calling onWithdraw with:', { numAmount, bankDetails, pin });
      await onWithdraw(numAmount, bankDetails, pin);
      console.log('WithdrawDialog: onWithdraw completed successfully');
      onClose();
      resetForm();
    } catch (error) {
      console.error('WithdrawDialog: onWithdraw failed:', error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      console.log('WithdrawDialog: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setAmount('');
    setSelectedAccount(null);
    setPin('');
    setPinError('');
    setTwoFactorCode('');
    setTwoFactorError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Available Balance */}
      <div className="text-center p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/30">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Available Balance</p>
        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
          ₦{userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Amount Input */}
      <div>
        <Label htmlFor="amount" className="text-gray-800 dark:text-white">
          Withdrawal Amount
        </Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">₦</span>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-10 text-lg bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Fee Information */}
      {amount && parseFloat(amount) > 0 && (
        <div className="space-y-2 p-4 rounded-xl bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/30 dark:border-yellow-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">Fee Breakdown</p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-yellow-700 dark:text-yellow-300">Withdrawal Amount:</span>
              <span className="text-yellow-800 dark:text-yellow-200">₦{parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-700 dark:text-yellow-300">Processing Fee (0.4%):</span>
              <span className="text-yellow-800 dark:text-yellow-200">₦{getWithdrawalFee(parseFloat(amount)).toFixed(2)}</span>
            </div>
            <hr className="border-yellow-300/50" />
            <div className="flex justify-between font-medium">
              <span className="text-yellow-800 dark:text-yellow-200">Total Deduction (CBUSD):</span>
              <span className="text-yellow-800 dark:text-yellow-200">{convertNgnToCbusd(parseFloat(amount) + getWithdrawalFee(parseFloat(amount))).toFixed(4)} CBUSD</span>
            </div>
            {isHighValueWithdrawal(parseFloat(amount)) && (
              <>
                <hr className="border-yellow-300/50" />
                <div className="flex items-center gap-2 pt-1">
                  <Shield size={12} className="text-yellow-600" />
                  <span className="text-xs text-yellow-700 dark:text-yellow-300">2FA required for high-value withdrawal</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={handleAmountSubmit}
        className="w-full card-gradient hover:opacity-90 text-white"
        disabled={isLoadingAccounts}
      >
        {isLoadingAccounts ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Loading Accounts...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(1)}
          className="p-2"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Withdrawing</p>
          <p className="font-semibold text-gray-800 dark:text-white">₦{parseFloat(amount).toFixed(2)}</p>
        </div>
      </div>

      {/* Account Selection */}
      <div>
        <Label className="text-gray-800 dark:text-white mb-3 block">
          Select Bank Account
        </Label>
        
        {isLoadingAccounts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading accounts...</span>
          </div>
        ) : linkedAccounts.length === 0 ? (
          <div className="text-center py-8">
            <Landmark size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No linked bank accounts found
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Please link a bank account first
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {linkedAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleAccountSelect(account)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedAccount?.id === account.id
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-gray-200/30 dark:border-white/10 bg-gray-100/30 dark:bg-gray-900/30 hover:bg-gray-200/30 dark:hover:bg-gray-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedAccount?.id === account.id
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                  }`}>
                    <Landmark size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {account.bank_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {bankingService.formatAccountNumber(account.account_number)} • {account.account_type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {account.account_name} • {account.currency}
                    </p>
                  </div>
                  {selectedAccount?.id === account.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {linkedAccounts.length > 0 && (
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50"
          >
            Back
          </Button>
          <Button
            onClick={handleAccountNext}
            disabled={!selectedAccount}
            className="flex-1 card-gradient hover:opacity-90 text-white disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(2)}
          className="p-2"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Withdrawing ₦{parseFloat(amount).toFixed(2)} to
          </p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {selectedAccount?.bank_name}
          </p>
        </div>
      </div>

      {/* PIN Entry */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
          <Lock size={24} className="text-blue-600 dark:text-blue-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Enter Transaction PIN
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading 
              ? 'Processing your withdrawal...' 
              : 'Please enter your 4-digit transaction PIN to confirm the withdrawal'
            }
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing withdrawal...
            </p>
          </div>
        ) : (
          <div className="px-8">
            <PinInput
              onPinComplete={handlePinComplete}
              onClear={handlePinClear}
              error={pinError}
              title="Enter Transaction PIN"
              subtitle="Withdrawal will be processed automatically once PIN is entered"
            />
          </div>
        )}

        {pinError && (
          <p className="text-red-500 text-sm mt-2">{pinError}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => setStep(isHighValueWithdrawal(parseFloat(amount)) ? 4 : 2)}
          variant="outline"
          disabled={isLoading}
          className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50 disabled:opacity-50"
        >
          Back
        </Button>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? 'Processing...' : 'Enter PIN above to confirm'}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(2)}
          className="p-2"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            High-value withdrawal: ₦{parseFloat(amount).toFixed(2)}
          </p>
          <p className="font-semibold text-gray-800 dark:text-white">
            Two-factor authentication required
          </p>
        </div>
      </div>

      {/* 2FA Entry */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
          <Shield size={24} className="text-orange-600 dark:text-orange-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            For security, withdrawals over ₦1,000,000 require 2FA verification
          </p>
        </div>

        <div className="px-8">
          <Label htmlFor="twoFactorCode" className="text-gray-800 dark:text-white">
            6-Digit Verification Code
          </Label>
          <Input
            id="twoFactorCode"
            type="text"
            value={twoFactorCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setTwoFactorCode(value);
              setTwoFactorError('');
            }}
            placeholder="000000"
            className="text-center text-lg font-mono tracking-widest bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white mt-2"
            maxLength={6}
          />
        </div>

        {twoFactorError && (
          <p className="text-red-500 text-sm mt-2">{twoFactorError}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => setStep(2)}
          variant="outline"
          className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50"
        >
          Back
        </Button>
        <Button
          onClick={handleTwoFactorNext}
          disabled={!twoFactorCode || twoFactorCode.length !== 6}
          className="flex-1 card-gradient hover:opacity-90 text-white disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Withdraw Funds';
      case 2: return 'Select Account';
      case 3: return 'Enter PIN';
      case 4: return 'Two-Factor Auth';
      default: return 'Withdraw Funds';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-gray-800 dark:text-white">
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </DialogContent>
    </Dialog>
  );
}
