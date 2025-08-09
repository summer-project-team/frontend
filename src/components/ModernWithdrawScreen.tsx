import React, { useState, useEffect } from 'react';
import { ArrowLeft, Landmark, ArrowRight, Shield, AlertCircle, CheckCircle, CreditCard, Building2, Eye, EyeOff, DollarSign, Sparkles, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { bankingService, type BankAccount } from '../services/BankingService';
import type { Screen } from '../App';

interface ModernWithdrawScreenProps {
  onBack: () => void;
  userBalance: number;
  onWithdraw: (amount: number, selectedAccount: any, pin: string, twoFactorCode?: string) => void;
  onNavigateToPin?: (config: {
    purpose: 'verify';
    title?: string;
    subtitle?: string;
    onSuccess: (pin: string) => void;
    returnScreen?: 'withdraw';
  }) => void;
  onNavigate?: (screen: Screen) => void; // Add navigation prop
}

type WithdrawStep = 'amount' | 'account' | 'twoFactor' | 'pin' | 'confirmation';

export function ModernWithdrawScreen({ onBack, userBalance, onWithdraw, onNavigateToPin, onNavigate }: ModernWithdrawScreenProps) {
  const [currentStep, setCurrentStep] = useState<WithdrawStep>('amount');
  const [amount, setAmount] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showAccountDetails, setShowAccountDetails] = useState<{[key: string]: boolean}>({});
  const [showNoAccountsModal, setShowNoAccountsModal] = useState(false);

  useEffect(() => {
    loadLinkedAccounts();
  }, []);

  const loadLinkedAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const accounts = await bankingService.getAccounts();
      setLinkedAccounts(accounts || []);
      
      if (accounts?.length === 0) {
        setShowNoAccountsModal(true);
      }
    } catch (error: any) {
      console.error('Error loading bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const getWithdrawalFee = (withdrawAmount: number) => {
    if (isNaN(withdrawAmount) || !isFinite(withdrawAmount)) return 0;
    return withdrawAmount * 0.004; // 0.4% withdrawal fee
  };

  const isHighValueWithdrawal = (amount: number, currency: string = 'NGN') => {
    const thresholds: { [key: string]: number } = {
      'NGN': 1_000_000,
      'USD': 1000,
      'GBP': 1000
    };
    return amount > (thresholds[currency.toUpperCase()] || 1000);
  };

  const convertNgnToCbusd = (ngnAmount: number) => {
    if (isNaN(ngnAmount) || !isFinite(ngnAmount)) return 0;
    return ngnAmount / 1500;
  };

  const formatCurrency = (amount: number): string => {
    if (isNaN(amount) || !isFinite(amount)) return '0.00';
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatAccountNumber = (accountNumber: string, show: boolean): string => {
    if (show) return accountNumber;
    return '••••' + accountNumber.slice(-4);
  };

  const handleAmountNext = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    // Convert NGN amount to CBUSD for balance validation
    const cbusdRequired = numAmount / 1500;
    if (cbusdRequired > userBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (numAmount < 10) {
      toast.error('Minimum withdrawal amount is ₦10');
      return;
    }
    
    if (linkedAccounts.length === 0) {
      setShowNoAccountsModal(true);
      return;
    }
    
    setCurrentStep('account');
  };

  const handleAccountNext = () => {
    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isHighValueWithdrawal(numAmount, selectedAccount?.currency)) {
      setCurrentStep('twoFactor');
    } else {
      // Navigate to PIN screen instead of inline PIN
      navigateToPinScreen();
    }
  };

  const handleTwoFactorNext = () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error('Please enter a valid 6-digit 2FA code');
      return;
    }
    // Navigate to PIN screen after 2FA
    navigateToPinScreen();
  };

  const navigateToPinScreen = () => {
    if (onNavigateToPin) {
      onNavigateToPin({
        purpose: 'verify',
        title: 'Confirm Withdrawal',
        subtitle: 'Enter your PIN to authorize this withdrawal',
        onSuccess: handlePinComplete,
        returnScreen: 'withdraw'
      });
    } else {
      // Fallback to inline PIN if navigation not available
      setCurrentStep('pin');
    }
  };

  const handlePinComplete = async (enteredPin: string) => {
    setPin(enteredPin);
    
    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return;
    }
    
    const numAmount = parseFloat(amount);
    const fee = getWithdrawalFee(numAmount);
    const totalDeduction = numAmount + fee;
    // Convert NGN to CBUSD for balance validation
    const cbusdRequired = totalDeduction / 1500;
    
    if (cbusdRequired > userBalance) {
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
    
    setIsLoading(true);
    
    try {
      await onWithdraw(numAmount, bankDetails, enteredPin, twoFactorCode || undefined);
      toast.success('Withdrawal initiated successfully!');
      onBack();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Withdrawal failed. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const steps: WithdrawStep[] = ['amount', 'account', 'twoFactor'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  const toggleAccountVisibility = (accountId: string) => {
    setShowAccountDetails(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getStepProgress = () => {
    const steps: WithdrawStep[] = ['amount', 'account', 'twoFactor'];
    const currentIndex = steps.indexOf(currentStep);
    const totalSteps = isHighValueWithdrawal(parseFloat(amount), selectedAccount?.currency) ? 3 : 2; // No PIN step since it's handled separately
    return ((currentIndex + 1) / totalSteps) * 100;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'amount':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Withdrawal Amount</h2>
              <p className="text-gray-600 dark:text-gray-400">How much would you like to withdraw?</p>
            </div>

            {/* Available Balance */}
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-500 rounded-2xl p-6 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">Available Balance</p>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                ₦{(userBalance * 1500).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(userBalance)} CBUSD
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Withdrawal Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-semibold">₦</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-12 text-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-16 focus:bg-gray-50 dark:focus:bg-gray-750"
                />
              </div>
            </div>

            {/* Fee Information */}
            {amount && parseFloat(amount) > 0 && !isNaN(parseFloat(amount)) && (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-500 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
                  <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Fee Breakdown</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-yellow-700 dark:text-yellow-300">Withdrawal Amount:</span>
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">₦{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700 dark:text-yellow-300">Processing Fee (0.4%):</span>
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">₦{formatCurrency(getWithdrawalFee(parseFloat(amount)))}</span>
                  </div>
                  <hr className="border-yellow-300/30" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-yellow-800 dark:text-yellow-200">Total Deduction:</span>
                    <span className="text-yellow-800 dark:text-yellow-200">{formatCurrency(convertNgnToCbusd(parseFloat(amount) + getWithdrawalFee(parseFloat(amount))))} CBUSD</span>
                  </div>
                  {isHighValueWithdrawal(parseFloat(amount), selectedAccount?.currency) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-yellow-300/30">
                      <Shield size={16} className="text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">2FA verification required for high-value withdrawal</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Landmark size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Select Account</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose the bank account to receive funds</p>
            </div>

            {isLoadingAccounts ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your bank accounts...</p>
              </div>
            ) : linkedAccounts.length === 0 ? (
              <div className="text-center py-12">
                <Building2 size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Bank Accounts</h3>
                <p className="text-gray-600 dark:text-gray-400">Please link a bank account first to withdraw funds</p>
              </div>
            ) : (
              <div className="space-y-4">
                {linkedAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                      selectedAccount?.id === account.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                          <Building2 size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{account.bank_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{account.account_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAccountVisibility(account.id);
                          }}
                          className="p-2"
                        >
                          {showAccountDetails[account.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        {selectedAccount?.id === account.id && (
                          <CheckCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                        <span className="font-mono text-gray-800 dark:text-white">
                          {formatAccountNumber(account.account_number, showAccountDetails[account.id])}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
                        <span className="text-gray-800 dark:text-white capitalize">{account.account_type}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'twoFactor':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-2xl flex items-center justify-center">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Two-Factor Authentication</h2>
              <p className="text-gray-600 dark:text-gray-400">Enter the 6-digit code from your authenticator app</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Authentication Code</label>
                <Input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-16"
                />
              </div>

              <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-500 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield size={16} className="text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">High-Value Withdrawal</p>
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      This withdrawal exceeds ₦1,000,000 and requires additional verification for security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 dark:bg-blue-900 rounded-full opacity-30"></div>
          <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-100 dark:bg-purple-900 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100 dark:bg-indigo-900 rounded-full opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Fixed Header */}
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 pt-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </Button>
            
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Withdraw</h1>
            
            <div className="w-12"> {/* Spacer */}</div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pt-20 pb-24">
            {/* Progress Bar */}
            <div className="mx-6 mb-8">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Step {['amount', 'account', 'twoFactor'].indexOf(currentStep) + 1} of {isHighValueWithdrawal(parseFloat(amount), selectedAccount?.currency) ? 3 : 2}</span>
                <span>{Math.round(getStepProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getStepProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-500 max-w-2xl mx-auto">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 space-x-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                  </Button>

                  <Button
                    onClick={currentStep === 'amount' ? handleAmountNext : 
                             currentStep === 'account' ? handleAccountNext : 
                             currentStep === 'twoFactor' ? handleTwoFactorNext : 
                             undefined}
                    disabled={
                      (currentStep === 'amount' && (!amount || parseFloat(amount) < 10 || isNaN(parseFloat(amount)))) ||
                      (currentStep === 'account' && !selectedAccount) ||
                      (currentStep === 'twoFactor' && twoFactorCode.length !== 6)
                    }
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
                  >
                    Continue
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No Accounts Linked Modal */}
      <Dialog open={showNoAccountsModal} onOpenChange={setShowNoAccountsModal}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-gray-800 dark:text-white flex items-center justify-center gap-2">
              <Landmark size={24} className="text-orange-500" />
              No Accounts Linked
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Landmark size={32} className="text-orange-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to link a bank account before you can withdraw funds.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNoAccountsModal(false);
                  onBack();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowNoAccountsModal(false);
                  // Navigate to bank accounts screen
                  if (onNavigate) {
                    onNavigate('bank-accounts');
                  } else {
                    onBack();
                    toast.info('Please navigate to Bank Accounts to link your account');
                  }
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Link Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simple Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-20 pointer-events-none">
        <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </>
  );
}
