import React, { useState, useEffect, createContext, useContext } from 'react';
import { HomeDashboard } from './components/HomeDashboard';
import { RecipientSelection } from './components/RecipientSelection';
import { SendAmount } from './components/SendAmount';
import { TransactionResult } from './components/TransactionResult';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TransactionHistory } from './components/TransactionHistory';
import { ReceiptScreen } from './components/ReceiptScreen';
import { NotificationScreen } from './components/NotificationScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { DepositAmountModal } from './components/DepositAmountModal';
import { DepositInstructions } from './components/DepositInstructions';
import { QRScanner } from './components/QRScanner';
import ErrorBoundary from './components/ErrorBoundary';
import { ExchangeRateService } from './services/ExchangeRateService';
import { NotificationService } from './services/NotificationService';
import { dashboardService } from './services/DashboardService';
import TransactionService from './services/TransactionService';

export type Recipient = {
  id: string;
  name: string;
  avatar: string;
  country: string;
  currency: string;
  phone?: string;
  bankCode?: string;
  accountNumber?: string;
  bankName?: string;  // Added for app-to-bank withdrawals
};

export type Transaction = {
  id: string;
  recipient: string;
  recipientId: string;
  amount: string;
  currency: string;
  convertedAmount: string;
  recipientCurrency: string;
  status: 'sent' | 'received' | 'pending' | 'completed' | 'failed';
  date: string;
  timestamp: number;
  avatar: string;
  referenceNumber: string;
  exchangeRate: number;
  fee: string;
  totalPaid: string;
  category?: 'family_friends' | 'business' | 'bills_utilities' | 'education' | 'medical' | 'shopping' | 'travel' | 'investment' | 'other';
  note?: string;
  type?: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  currency: string;
  phoneNumber: string;
  verificationLevel: 'basic' | 'verified' | 'premium';
};

export type Screen = 
  | 'login' 
  | 'signup' 
  | 'home' 
  | 'recipients' 
  | 'amount' 
  | 'success' 
  | 'failure' 
  | 'profile' 
  | 'history' 
  | 'receipt'
  | 'notifications'
  | 'analytics'
  | 'deposit-instructions';

// Theme Context
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [sendAmount, setSendAmount] = useState<string>('');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [theme, setTheme] = useState<Theme>('light');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  
  // Deposit flow state
  const [isDepositAmountModalOpen, setIsDepositAmountModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<string | null>(null);
  const [depositData, setDepositData] = useState<any>(null);

  // Initialize exchange rates and start real-time updates
  useEffect(() => {
    ExchangeRateService.initialize();
    const updateRates = () => {
      setExchangeRates(ExchangeRateService.getRates());
    };
    
    updateRates();
    const interval = setInterval(updateRates, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Load saved recipients
  useEffect(() => {
    const savedRecipients = JSON.parse(localStorage.getItem('saved_recipients') || '[]');
    setRecipients(savedRecipients);
  }, []);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Refresh balance periodically when user is logged in
  useEffect(() => {
    if (!user) return;

    const refreshBalance = async () => {
      try {
        const balance = await dashboardService.getWalletBalance();
        setUser(prevUser => prevUser ? { ...prevUser, balance } : null);
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
    };

    // Refresh balance every 60 seconds
    const interval = setInterval(refreshBalance, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id]); // Only depend on user ID to avoid recreating interval

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = async (userData: User) => {
    try {
      // Fetch real dashboard data from backend
      const { user: dashboardUser, transactions: dashboardTransactions } = await dashboardService.getDashboardData();
      
      // Update user data with real balance from backend
      const updatedUser = {
        ...userData,
        balance: dashboardUser.balance, // Real CBUSD balance from backend
        verificationLevel: dashboardUser.verificationLevel
      };
      
      setUser(updatedUser);
      setTransactions(dashboardTransactions);
      
      // Initialize notification service
      NotificationService.initialize(updatedUser.id);
      
      // Add login notification
      NotificationService.addLoginNotification();
      
      navigateTo('home');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to original behavior if backend fails
      setUser(userData);
      const userTransactions = JSON.parse(localStorage.getItem(`transactions_${userData.id}`) || '[]');
      setTransactions(userTransactions);
      NotificationService.initialize(userData.id);
      NotificationService.addLoginNotification();
      navigateTo('home');
    }
  };

  const handleSignup = async (userData: User) => {
    try {
      // For signup, user likely has 0 balance, but let's fetch anyway
      const { user: dashboardUser, transactions: dashboardTransactions } = await dashboardService.getDashboardData();
      
      // Update user data with real balance from backend
      const updatedUser = {
        ...userData,
        balance: dashboardUser.balance, // Real CBUSD balance from backend
        verificationLevel: dashboardUser.verificationLevel
      };
      
      setUser(updatedUser);
      setTransactions(dashboardTransactions);
      
      // Initialize notification service
      NotificationService.initialize(updatedUser.id);
      
      // Add welcome notification for new users
      NotificationService.addNotification({
        title: 'Welcome to SecureRemit!',
        message: 'Your account has been created successfully. Start sending money securely!',
        type: 'system',
        priority: 'medium'
      });
      
      navigateTo('home');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to original behavior if backend fails
      setUser(userData);
      setTransactions([]);
      NotificationService.initialize(userData.id);
      NotificationService.addNotification({
        title: 'Welcome to SecureRemit!',
        message: 'Your account has been created successfully. Start sending money securely!',
        type: 'system',
        priority: 'medium'
      });
      navigateTo('home');
    }
  };

  const handleLogout = () => {
    // Add logout notification before cleanup
    if (user) {
      NotificationService.addLogoutNotification();
    }
    
    // Cleanup notification service
    NotificationService.cleanup();
    setUser(null);
    setTransactions([]);
    setSelectedRecipient(null);
    setSendAmount('');
    setCurrentTransaction(null);
    navigateTo('login');
  };

  const handleRecipientSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    navigateTo('amount');
  };

  const handleQuickSend = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    navigateTo('amount');
  };

  const handleAddRecipient = (newRecipient: Recipient) => {
    const updatedRecipients = [...recipients, newRecipient];
    setRecipients(updatedRecipients);
    localStorage.setItem('saved_recipients', JSON.stringify(updatedRecipients));
  };

  const handleAmountConfirm = async (params: { amount: string; category?: string; note?: string; transactionId?: string; exchangeRate?: number; }) => {
    const { amount, category, note, transactionId } = params;
    setSendAmount(amount);
    
    // Since SendAmount component already handled the transaction API call,
    // we just need to handle the success navigation and UI updates here
    if (selectedRecipient && user && transactionId) {
      try {
        // Refresh user balance after successful transaction
        const balanceData = await dashboardService.getWalletBalance();
        const updatedUser = { ...user, balance: balanceData.cbusd_balance };
        setUser(updatedUser);
        localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
        
        // Find the transaction that was just created by the SendAmount component
        // In a real app, you might fetch this from the backend using transactionId
        const isAppToApp = selectedRecipient.currency === 'CBUSD';
        const transactionType = isAppToApp ? 'transfer' : 'withdrawal';
        
        // Create success transaction record for UI
        const successTransaction: Transaction = {
          id: transactionId,
          recipient: selectedRecipient.name,
          recipientId: selectedRecipient.id,
          amount: amount,
          currency: 'CBUSD',
          convertedAmount: isAppToApp ? amount : (parseFloat(amount) * (params.exchangeRate || 1)).toString(),
          recipientCurrency: selectedRecipient.currency,
          status: 'completed',
          date: new Date().toISOString(),
          timestamp: Date.now(),
          avatar: selectedRecipient.avatar,
          referenceNumber: transactionId,
          exchangeRate: params.exchangeRate || 1,
          fee: (parseFloat(amount) * 0.015).toFixed(2), // 1.5% fee
          totalPaid: (parseFloat(amount) * 1.015).toFixed(2), // Amount + fee
          category: category as Transaction['category'],
          note: note,
          type: transactionType
        };
        
        // Update state with completed transaction
        const updatedTransactions = [successTransaction, ...transactions];
        setTransactions(updatedTransactions);
        
        // Add transaction notification
        NotificationService.addTransactionNotification(
          'completed',
          selectedRecipient.name,
          amount,
          selectedRecipient.currency
        );
        
        // Save to localStorage
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
        
        setCurrentTransaction(successTransaction);
        navigateTo('success');
        
      } catch (error: any) {
        console.error('Failed to refresh balance after transaction:', error);
        // Even if balance refresh fails, still navigate to success since transaction worked
        navigateTo('success');
      }
    }
  };

  const handleTransactionError = (error: Error) => {
    console.error('Transaction error:', error);
    
    if (selectedRecipient && user) {
      // Create failed transaction
      const failedTransaction: Transaction = {
        id: `FAILED_${Date.now()}`,
        recipient: selectedRecipient.name,
        recipientId: selectedRecipient.id,
        amount: sendAmount,
        currency: 'CBUSD',
        convertedAmount: sendAmount,
        recipientCurrency: selectedRecipient.currency,
        status: 'failed',
        date: new Date().toISOString(),
        timestamp: Date.now(),
        avatar: selectedRecipient.avatar,
        referenceNumber: `FAILED_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        exchangeRate: 1,
        fee: '0.00',
        totalPaid: sendAmount,
        category: 'other',
        note: error.message
      };
      
      setCurrentTransaction(failedTransaction);
      setTransactions([failedTransaction, ...transactions]);
      
      // Show error notification
      NotificationService.addTransactionNotification(
        'failed',
        selectedRecipient.name,
        sendAmount,
        selectedRecipient.currency
      );
      
      navigateTo('failure');
    }
  };

  const handleDeposit = async (amount: number, currency: string) => {
    try {
      // Create mock deposit instructions without calling the API yet
      const mockDepositData = {
        amount,
        currency,
        bank_account: '0123456789',
        reference_code: `REF${Date.now()}`,
        bank_name: 'SecureRemit Bank',
        instructions: 'Transfer the amount to the account details provided below',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
      };
      
      // Store deposit data and navigate to instructions page
      setDepositData(mockDepositData);
      navigateTo('deposit-instructions');
      
    } catch (error: any) {
      console.error('Deposit setup failed:', error);
      alert(`Deposit setup failed: ${error.message}`);
    }
  };

  const handleDepositAmountSubmit = (amount: number, currency: string) => {
    setIsDepositAmountModalOpen(false);
    
    if (selectedDepositMethod === 'qr') {
      // For QR method, show QR scanner instead of immediately calling handleDeposit
      setIsQRScannerOpen(true);
      // Store the deposit data for later use
      setDepositData({ amount, currency, method: selectedDepositMethod });
    } else {
      // For other methods (bank, card, ussd), proceed with normal deposit flow
      handleDeposit(amount, currency);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      // Handle the QR code data - for now just show success and proceed with deposit
      alert(`QR Code scanned! Payment request from ${qrData.recipient || 'Unknown'}`);
      
      // Close QR scanner and proceed with the stored deposit data
      setIsQRScannerOpen(false);
      if (depositData) {
        handleDeposit(depositData.amount, depositData.currency);
      }
    } catch (err) {
      alert('QR code scanned successfully! Proceeding with deposit...');
      setIsQRScannerOpen(false);
      if (depositData) {
        handleDeposit(depositData.amount, depositData.currency);
      }
    }
  };

  const handleShowDepositModal = (method?: string) => {
    if (method) {
      setSelectedDepositMethod(method);
    }
    setIsDepositAmountModalOpen(true);
  };

  const handleDepositPaymentConfirm = async () => {
    try {
      if (user && depositData) {
        // Now call the actual bank-to-app API when user confirms payment
        const depositResult = await TransactionService.initiateDeposit({
          amount: depositData.amount,
          currency: depositData.currency
        });
        
        // Refresh balance after API confirmation
        const balanceData = await dashboardService.getWalletBalance();
        const updatedUser = { ...user, balance: balanceData || user.balance };
        setUser(updatedUser);
        localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
        
        // Add deposit transaction to history
        const depositTransaction: Transaction = {
          id: `DEP_${Date.now()}`,
          recipient: `Deposit from ${depositData.currency}`,
          recipientId: 'deposit',
          amount: depositData.amount.toString(),
          currency: 'CBUSD',
          convertedAmount: depositData.amount.toString(),
          recipientCurrency: 'CBUSD',
          status: 'received',
          date: new Date().toISOString(),
          timestamp: Date.now(),
          avatar: 'https://ui-avatars.com/api/?name=D&background=22c55e&color=fff',
          referenceNumber: depositData.reference_code,
          exchangeRate: 1,
          fee: '0.00',
          totalPaid: depositData.amount.toString(),
          category: 'other',
          note: `Deposit from ${depositData.currency}`,
          type: 'deposit'
        };
        
        setTransactions(prev => [depositTransaction, ...prev]);
        
        NotificationService.addDepositNotification(
          depositData.amount.toString(),
          'CBUSD',
          depositData.currency
        );
        
        // Navigate back to home
        navigateTo('home');
      }
    } catch (error: any) {
      console.error('Failed to process deposit confirmation:', error);
      alert(`Failed to confirm deposit: ${error.message}`);
    }
  };

  const handleWithdraw = async (amount: number, bankDetails: any) => {
    try {
      const withdrawResult = await TransactionService.initiateWithdrawal({
        amount,
        currency: 'NGN', // Default to NGN for now
        bank_code: '058', // GTBank code as example
        account_number: bankDetails.accountNumber,
        narration: `Withdrawal to ${bankDetails.bankName}`
      });
      
      // Add withdrawal transaction to history
      const withdrawTransaction: Transaction = {
        id: withdrawResult.id,
        recipient: `Withdraw to ${bankDetails.bankName}`,
        recipientId: 'withdrawal',
        amount: amount.toString(),
        currency: 'CBUSD',
        convertedAmount: (amount * 1600).toString(), // Mock NGN conversion
        recipientCurrency: 'NGN',
        status: withdrawResult.status as Transaction['status'],
        date: withdrawResult.created_at || new Date().toISOString(),
        timestamp: Date.now(),
        avatar: 'https://ui-avatars.com/api/?name=W&background=ef4444&color=fff',
        referenceNumber: withdrawResult.reference_id,
        exchangeRate: 1600, // Mock NGN rate
        fee: withdrawResult.fee?.toString() || '0.00',
        totalPaid: withdrawResult.total?.toString() || amount.toString(),
        category: 'other',
        note: `Withdrawal to ${bankDetails.accountName}`
      };
      
      setTransactions(prev => [withdrawTransaction, ...prev]);
      
      // Refresh balance
      try {
        const balanceData = await dashboardService.getWalletBalance();
        const updatedUser = { ...user!, balance: balanceData || user!.balance };
        setUser(updatedUser);
        localStorage.setItem(`user_${user!.id}`, JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
      
      NotificationService.addWithdrawalNotification(
        amount.toString(),
        'CBUSD',
        bankDetails.bankName
      );
      
      alert(`Withdrawal initiated! Reference: ${withdrawResult.reference_id}`);
      
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      alert(`Withdrawal failed: ${error.message}`);
    }
  };

  const resetFlow = () => {
    setSelectedRecipient(null);
    setSendAmount('');
    setCurrentTransaction(null);
    navigateTo('home');
  };

  const viewReceipt = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    navigateTo('receipt');
  };

  const themeContextValue: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className="min-h-screen bg-background relative">
        {/* Responsive background with mobile-optimized sizes */}
        <div className="fixed top-0 left-0 w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 bg-blue-100/30 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="fixed bottom-0 right-0 w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-84 lg:h-84 xl:w-96 xl:h-96 bg-purple-100/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        
        {/* Responsive container with improved mobile handling */}
        <div className="relative z-10 w-full min-h-screen">
          {/* Mobile/Tablet Layout - Full width on mobile, responsive on larger screens */}
          <div className="2xl:hidden">
            <div className="w-full mx-auto xl:max-w-xl xl:mx-auto">
                          <div className="px-1 sm:px-2 md:px-4 lg:px-6 h-full overflow-x-auto">
                {currentScreen === 'login' && (
                  <LoginScreen 
                    onLogin={handleLogin} 
                    onSwitchToSignup={() => navigateTo('signup')} 
                  />
                )}
                {currentScreen === 'signup' && (
                  <SignupScreen 
                    onSignup={handleSignup} 
                    onSwitchToLogin={() => navigateTo('login')} 
                  />
                )}
                {currentScreen === 'home' && user && (
                  <HomeDashboard 
                    user={user}
                    transactions={transactions}
                    recipients={recipients}
                    onSendMoney={() => navigateTo('recipients')}
                    onNavigate={navigateTo}
                    onRecipientSelect={handleQuickSend}
                    onUpdateUser={setUser}
                    setTransactions={setTransactions}
                    onAddRecipient={handleAddRecipient}
                    onWithdraw={handleWithdraw}
                    onDeposit={handleDeposit}
                    onShowDepositModal={handleShowDepositModal}
                  />
                )}
                {currentScreen === 'recipients' && (
                  <RecipientSelection
                    onBack={() => navigateTo('home')}
                    onRecipientSelect={handleRecipientSelect}
                  />
                )}
                {currentScreen === 'amount' && selectedRecipient && (
                  <SendAmount
                    recipient={selectedRecipient}
                    type={selectedRecipient.currency === 'CBUSD' ? 'app_transfer' : 'bank_withdrawal'}
                    exchangeRates={exchangeRates}
                    onBack={() => navigateTo('recipients')}
                    onConfirm={handleAmountConfirm}
                    onError={handleTransactionError}
                  />
                )}
                {(currentScreen === 'success' || currentScreen === 'failure') && currentTransaction && (
                  <TransactionResult
                    isSuccess={currentScreen === 'success'}
                    transaction={currentTransaction}
                    onDone={resetFlow}
                    onTryAgain={() => navigateTo('amount')}
                    onViewReceipt={() => viewReceipt(currentTransaction)}
                  />
                )}
                {currentScreen === 'profile' && user && (
                  <ProfileScreen
                    user={user}
                    onBack={() => navigateTo('home')}
                    onLogout={handleLogout}
                    onUpdateUser={setUser}
                  />
                )}
                {currentScreen === 'history' && (
                  <TransactionHistory
                    transactions={transactions}
                    onBack={() => navigateTo('home')}
                    onViewReceipt={viewReceipt}
                  />
                )}
                {currentScreen === 'receipt' && currentTransaction && (
                  <ReceiptScreen
                    transaction={currentTransaction}
                    user={user}
                    onBack={() => navigateTo('history')}
                  />
                )}
                {currentScreen === 'notifications' && (
                  <NotificationScreen
                    onBack={() => navigateTo('home')}
                  />
                )}
                {currentScreen === 'analytics' && (
                  <AnalyticsScreen
                    onBack={() => navigateTo('home')}
                  />
                )}
                {currentScreen === 'deposit-instructions' && depositData && user && (
                  <DepositInstructions
                    onBack={() => navigateTo('home')}
                    depositData={depositData}
                    onPaymentConfirm={handleDepositPaymentConfirm}
                    user={user}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Deposit Amount Modal */}
          <DepositAmountModal
            isOpen={isDepositAmountModalOpen}
            onClose={() => setIsDepositAmountModalOpen(false)}
            onProceed={handleDepositAmountSubmit}
          />

          {/* QR Scanner Modal */}
          <QRScanner
            isOpen={isQRScannerOpen}
            onClose={() => setIsQRScannerOpen(false)}
            onScan={handleQRScan}
          />

          {/* Desktop Layout */}
          <div className="hidden 2xl:flex min-h-screen">
            {/* Show sidebar only when user is logged in */}
            {user && (
              <div className="w-80 bg-white/50 dark:bg-black/50 backdrop-blur-xl border-r border-gray-200/30 dark:border-white/10">
                <div className="p-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">SecureRemit</h1>
                    <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name.split(' ')[0]}</p>
                  </div>
                  
                  {/* Desktop Balance Display */}
                  <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-gray-200/30 dark:border-white/10">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Balance</p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                      ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      ₦{(user.balance * 1532.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Desktop Navigation */}
                  <nav className="space-y-2">
                    <button
                      onClick={() => navigateTo('home')}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        currentScreen === 'home' 
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigateTo('recipients')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Send Money
                    </button>
                    <button
                      onClick={() => navigateTo('history')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Transaction History
                    </button>
                    <button
                      onClick={() => navigateTo('analytics')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Exchange Rates
                    </button>
                    <button
                      onClick={() => navigateTo('notifications')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Notifications
                    </button>
                    <button
                      onClick={() => navigateTo('profile')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Profile & Settings
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto overflow-x-auto">
              {currentScreen === 'login' && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-lg">
                    <LoginScreen 
                      onLogin={handleLogin} 
                      onSwitchToSignup={() => navigateTo('signup')} 
                    />
                  </div>
                </div>
              )}
              {currentScreen === 'signup' && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-lg">
                    <SignupScreen 
                      onSignup={handleSignup} 
                      onSwitchToLogin={() => navigateTo('login')} 
                    />
                  </div>
                </div>
              )}
              {currentScreen === 'home' && user && (
                <HomeDashboard 
                  user={user}
                  transactions={transactions}
                  recipients={recipients}
                  onSendMoney={() => navigateTo('recipients')}
                  onNavigate={navigateTo}
                  onRecipientSelect={handleQuickSend}
                  onUpdateUser={setUser}
                  setTransactions={setTransactions}
                  onAddRecipient={handleAddRecipient}
                  onWithdraw={handleWithdraw}
                  onDeposit={handleDeposit}
                  onShowDepositModal={handleShowDepositModal}
                  isDesktop={true}
                />
              )}
              {currentScreen === 'recipients' && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-lg">
                    <RecipientSelection
                      onBack={() => navigateTo('home')}
                      onRecipientSelect={handleRecipientSelect}
                    />
                  </div>
                </div>
              )}
              {currentScreen === 'amount' && selectedRecipient && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-lg">
                    <SendAmount
                      recipient={selectedRecipient}
                      type={selectedRecipient.currency === 'CBUSD' ? 'app_transfer' : 'bank_withdrawal'}
                      exchangeRates={exchangeRates}
                      onBack={() => navigateTo('recipients')}
                      onConfirm={handleAmountConfirm}
                      onError={handleTransactionError}
                    />
                  </div>
                </div>
              )}
              {(currentScreen === 'success' || currentScreen === 'failure') && currentTransaction && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-lg">
                    <TransactionResult
                      isSuccess={currentScreen === 'success'}
                      transaction={currentTransaction}
                      onDone={resetFlow}
                      onTryAgain={() => navigateTo('amount')}
                      onViewReceipt={() => viewReceipt(currentTransaction)}
                    />
                  </div>
                </div>
              )}
              {currentScreen === 'profile' && user && (
                <ProfileScreen
                  user={user}
                  onBack={() => navigateTo('home')}
                  onLogout={handleLogout}
                  onUpdateUser={setUser}
                />
              )}
              {currentScreen === 'history' && (
                <TransactionHistory
                  transactions={transactions}
                  onBack={() => navigateTo('home')}
                  onViewReceipt={viewReceipt}
                />
              )}
              {currentScreen === 'receipt' && currentTransaction && (
                <ReceiptScreen
                  transaction={currentTransaction}
                  user={user}
                  onBack={() => navigateTo('history')}
                />
              )}
              {currentScreen === 'notifications' && (
                <NotificationScreen
                  onBack={() => navigateTo('home')}
                />
              )}
              {currentScreen === 'analytics' && (
                <AnalyticsScreen
                  onBack={() => navigateTo('home')}
                />
              )}
              {currentScreen === 'deposit-instructions' && depositData && user && (
                <DepositInstructions
                  onBack={() => navigateTo('home')}
                  depositData={depositData}
                  onPaymentConfirm={handleDepositPaymentConfirm}
                  user={user}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// Wrap the App with ErrorBoundary
export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App error caught by boundary:', error, errorInfo);
      // Here you could send error reports to your monitoring service
    }}>
      <App />
    </ErrorBoundary>
  );
}