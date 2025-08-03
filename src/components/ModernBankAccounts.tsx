import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Plus, Trash2, Edit3, Shield, CheckCircle, AlertTriangle, Building2, User as UserIcon, Landmark, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { bankingService, type BankAccount, type LinkAccountRequest } from '../services/BankingService';

interface ModernBankAccountsProps {
  onBack: () => void;
  userId: string;
}

export function ModernBankAccounts({ onBack, userId }: ModernBankAccountsProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState<{[key: string]: boolean}>({});
  
  const [linkForm, setLinkForm] = useState<LinkAccountRequest>({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    routingNumber: '',
    accountType: 'checking'
  });

  const banks = [
    { code: 'GTB', name: 'Guaranty Trust Bank', country: 'NG' },
    { code: 'ACCESS', name: 'Access Bank', country: 'NG' },
    { code: 'ZENITH', name: 'Zenith Bank', country: 'NG' },
    { code: 'UBA', name: 'United Bank for Africa', country: 'NG' },
    { code: 'FCMB', name: 'First City Monument Bank', country: 'NG' },
    { code: 'FBN', name: 'First Bank of Nigeria', country: 'NG' },
    { code: 'STERLING', name: 'Sterling Bank', country: 'NG' },
    { code: 'CHASE', name: 'Chase Bank', country: 'US' },
    { code: 'BOA', name: 'Bank of America', country: 'US' },
    { code: 'WELLS', name: 'Wells Fargo', country: 'US' },
    { code: 'HSBC', name: 'HSBC', country: 'GB' },
    { code: 'BARCLAYS', name: 'Barclays', country: 'GB' },
  ];

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setIsLoading(true);
      const result = await bankingService.getBankAccounts();
      setAccounts(result || []);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkForm.bankName || !linkForm.accountNumber || !linkForm.accountHolderName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLinking(true);
      await bankingService.linkBankAccount(linkForm);
      toast.success('Bank account linked successfully!');
      setIsAddModalOpen(false);
      setLinkForm({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        routingNumber: '',
        accountType: 'checking'
      });
      loadBankAccounts();
    } catch (error) {
      console.error('Failed to link bank account:', error);
      toast.error('Failed to link bank account. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkAccount = async (accountId: string) => {
    try {
      await bankingService.unlinkBankAccount(accountId);
      toast.success('Bank account unlinked successfully');
      loadBankAccounts();
    } catch (error) {
      console.error('Failed to unlink bank account:', error);
      toast.error('Failed to unlink bank account');
    }
  };

  const formatAccountNumber = (accountNumber: string, show: boolean): string => {
    if (show) {
      return accountNumber;
    }
    return '••••' + accountNumber.slice(-4);
  };

  const toggleAccountVisibility = (accountId: string) => {
    setShowAccountNumber(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your bank accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-gradient-to-tl from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-16">
          <button
            onClick={onBack}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Bank Accounts</h1>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <button
                className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <Plus size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/30 dark:border-white/20 rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
                  Link Bank Account
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Add a new bank account for deposits and withdrawals
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Bank Name</label>
                  <Select value={linkForm.bankName} onValueChange={(value) => setLinkForm(prev => ({ ...prev, bankName: value }))}>
                    <SelectTrigger className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl h-12">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/30 dark:border-white/20 rounded-2xl">
                      {banks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.name}>
                          <div className="flex items-center space-x-3">
                            <Building2 size={16} />
                            <span>{bank.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Account Holder Name</label>
                  <div className="relative">
                    <UserIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Your full name as on account"
                      value={linkForm.accountHolderName}
                      onChange={(e) => setLinkForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="pl-12 backdrop-blur-xl bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Account Number</label>
                  <div className="relative">
                    <CreditCard size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="1234567890"
                      value={linkForm.accountNumber}
                      onChange={(e) => setLinkForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="pl-12 backdrop-blur-xl bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Routing Number (Optional)</label>
                  <div className="relative">
                    <Shield size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Routing/Sort Code"
                      value={linkForm.routingNumber}
                      onChange={(e) => setLinkForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                      className="pl-12 backdrop-blur-xl bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm">Account Type</label>
                  <Select value={linkForm.accountType} onValueChange={(value: 'checking' | 'savings') => setLinkForm(prev => ({ ...prev, accountType: value }))}>
                    <SelectTrigger className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/30 dark:border-white/20 rounded-2xl">
                      <SelectItem value="checking">Checking Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="backdrop-blur-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/30 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Secure & Encrypted</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400">Your banking information is encrypted and secure</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 h-12 backdrop-blur-xl bg-white/20 dark:bg-white/5 border-white/40 dark:border-white/20 rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLinkAccount}
                    disabled={isLinking}
                    className="flex-1 h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-800 rounded-2xl"
                  >
                    {isLinking ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Linking...</span>
                      </div>
                    ) : (
                      'Link Account'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bank Accounts List */}
        <div className="flex-1 px-6 pb-6">
          {accounts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center">
                  <Landmark size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Bank Accounts</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Link your bank account to easily deposit and withdraw funds
                </p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-800 rounded-2xl h-12 px-8"
                >
                  <Plus size={20} className="mr-2" />
                  Link Your First Account
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="backdrop-blur-xl bg-white/40 dark:bg-white/5 rounded-3xl p-6 border border-white/30 dark:border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Building2 size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{account.bankName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{account.accountHolderName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{account.accountType} Account</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAccountVisibility(account.id)}
                        className="backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-xl p-2"
                      >
                        {showAccountNumber[account.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlinkAccount(account.id)}
                        className="backdrop-blur-xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/30 dark:border-red-500/30 rounded-xl p-2 hover:bg-red-100/50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Account Number</span>
                      <span className="text-sm font-mono text-gray-800 dark:text-white">
                        {formatAccountNumber(account.accountNumber, showAccountNumber[account.id])}
                      </span>
                    </div>
                    {account.routingNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Routing Number</span>
                        <span className="text-sm font-mono text-gray-800 dark:text-white">{account.routingNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <div className="flex items-center space-x-1">
                        <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
