import React, { useState } from 'react';
import { Bell, Home, Send, Activity, User as UserIcon, Plus, Eye, EyeOff, Copy, Share2, CreditCard, Smartphone, QrCode, ArrowRight, Upload, Download, Camera, BarChart3, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useTheme } from '../App';
import { WithdrawDialog } from './WithdrawDialog';
import { QRScanner } from './QRScanner';
import { Transaction, User, Screen, Recipient } from '../App';

interface HomeDashboardProps {
  user: User;
  transactions: Transaction[];
  recipients: Recipient[];
  onSendMoney: () => void;
  onNavigate: (screen: Screen) => void;
  onRecipientSelect?: (recipient: Recipient) => void;
  onUpdateUser: (user: User) => void;
  setTransactions: (transactions: Transaction[]) => void;
  onAddRecipient: (recipient: Recipient) => void;
  isDesktop?: boolean;
}

// Nigerian banks list for the dropdown
const nigerianBanks = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank Nigeria Plc' },
  { code: '023', name: 'Citibank Nigeria Limited' },
  { code: '058', name: 'Diamond Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '221', name: 'Globus Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '090', name: 'MainStreet Bank' },
  { code: '057', name: 'Polaris Bank' },
  { code: '076', name: 'Skye Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

export function HomeDashboard({ 
  user, 
  transactions, 
  recipients,
  onSendMoney, 
  onNavigate, 
  onRecipientSelect, 
  onUpdateUser, 
  setTransactions,
  onAddRecipient,
  isDesktop = false 
}: HomeDashboardProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isDepositSheetOpen, setIsDepositSheetOpen] = useState(false);
  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<'bank' | 'phone' | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    phoneNumber: '',
    country: 'Nigeria'
  });

  const { theme, toggleTheme } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  const generateAccountNumber = () => {
    return `3${Math.random().toString().slice(2, 12)}`;
  };

  const accountNumber = generateAccountNumber();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success(`${label} copied to clipboard`);
        } catch (err) {
          toast.error('Failed to copy to clipboard');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareAccountDetails = async () => {
    const details = `Account Name: ${user.name}\nAccount Number: ${accountNumber}\nBank: SecureRemit Bank`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Account Details',
          text: details,
        });
      } else {
        copyToClipboard(details, 'Account details');
      }
    } catch (err) {
      copyToClipboard(details, 'Account details');
    }
  };

  const handleQuickSend = (recipient: Recipient) => {
    if (onRecipientSelect) {
      onRecipientSelect(recipient);
    }
  };

  const handleBankChange = (bankCode: string) => {
    const selectedBank = nigerianBanks.find(bank => bank.code === bankCode);
    if (selectedBank) {
      setNewRecipient(prev => ({ 
        ...prev, 
        bankCode: bankCode,
        bankName: selectedBank.name 
      }));
    }
  };

  const handleAddRecipient = () => {
    if (recipientType === 'bank' && newRecipient.name && newRecipient.accountNumber && newRecipient.bankCode) {
      const recipient: Recipient = {
        id: `recipient_${Date.now()}`,
        name: newRecipient.name,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
        country: newRecipient.country,
        currency: newRecipient.country === 'Nigeria' ? 'NGN' : newRecipient.country === 'United Kingdom' ? 'GBP' : 'USD'
      };
      
      onAddRecipient(recipient);
      toast.success('Recipient added successfully');
      setIsAddRecipientOpen(false);
      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
      setRecipientType(null);
    } else if (recipientType === 'phone' && newRecipient.name && newRecipient.phoneNumber) {
      const recipient: Recipient = {
        id: `phone_${newRecipient.phoneNumber}`,
        name: newRecipient.name,
        avatar: `https://images.unsplash.com/photo-1494790108755-2616b6e08c3c?w=150&h=150&fit=crop&crop=face`,
        country: 'App User',
        currency: 'USDC'
      };
      
      onAddRecipient(recipient);
      toast.success('App recipient added successfully');
      setIsAddRecipientOpen(false);
      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
      setRecipientType(null);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const formatNairaEquivalent = (balance: number) => {
    const nairaRate = 1532.50; // USD to NGN rate
    return (balance * nairaRate).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const handleScanToPay = () => {
    setIsQRScannerOpen(true);
  };

  const handleWithdraw = (amount: number, bankDetails: any) => {
    // Create withdrawal transaction
    const withdrawalTransaction = {
      id: `WD${Date.now()}`,
      recipient: bankDetails.bankName,
      recipientId: 'withdrawal',
      amount: amount.toString(),
      currency: 'USDC',
      convertedAmount: amount.toString(),
      recipientCurrency: 'USD',
      status: 'pending' as const,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      avatar: '',
      referenceNumber: `WD${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      exchangeRate: 1,
      fee: (amount * 0.02).toFixed(2),
      totalPaid: (amount + amount * 0.02).toFixed(2)
    };

    const updatedTransactions = [withdrawalTransaction, ...transactions];
    setTransactions(updatedTransactions);

    // Update user balance
    const totalDeduction = amount + amount * 0.02;
    const updatedUser = { ...user, balance: user.balance - totalDeduction };
    onUpdateUser(updatedUser);
    localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));

    toast.success('Withdrawal request submitted successfully');
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      toast.success(`Scanned payment request from ${qrData.recipient}`);
      // Handle the scanned QR data
    } catch (err) {
      toast.success('QR code scanned successfully');
    }
  };

  const handleNotificationClick = () => {
    onNavigate('notifications');
  };

  const handleAnalyticsClick = () => {
    onNavigate('analytics');
  };

  // Use only custom recipients (no static ones)
  const allRecipients = recipients;

  // Deposit Modal Content Component
  const DepositSheetContent = () => (
    <div className="w-full">
      <DialogHeader className="text-center pb-6">
        <DialogTitle className="text-xl text-gray-800 dark:text-white">
          Add Money
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">
          Choose from the available deposit methods below
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 px-2 hide-scrollbar overflow-y-auto max-h-[60vh]">
        {/* Account Details Section */}
        <div className="glass-card dark:dark-glass rounded-2xl p-6 border border-gray-200/30 dark:border-white/10">
          <h3 className="text-lg mb-4 text-gray-800 dark:text-white">Your Account Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                <p className="text-gray-800 dark:text-white">{user.name}</p>
              </div>
              <button
                onClick={() => copyToClipboard(user.name, 'Account name')}
                className="p-2 rounded-lg hover:bg-gray-200/30 dark:hover:bg-white/10 transition-all duration-200"
              >
                <Copy size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                <p className="text-gray-800 dark:text-white font-mono">{accountNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(accountNumber, 'Account number')}
                className="p-2 rounded-lg hover:bg-gray-200/30 dark:hover:bg-white/10 transition-all duration-200"
              >
                <Copy size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                <p className="text-gray-800 dark:text-white">SecureRemit Bank</p>
              </div>
              <button
                onClick={shareAccountDetails}
                className="p-2 rounded-lg hover:bg-gray-200/30 dark:hover:bg-white/10 transition-all duration-200"
              >
                <Share2 size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Other Deposit Options */}
        <div className="grid grid-cols-1 gap-4">
          <button className="flex items-center gap-4 p-5 glass-card dark:dark-glass rounded-2xl border border-gray-200/30 dark:border-white/10 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CreditCard size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-gray-800 dark:text-white">Top up with Card</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add money using your debit/credit card</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-5 glass-card dark:dark-glass rounded-2xl border border-gray-200/30 dark:border-white/10 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Smartphone size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-gray-800 dark:text-white">Bank USSD</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transfer using *737*000#</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-5 glass-card dark:dark-glass rounded-2xl border border-gray-200/30 dark:border-white/10 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <QrCode size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-gray-800 dark:text-white">Scan QR Code</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Show QR at partner locations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden p-8">
        {/* Desktop Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your transactions and account</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-gray-200/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-300"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={handleNotificationClick}
              className="p-3 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-gray-200/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-300"
            >
              <Bell size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Action Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Dialog open={isDepositSheetOpen} onOpenChange={setIsDepositSheetOpen}>
            <DialogTrigger asChild>
              <button className="p-6 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-gray-200/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-300 text-center">
                <Plus size={32} className="mx-auto mb-3 text-green-600" />
                <p className="font-medium">Top Up</p>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 mx-auto max-w-md">
              <DepositSheetContent />
            </DialogContent>
          </Dialog>

          <button 
            onClick={handleScanToPay}
            className="p-6 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-gray-200/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-300 text-center"
          >
            <QrCode size={32} className="mx-auto mb-3 text-blue-600" />
            <p className="font-medium">Scan to Pay</p>
          </button>

          <button 
            onClick={onSendMoney}
            className="p-6 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-gray-200/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-300 text-center"
          >
            <Send size={32} className="mx-auto mb-3 text-purple-600" />
            <p className="font-medium">Send Money</p>
          </button>

          <button 
            onClick={() => setIsWithdrawOpen(true)}
            className="p-6 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-gray-200/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-300 text-center"
          >
            <Download size={32} className="mx-auto mb-3 text-orange-600" />
            <p className="font-medium">Withdraw</p>
          </button>
        </div>

        {/* Quick Recipients */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Quick Recipients</h3>
          <div className="grid grid-cols-6 gap-4">
            {allRecipients.slice(0, 6).map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => handleQuickSend(recipient)}
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group"
              >
                <Avatar className="w-16 h-16 mb-2">
                  <AvatarImage src={recipient.avatar} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white">
                    {recipient.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                  {recipient.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
              <button
                onClick={() => onNavigate('history')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-gray-200/30 dark:border-white/10">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={transaction.avatar} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white">
                        {transaction.recipient[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">{transaction.recipient}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      -${transaction.amount}
                    </p>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      transaction.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dialogs and Modals */}
        <WithdrawDialog
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          userBalance={user.balance}
          onWithdraw={handleWithdraw}
        />

        <QRScanner
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScan={handleQRScan}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden relative px-2">
      {/* Mobile Header - Uses parent container's padding */}
      <div className="flex items-center justify-between py-4 pt-12">
        <button
          onClick={() => onNavigate('profile')}
          className="backdrop-blur-md bg-white/20 dark:bg-white/10 rounded-full p-1 border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="backdrop-blur-md bg-white/20 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300"
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun size={20} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={handleNotificationClick}
            className="backdrop-blur-md bg-white/20 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300"
          >
            <Bell size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Balance Card - Uses parent container's padding */}
      <div className="pt-4 pb-6">
        <div className="relative">
          {/* Card Background with Gradient */}
          <div className="relative overflow-hidden rounded-3xl p-8 card-gradient shadow-2xl">
            {/* Glass overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5 rounded-3xl"></div>
            
            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-white/80 text-base mb-2">Balance</p>
                  <div className="flex items-center gap-4">
                    <h1 className="text-white text-4xl font-bold">
                      {isBalanceVisible 
                        ? `$ ${formatBalance(user.balance)}`
                        : '$ ••••••••'
                      }
                    </h1>
                    <button
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                    >
                      {isBalanceVisible ? (
                        <EyeOff size={20} className="text-white/80" />
                      ) : (
                        <Eye size={20} className="text-white/80" />
                      )}
                    </button>
                  </div>
                  
                  {/* Naira Equivalent */}
                  <div className="mt-3">
                    <p className="text-white/70 text-lg font-medium">
                      {isBalanceVisible 
                        ? `₦ ${formatNairaEquivalent(user.balance)}`
                        : '₦ ••••••••'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Grid - Uses parent container's padding */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Dialog open={isDepositSheetOpen} onOpenChange={setIsDepositSheetOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-100/50 dark:bg-gray-900/50 glass-card dark:dark-glass border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/50 dark:hover:bg-gray-900/70 transition-all duration-300">
                <Plus size={20} className="text-gray-700 dark:text-white" />
                <span className="text-gray-700 dark:text-white text-sm font-medium">Top Up</span>
              </button>
            </DialogTrigger>
            <DialogContent 
              className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 mx-auto max-w-md max-h-[85vh] overflow-y-auto"
            >
              <DepositSheetContent />
            </DialogContent>
          </Dialog>

          <button 
            onClick={handleScanToPay}
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-100/50 dark:bg-gray-900/50 glass-card dark:dark-glass border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/50 dark:hover:bg-gray-900/70 transition-all duration-300"
          >
            <QrCode size={20} className="text-gray-700 dark:text-white" />
            <span className="text-gray-700 dark:text-white text-sm font-medium">Scan to Pay</span>
          </button>

          <button 
            onClick={onSendMoney}
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-100/50 dark:bg-gray-900/50 glass-card dark:dark-glass border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/50 dark:hover:bg-gray-900/70 transition-all duration-300"
          >
            <Send size={20} className="text-gray-700 dark:text-white" />
            <span className="text-gray-700 dark:text-white text-sm font-medium">Send</span>
          </button>

          <button 
            onClick={() => setIsWithdrawOpen(true)}
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-100/50 dark:bg-gray-900/50 glass-card dark:dark-glass border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/50 dark:hover:bg-gray-900/70 transition-all duration-300"
          >
            <Download size={20} className="text-gray-700 dark:text-white" />
            <span className="text-gray-700 dark:text-white text-sm font-medium">Withdraw</span>
          </button>
        </div>
      </div>

      {/* Quick Transaction - Uses parent container's padding */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-700 dark:text-gray-300 font-medium">Quick Send</h3>
          <Dialog open={isAddRecipientOpen} onOpenChange={setIsAddRecipientOpen}>
            <DialogTrigger asChild>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm font-medium">
                Add New
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 mx-auto" style={{ maxWidth: 'min(28rem, 90vw)' }}>
              <DialogHeader>
                <DialogTitle className="text-center text-gray-800 dark:text-white">
                  Add New Recipient
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
                  {!recipientType 
                    ? "Add a new recipient to send money quickly and easily"
                    : recipientType === 'bank'
                      ? "Enter bank account details for the recipient"
                      : "Enter phone number for the app user"
                  }
                </DialogDescription>
              </DialogHeader>
              
              {!recipientType ? (
                <div className="space-y-4">
                  <p className="text-center text-gray-600 dark:text-gray-400">Choose recipient type:</p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setRecipientType('bank')}
                      className="flex items-center gap-4 p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/30 dark:hover:bg-gray-900/50 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-gray-800 dark:text-white">Bank Account</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send to local bank account</p>
                      </div>
                      <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                    </button>
                    
                    <button
                      onClick={() => setRecipientType('phone')}
                      className="flex items-center gap-4 p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/30 dark:hover:bg-gray-900/50 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Smartphone size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-gray-800 dark:text-white">App User</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send USDC to another app user</p>
                      </div>
                      <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-800 dark:text-white">Recipient Name</Label>
                    <Input
                      id="name"
                      value={newRecipient.name}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter recipient name"
                      className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                    />
                  </div>
                  
                  {recipientType === 'bank' ? (
                    <>
                      <div>
                        <Label htmlFor="account" className="text-gray-800 dark:text-white">Account Number</Label>
                        <Input
                          id="account"
                          value={newRecipient.accountNumber}
                          onChange={(e) => setNewRecipient(prev => ({ ...prev, accountNumber: e.target.value }))}
                          placeholder="Enter account number"
                          className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bank" className="text-gray-800 dark:text-white">Bank</Label>
                        <select
                          id="bank"
                          value={newRecipient.bankCode}
                          onChange={(e) => handleBankChange(e.target.value)}
                          className="mt-1 w-full p-3 rounded-xl bg-gray-100/30 dark:bg-gray-900/30 border border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white"
                        >
                          <option value="">Select a bank</option>
                          {nigerianBanks.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label htmlFor="phone" className="text-gray-800 dark:text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newRecipient.phoneNumber}
                        onChange={(e) => setNewRecipient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="Enter phone number"
                        className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        setRecipientType(null);
                        setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
                      }}
                      variant="outline"
                      className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleAddRecipient}
                      className="flex-1 card-gradient hover:opacity-90 text-white"
                    >
                      Add Recipient
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {allRecipients.length > 0 ? allRecipients.slice(0, 5).map((recipient) => (
            <button
              key={recipient.id}
              onClick={() => handleQuickSend(recipient)}
              className="flex flex-col items-center min-w-[80px] p-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border-2 border-gray-300/80 dark:border-gray-600/60 shadow-lg shadow-gray-200/20 dark:shadow-black/40 hover:bg-white/20 dark:hover:bg-black/30 hover:border-gray-400/90 dark:hover:border-gray-500/70 hover:shadow-xl hover:shadow-gray-300/30 dark:hover:shadow-black/50 transition-all duration-300"
            >
              <Avatar className="w-12 h-12 mb-2">
                <AvatarImage src={recipient.avatar} />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {recipient.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-700 dark:text-gray-300 text-center">
                {recipient.name.split(' ')[0]}
              </span>
            </button>
          )) : (
            <div className="flex-1 text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recipients added yet. Add your first recipient to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity - Uses parent container's padding */}
      {transactions.length > 0 && (
        <div className="flex-1 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-700 dark:text-gray-300 font-medium">Recent Activity</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm font-medium"
            >
              See All
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-2xl backdrop-blur-md bg-white/25 dark:bg-black/25 border border-white/30 dark:border-white/20">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={transaction.avatar} />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {transaction.recipient[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-gray-800 dark:text-white">{transaction.recipient}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-600 dark:text-red-400">
                    -${transaction.amount}
                  </p>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    transaction.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs and Modals */}
      <WithdrawDialog
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        userBalance={user.balance}
        onWithdraw={handleWithdraw}
      />

      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}