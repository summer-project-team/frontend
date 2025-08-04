import React, { useState, useEffect } from 'react';
import { Bell, Home, Send, Activity, User as UserIcon, Plus, Eye, EyeOff, Copy, Share2, CreditCard, Smartphone, QrCode, ArrowRight, Upload, Download, Camera, BarChart3, Moon, Sun, Building2, X, Trash2, TrendingUp, TrendingDown, Store, Receipt, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useTheme } from '../App';
import { QRScanner } from './QRScanner';
import { Transaction, User, Screen, Recipient } from '../App';
import { formatTransactionAmount } from '../utils/currency';
import { NotificationService } from '../services/NotificationService';

interface ModernHomeDashboardProps {
  user: User;
  transactions: Transaction[];
  recipients: Recipient[];
  onSendMoney: () => void;
  onNavigate: (screen: Screen) => void;
  onRecipientSelect?: (recipient: Recipient) => void;
  onUpdateUser: (user: User) => void;
  setTransactions: (transactions: Transaction[]) => void;
  onAddRecipient: (recipient: Recipient) => void;
  onRemoveRecipient?: (recipientId: string) => void;
  isDesktop?: boolean;
}

export function ModernHomeDashboard({ 
  user, 
  transactions, 
  recipients,
  onSendMoney, 
  onNavigate, 
  onRecipientSelect, 
  onUpdateUser, 
  setTransactions,
  onAddRecipient,
  onRemoveRecipient,
  isDesktop = false 
}: ModernHomeDashboardProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isStoreFrontModalOpen, setIsStoreFrontModalOpen] = useState(false);
  const [isPayBillsModalOpen, setIsPayBillsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'wallet' | 'finance'>('wallet');
  const [unreadCount, setUnreadCount] = useState(0);

  const { theme, toggleTheme } = useTheme();

  // Subscribe to notification updates
  useEffect(() => {
    const unsubscribe = NotificationService.subscribe((notifications) => {
      setUnreadCount(NotificationService.getUnreadCount());
    });

    // Initial count
    setUnreadCount(NotificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  // Calculate unread notifications count (mock data)
  // const unreadCount = 3;

  // Calculate inflow and outflow for the current month
  const calculateMonthlyFlow = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let inflow = 0;
    let outflow = 0;
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
        const amount = parseFloat(transaction.amount);
        
        // More comprehensive transaction flow determination
        let isIncoming: boolean;
        
        if (transaction.flow_type) {
          isIncoming = transaction.flow_type === 'inflow';
        } else {
          // Determine based on transaction type and properties
          isIncoming = transaction.type === 'deposit' || 
                      transaction.type === 'add_money' ||
                      transaction.type === 'bank_deposit' ||
                      transaction.status === 'received' || 
                      transaction.recipient?.toLowerCase().includes('deposit') ||
                      transaction.recipient?.toLowerCase().includes('add money') ||
                      (transaction.recipientId === 'deposit');
        }
        
        if (isIncoming) {
          inflow += amount;
        } else {
          outflow += amount;
        }
      }
    });
    
    return { inflow, outflow };
  };

  const { inflow, outflow } = calculateMonthlyFlow();

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStoreFrontClick = () => {
    setIsStoreFrontModalOpen(true);
  };

  const handlePayBillsClick = () => {
    setIsPayBillsModalOpen(true);
  };

  const handleNotificationClick = () => {
    onNavigate('notifications');
  };

  const handleScanToPay = () => {
    setIsQRScannerOpen(true);
  };

  const handleQRScan = (data: string) => {
    console.log('QR Scanned:', data);
    toast.success('QR Code scanned successfully!');
    setIsQRScannerOpen(false);
  };

  // Render Wallet View (existing dashboard content)
  const renderWalletView = () => (
    <>
      {/* Balance Card */}
      <div className="pt-6 pb-4 flex-shrink-0">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 shadow-2xl border border-white/20">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          {/* Glass overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/5 rounded-3xl"></div>
          
          {/* Card Content */}
          <div className="relative z-10 p-6">
            {/* Balance Section */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-white/60"></div>
                  <p className="text-white/80 text-sm font-medium">Available balance</p>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-white text-4xl font-bold tracking-tight">
                    {isBalanceVisible 
                      ? `$${formatBalance(user.balance || 0)}`
                      : '$••••••••'
                    }
                  </h1>
                  <button
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-all duration-200 shadow-lg"
                  >
                    {isBalanceVisible ? (
                      <EyeOff size={18} className="text-white/90" />
                    ) : (
                      <Eye size={18} className="text-white/90" />
                    )}
                  </button>
                </div>
                
                <p className="text-white/70 text-base font-medium">
                  {isBalanceVisible 
                    ? `.60`
                    : '.••'
                  }
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => onNavigate('add-money')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/15 hover:bg-white/25 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus size={20} className="text-white" />
                </div>
                <span className="text-white text-sm font-medium">Fund</span>
              </button>

              <button 
                onClick={() => onNavigate('withdraw')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/15 hover:bg-white/25 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Download size={20} className="text-white" />
                </div>
                <span className="text-white text-sm font-medium">Withdraw</span>
              </button>

              <button 
                onClick={onSendMoney}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/15 hover:bg-white/25 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <span className="text-white text-sm font-medium">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inflow/Outflow Cards */}
      <div className="pb-6 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
          {/* Inflow Card */}
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingDown size={16} className="text-green-600 dark:text-green-400 rotate-180" />
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Inflow</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              ${formatBalance(inflow)}
            </p>
          </div>

          {/* Outflow Card */}
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
              </div>
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">Outflow</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              ${formatBalance(outflow)}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Action Grid */}
      <div className="pb-6 flex-shrink-0">
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={handleStoreFrontClick}
            className="flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Store size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">StoreFront</span>
          </button>

          <button
            onClick={handlePayBillsClick}
            className="flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Receipt size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">Pay bills</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ArrowLeftRight size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">Rate</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Building2 size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="flex-1 min-h-0 pb-6">
        {transactions.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-800 dark:text-white text-lg font-semibold">Recent transaction</h3>
              <button
                onClick={() => onNavigate('history')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm font-medium"
              >
                see all
              </button>
            </div>
            
            <div className="overflow-y-auto space-y-3" style={{ height: 'calc(100vh - 560px)' }}>
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-white/50">
                        <AvatarImage src={transaction.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                          {transaction.recipient[0]}
                        </AvatarFallback>
                      </Avatar>
                      {/* Transaction type indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                        transaction.type === 'deposit' || transaction.status === 'received' 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}>
                        {transaction.type === 'deposit' || transaction.status === 'received' ? (
                          <TrendingDown size={12} className="text-white rotate-180" />
                        ) : (
                          <TrendingUp size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white font-semibold text-sm">{transaction.recipient}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`font-medium ${
                      transaction.type === 'deposit' || transaction.status === 'received' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatTransactionAmount(transaction)}
                    </span>
                    <p className="text-gray-500 dark:text-gray-400 text-xs capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );

  // Render Finance View (analytics-focused content)
  const renderFinanceView = () => (
    <>
      {/* Finance Overview Cards */}
      <div className="pt-4 pb-6 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Monthly Summary */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} />
              <span className="text-sm font-medium">Monthly Income</span>
            </div>
            <p className="text-2xl font-bold">${formatBalance(inflow)}</p>
            <p className="text-emerald-100 text-xs">+12% from last month</p>
          </div>

          {/* Spending */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={18} />
              <span className="text-sm font-medium">Monthly Spending</span>
            </div>
            <p className="text-2xl font-bold">${formatBalance(outflow)}</p>
            <p className="text-rose-100 text-xs">-8% from last month</p>
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white text-lg font-semibold">Financial Health</h3>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <BarChart3 size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{width: '78%'}}></div>
            </div>
            <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-2">78% - Good</p>
          </div>
        </div>
      </div>

      {/* Spending Categories */}
      <div className="pb-6 flex-shrink-0">
        <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Spending by Category</h3>
        <div className="space-y-3">
          {[
            { category: 'Food & Dining', amount: 450, percentage: 35, color: 'bg-orange-500' },
            { category: 'Transportation', amount: 280, percentage: 22, color: 'bg-blue-500' },
            { category: 'Shopping', amount: 320, percentage: 25, color: 'bg-purple-500' },
            { category: 'Bills & Utilities', amount: 230, percentage: 18, color: 'bg-green-500' }
          ].map((item, index) => (
            <div key={index} className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-800 dark:text-white font-medium">{item.category}</span>
                <span className="text-gray-600 dark:text-gray-400 font-medium">${item.amount}</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{width: `${item.percentage}%`}}></div>
                </div>
                <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pb-6 flex-shrink-0">
        <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Financial Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('analytics')}
            className="flex flex-col items-center gap-3 p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 shadow-lg group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Full Analytics</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="flex flex-col items-center gap-3 p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 shadow-lg group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Receipt size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">All Transactions</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 text-foreground relative overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-lg border-b border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-10 h-10 border-2 border-white/50">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                  {user.name?.charAt(0) || user.first_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>

          {/* Tab Switch - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-white/50 dark:border-white/20">
            <button
              onClick={() => setCurrentView('wallet')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                currentView === 'wallet'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setCurrentView('finance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                currentView === 'finance'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Finance
            </button>
          </div>

          <button
            onClick={() => onNavigate('notifications')}
            className="relative p-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-lg border border-white/50 dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 shadow-lg"
          >
            <Bell size={20} className="text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 pt-16 px-4">
        {currentView === 'wallet' ? (
          renderWalletView()
        ) : (
          renderFinanceView()
        )}
      </div>

      {/* QR Scanner */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* StoreFront Modal */}
      <Dialog open={isStoreFrontModalOpen} onOpenChange={setIsStoreFrontModalOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/30 dark:border-white/20 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Store size={20} className="text-blue-600 dark:text-blue-400" />
              StoreFront
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
              Your digital marketplace for goods and services
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
                <Store size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2">Coming Soon!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                StoreFront is not available in your country yet. We're working on expanding our services to your region.
              </p>
              <Button 
                onClick={() => setIsStoreFrontModalOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay Bills Modal */}
      <Dialog open={isPayBillsModalOpen} onOpenChange={setIsPayBillsModalOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/30 dark:border-white/20 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Receipt size={20} className="text-purple-600 dark:text-purple-400" />
              Pay Bills
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
              Pay your utility bills, subscriptions, and more
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center">
                <Receipt size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2">Coming Soon!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                Bill Payments is coming to CrossBridge soon! Stay tuned for updates.
              </p>
              <Button 
                onClick={() => setIsPayBillsModalOpen(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}