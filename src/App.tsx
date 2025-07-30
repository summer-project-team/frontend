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
import { ExchangeRateService } from './services/ExchangeRateService';
import { NotificationService } from './services/NotificationService';

export type Recipient = {
  id: string;
  name: string;
  avatar: string;
  country: string;
  currency: string;
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
  | 'analytics';

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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [sendAmount, setSendAmount] = useState<string>('');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [theme, setTheme] = useState<Theme>('light');
  const [recipients, setRecipients] = useState<Recipient[]>([]);

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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Load user's transaction history
    const userTransactions = JSON.parse(localStorage.getItem(`transactions_${userData.id}`) || '[]');
    setTransactions(userTransactions);
    // Initialize notification service
    NotificationService.initialize(userData.id);
    navigateTo('home');
  };

  const handleSignup = (userData: User) => {
    setUser(userData);
    setTransactions([]);
    // Initialize notification service
    NotificationService.initialize(userData.id);
    navigateTo('home');
  };

  const handleLogout = () => {
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

  const handleAmountConfirm = (amount: string, category?: string, note?: string) => {
    setSendAmount(amount);
    
    if (selectedRecipient && user) {
      const exchangeRate = exchangeRates[selectedRecipient.currency] || 1;
      const numericAmount = parseFloat(amount);
      
      // Different processing for USDC to USDC vs USDC to Fiat
      let convertedAmount: number;
      let fee: number;
      
      if (selectedRecipient.currency === 'USDC') {
        // USDC to USDC (app to app) - minimal fee
        convertedAmount = numericAmount;
        fee = numericAmount * 0.005; // 0.5% fee for app-to-app
      } else {
        // USDC to Fiat (to bank) - standard fee
        convertedAmount = numericAmount * exchangeRate;
        fee = numericAmount * 0.015; // 1.5% fee for fiat conversion
      }
      
      const totalPaid = numericAmount + fee;
      
      const newTransaction: Transaction = {
        id: `TX${Date.now()}`,
        recipient: selectedRecipient.name,
        recipientId: selectedRecipient.id,
        amount: amount,
        currency: 'USDC',
        convertedAmount: convertedAmount.toFixed(2),
        recipientCurrency: selectedRecipient.currency,
        status: 'pending',
        date: new Date().toISOString(),
        timestamp: Date.now(),
        avatar: selectedRecipient.avatar,
        referenceNumber: `TX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        exchangeRate: exchangeRate,
        fee: fee.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        category: category as Transaction['category'],
        note: note
      };
      
      setCurrentTransaction(newTransaction);
      
      // Simulate success/failure - 95% success rate for app-to-app, 90% for bank transfers
      const successRate = selectedRecipient.currency === 'USDC' ? 0.95 : 0.9;
      const isSuccess = Math.random() < successRate;
      
      setTimeout(() => {
        const completedTransaction: Transaction = {
          ...newTransaction,
          status: isSuccess ? 'completed' : 'failed'
        };
        
        const updatedTransactions = [completedTransaction, ...transactions];
        setTransactions(updatedTransactions);
        
        // Add transaction notification
        NotificationService.addTransactionNotification(
          isSuccess ? 'completed' : 'failed',
          selectedRecipient.name,
          amount,
          selectedRecipient.currency
        );
        
        // Save to localStorage
        if (user) {
          localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
        }
        
        if (isSuccess && user) {
          // Deduct from user balance
          const updatedUser = { ...user, balance: user.balance - totalPaid };
          setUser(updatedUser);
          localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
        }
        
        navigateTo(isSuccess ? 'success' : 'failure');
      }, 2000);
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
                    exchangeRates={exchangeRates}
                    onBack={() => navigateTo('recipients')}
                    onConfirm={handleAmountConfirm}
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
              </div>
            </div>
          </div>

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
                      exchangeRates={exchangeRates}
                      onBack={() => navigateTo('recipients')}
                      onConfirm={handleAmountConfirm}
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
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}