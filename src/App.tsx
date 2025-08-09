import React, { useState, useEffect, createContext, useContext } from 'react';
import { HomeDashboard } from './components/HomeDashboard';
import { ModernHomeDashboard } from './components/ModernHomeDashboard';
import { RecipientSelection } from './components/RecipientSelection';
import { ModernRecipientSelection } from './components/ModernRecipientSelection';
import { SendAmount } from './components/SendAmount';
import { ModernSendAmount } from './components/ModernSendAmount';
import { ProfileScreen } from './components/ProfileScreen';
import { ModernProfileScreen } from './components/ModernProfileScreen';
import { TransactionResult } from './components/TransactionResult';
import { LoginScreen } from './components/LoginScreen';
import { ModernLoginScreen } from './components/ModernLoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { ModernSignupScreen } from './components/ModernSignupScreen';
import { TransactionHistory } from './components/TransactionHistory';
import { ModernTransactionHistory } from './components/ModernTransactionHistory';
import { ReceiptScreen } from './components/ReceiptScreen';
import { NotificationScreen } from './components/NotificationScreen';
import { ModernNotificationScreen } from './components/ModernNotificationScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ModernAnalyticsScreen } from './components/ModernAnalyticsScreen';
import { ModernBankAccounts } from './components/ModernBankAccounts';
import { ModernWithdrawScreen } from './components/ModernWithdrawScreen';
import { ModernAddMoneyScreen } from './components/ModernAddMoneyScreen';
import { ModernPinScreen } from './components/ModernPinScreen';
import { ModernScanScreen } from './components/ModernScanScreen';
import { ModernRewardsScreen } from './components/ModernRewardsScreen';
import { ModernFooter } from './components/ModernFooter';
import { DepositAmountModal } from './components/DepositAmountModal';
import { DepositInstructions } from './components/DepositInstructions';
import { QRScanner } from './components/QRScanner';
import { SplashScreen } from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { ExchangeRateService } from './services/ExchangeRateService';
import { NotificationService } from './services/NotificationService';
import { dashboardService } from './services/DashboardService';
import TransactionService from './services/TransactionService';
import { enrichTransactionWithFlowType } from './utils/currency';
import { BankToSimulation } from './components/BankToSimulation';
import { DeveloperExamples } from './components/DeveloperExamples';
import { EnhancedAnalyticsScreen } from './components/EnhancedAnalyticsScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { WebSocketService } from './services/WebSocketService';


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
  type?: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'add_money' | 'bank_deposit';
  flow_type?: 'inflow' | 'outflow'; // Add flow_type field for consistent transaction direction
};

export type User = {
  id: string;
  name: string;
  first_name?: string;
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
  | 'deposit-instructions'
  | 'withdraw'
  | 'bank-accounts'
  | 'add-money'
  | 'pin'
  | 'scan'
  | 'rewards'
  | 'linked-accounts'
  | 'simulation'
  | 'developer-examples'
  | 'enhanced-analytics'
  | 'admin';

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
    // Provide a fallback during development to prevent crashes
    console.warn('useTheme called outside of ThemeProvider, using fallback');
    return {
      theme: 'light' as Theme,
      toggleTheme: () => console.warn('toggleTheme called outside of ThemeProvider')
    };
  }
  return context;
};

function App() {
  // Show splash screen every time app opens (good for mobile apps)
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [sendAmount, setSendAmount] = useState<string>('');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [theme, setTheme] = useState<Theme>('light');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [useModernDesign, setUseModernDesign] = useState(true); // Default to modern design
  
  // Deposit flow state
  const [isDepositAmountModalOpen, setIsDepositAmountModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<string | null>(null);
  const [depositData, setDepositData] = useState<any>(null);

  // PIN screen state
  const [pinScreenConfig, setPinScreenConfig] = useState<{
    purpose: 'verify' | 'setup' | 'change';
    title?: string;
    subtitle?: string;
    requireCurrentPin?: boolean;
    onSuccess?: (pin: string) => void;
    onCurrentPinVerified?: () => void;
    returnScreen?: Screen;
  } | null>(null);

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

  // Load saved recipients (user-specific)
  useEffect(() => {
    if (user?.id) {
      const userSpecificKey = `saved_recipients_${user.id}`;
      const globalKey = 'saved_recipients';
      
      // Check if user already has user-specific recipients
      const userRecipients = localStorage.getItem(userSpecificKey);
      
      if (userRecipients) {
        // User already has user-specific recipients, use them
        const savedRecipients = JSON.parse(userRecipients);
        setRecipients(savedRecipients);
      } else {
        // Check for old global recipients and migrate them for this user
        const globalRecipients = localStorage.getItem(globalKey);
        if (globalRecipients) {
          const savedRecipients = JSON.parse(globalRecipients);
          setRecipients(savedRecipients);
          // Save them under user-specific key
          localStorage.setItem(userSpecificKey, globalRecipients);
          console.log(`Migrated ${savedRecipients.length} recipients to user-specific storage for user ${user.id}`);
          
          // Optionally clean up the global key to prevent future conflicts
          // Note: Only do this if we're confident all users have been migrated
          // localStorage.removeItem(globalKey);
        } else {
          setRecipients([]);
        }
      }
    } else {
      // Clear recipients when no user is logged in
      setRecipients([]);
    }
  }, [user?.id]);

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
        console.log('Periodic balance refresh: Starting...');
        const oldBalance = user.balance;
        const balance = await dashboardService.getWalletBalance();
        console.log('Periodic balance refresh: Success', { oldBalance, newBalance: balance });
        setUser(prevUser => prevUser ? { ...prevUser, balance } : null);
      } catch (error) {
        console.error('Periodic balance refresh: Failed', error);
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

  const navigateToPin = (config: {
    purpose: 'verify' | 'setup' | 'change';
    title?: string;
    subtitle?: string;
    requireCurrentPin?: boolean;
    onSuccess?: (pin: string) => void;
    onCurrentPinVerified?: () => void;
    returnScreen?: Screen;
  }) => {
    setPinScreenConfig(config);
    setCurrentScreen('pin');
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
      setTransactions(dashboardTransactions.map(enrichTransactionWithFlowType));
      
      // Initialize notification service
      NotificationService.initialize(updatedUser.id);
      
      // Initialize WebSocket for real-time updates
      WebSocketService.initialize(updatedUser.id, {
        onTransactionUpdate: (transaction) => {
          setTransactions(prev => 
            prev.map(t => t.id === transaction.id ? enrichTransactionWithFlowType(transaction) : t)
          );
        },
        onDepositConfirmed: (deposit) => {
          // Refresh balance when deposit is confirmed
          dashboardService.getWalletBalance().then(balance => {
            setUser(prev => prev ? { ...prev, balance } : null);
          });
        },
        onBalanceUpdate: (balance) => {
          setUser(prev => prev ? { ...prev, balance } : null);
        },
        onNotification: (notification) => {
          NotificationService.addNotification(notification);
        }
      });
      
      // Add login notification
      NotificationService.addLoginNotification();
      
      navigateTo('home');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to original behavior if backend fails
      setUser(userData);
      const userTransactions = JSON.parse(localStorage.getItem(`transactions_${userData.id}`) || '[]');
      setTransactions(userTransactions.map(enrichTransactionWithFlowType));
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
      setTransactions(dashboardTransactions.map(enrichTransactionWithFlowType));
      
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
    
    // Cleanup services
    NotificationService.cleanup();
    WebSocketService.disconnect();
    
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
    if (user?.id) {
      localStorage.setItem(`saved_recipients_${user.id}`, JSON.stringify(updatedRecipients));
    }
  };

  const handleRemoveRecipient = (recipientId: string) => {
    const updatedRecipients = recipients.filter(r => r.id !== recipientId);
    setRecipients(updatedRecipients);
    if (user?.id) {
      localStorage.setItem(`saved_recipients_${user.id}`, JSON.stringify(updatedRecipients));
    }
    console.log(`Removed recipient with ID: ${recipientId}`);
  };

  const handleAmountConfirm = async (params: { amount: string; category?: string; note?: string; transactionId?: string; exchangeRate?: number; }) => {
    const { amount, category, note, transactionId } = params;
    console.log('App: handleAmountConfirm called with:', params);
    setSendAmount(amount);
    
    // Since SendAmount component already handled the transaction API call,
    // we just need to handle the success navigation and UI updates here
    if (selectedRecipient && user && transactionId) {
      try {
        console.log('App: Refreshing balance after transaction...');
        console.log('App: Transaction type:', selectedRecipient.currency === 'CBUSD' ? 'app-to-app' : 'app-to-bank');
        
        // For app-to-bank transactions, add a small delay to allow backend to process
        const isAppToBank = selectedRecipient.currency !== 'CBUSD';
        if (isAppToBank) {
          console.log('App: App-to-bank transaction detected, waiting 2 seconds before balance refresh...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Refresh user balance after successful transaction with retry logic
        let balanceData;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          try {
            console.log(`App: Balance refresh attempt ${attempts + 1}/${maxAttempts}`);
            balanceData = await dashboardService.getWalletBalance();
            console.log('App: New balance data:', balanceData);
            break; // Success, exit retry loop
          } catch (error) {
            attempts++;
            console.warn(`App: Balance refresh attempt ${attempts} failed:`, error);
            if (attempts < maxAttempts) {
              console.log('App: Retrying balance refresh in 1 second...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw error; // Re-throw if all attempts failed
            }
          }
        }
        
        const updatedUser = { ...user, balance: balanceData };
        setUser(updatedUser);
        localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
        console.log('App: User balance updated successfully:', { oldBalance: user.balance, newBalance: balanceData });
        
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
          type: transactionType,
          flow_type: 'outflow' as const // All sends are outflow
        };
        
        // Update user balance after successful transaction
        if (user) {
          const totalDeducted = parseFloat(amount) + (parseFloat(amount) * 0.015); // Amount + fee
          const newBalance = user.balance - totalDeducted;
          setUser(prevUser => prevUser ? { ...prevUser, balance: newBalance } : null);
        }
        
        // Update state with completed transaction
        const updatedTransactions = [successTransaction, ...transactions];
        setTransactions(updatedTransactions);
        
        // IMPORTANT: Add the recipient to the recipients list if it's not already there
        // This ensures recipients from transactions have complete data for future use
        const recipientExists = recipients.find(r => r.id === selectedRecipient.id);
        if (!recipientExists) {
          console.log('App: Adding new recipient to recipients list:', selectedRecipient);
          
          // Validate that the recipient has complete data before saving
          const hasCompleteData = selectedRecipient.currency === 'CBUSD' 
            ? !!selectedRecipient.phone  // For app users, phone is required
            : !!(selectedRecipient.accountNumber && selectedRecipient.bankCode); // For bank users, account details required
          
          if (!hasCompleteData) {
            console.warn('App: Recipient lacks complete data, not saving to recipients list:', {
              id: selectedRecipient.id,
              name: selectedRecipient.name,
              currency: selectedRecipient.currency,
              hasPhone: !!selectedRecipient.phone,
              hasAccount: !!selectedRecipient.accountNumber,
              hasBankCode: !!selectedRecipient.bankCode
            });
          } else {
            console.log('App: Recipient has complete data, saving to recipients list');
            const updatedRecipients = [...recipients, selectedRecipient];
            setRecipients(updatedRecipients);
            if (user?.id) {
              localStorage.setItem(`saved_recipients_${user.id}`, JSON.stringify(updatedRecipients));
            }
          }
        }
        
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
          currency: depositData.currency, // Use the actual deposit currency
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

  const handleWithdraw = async (amount: number, bankDetails: any, pin: string) => {
    try {
      console.log('App.tsx: handleWithdraw called with:', { amount, bankDetails, pin });
      const withdrawalData = {
        amount,
        currency: bankDetails.currency || 'NGN',
        bank_account_number: bankDetails.account_number,
        bank_name: bankDetails.bank_name,
        account_holder_name: bankDetails.account_name,
        transaction_pin: pin
      };
      console.log('App.tsx: Calling TransactionService.initiateWithdrawal with:', withdrawalData);
      const withdrawResult = await TransactionService.initiateWithdrawal(withdrawalData);
      console.log('App.tsx: Withdrawal result:', withdrawResult);

      // Add withdrawal transaction to history and set as currentTransaction
      const withdrawTransaction: Transaction = {
        id: withdrawResult.id,
        recipient: `Withdraw to ${bankDetails.bank_name}`,
        recipientId: 'withdrawal',
        amount: amount.toString(),
        currency: 'CBUSD',
        convertedAmount: (amount * 1600).toString(),
        recipientCurrency: 'NGN',
        status: withdrawResult.status as Transaction['status'],
        date: withdrawResult.created_at || new Date().toISOString(),
        timestamp: Date.now(),
        avatar: 'https://ui-avatars.com/api/?name=W&background=ef4444&color=fff',
        referenceNumber: withdrawResult.reference_id,
        exchangeRate: 1600,
        fee: withdrawResult.fee?.toString() || '0.00',
        totalPaid: withdrawResult.total?.toString() || amount.toString(),
        category: 'other',
        note: `Withdrawal to ${bankDetails.account_name || bankDetails.bank_name}`,
        type: 'withdrawal',
        flow_type: 'outflow'
      };
      setTransactions(prev => [withdrawTransaction, ...prev]);
      setCurrentTransaction(withdrawTransaction);
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
      navigateTo('success');
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      // Create failed transaction for UI
      const failedTransaction: Transaction = {
        id: `wit_${Date.now()}`,
        recipient: `Withdraw to ${bankDetails.bank_name}`,
        recipientId: 'withdrawal',
        amount: amount.toString(),
        currency: 'CBUSD',
        convertedAmount: (amount * 1600).toString(),
        recipientCurrency: 'NGN',
        status: 'failed',
        date: new Date().toISOString(),
        timestamp: Date.now(),
        avatar: 'https://ui-avatars.com/api/?name=W&background=ef4444&color=fff',
        referenceNumber: `WIT${Date.now()}`,
        exchangeRate: 1600,
        fee: '0.00',
        totalPaid: amount.toString(),
        category: 'other',
        note: error.message,
        type: 'withdrawal',
        flow_type: 'outflow'
      };
      setCurrentTransaction(failedTransaction);
      navigateTo('failure');
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
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        {/* Splash Screen */}
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
        
        {!showSplash && (
          <div className="min-h-screen bg-background relative">
            {/* Removed background blur elements for clean design */}
        
        {/* Responsive container with improved mobile handling */}
        <div className="relative z-10 w-full min-h-screen">
          {/* Mobile/Tablet Layout - Full width on mobile, responsive on larger screens */}
          <div className="2xl:hidden">
            <div className="w-full mx-auto xl:max-w-xl xl:mx-auto">
                          <div className="h-full">
                {currentScreen === 'login' && (
                  <ModernLoginScreen 
                    onLogin={handleLogin} 
                    onSwitchToSignup={() => navigateTo('signup')} 
                  />
                )}
                {currentScreen === 'signup' && (
                  <ModernSignupScreen 
                    onSignup={handleSignup} 
                    onSwitchToLogin={() => navigateTo('login')} 
                  />
                )}
                {currentScreen === 'home' && user && (
                  useModernDesign ? (
                    <ModernHomeDashboard 
                      user={user}
                      transactions={transactions}
                      recipients={recipients}
                      onSendMoney={() => navigateTo('recipients')}
                      onNavigate={navigateTo}
                      onRecipientSelect={handleQuickSend}
                      onUpdateUser={setUser}
                      setTransactions={setTransactions}
                      onAddRecipient={handleAddRecipient}
                      onRemoveRecipient={handleRemoveRecipient}
                    />
                  ) : (
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
                      onRemoveRecipient={handleRemoveRecipient}
                      onWithdraw={handleWithdraw}
                      onDeposit={handleDeposit}
                      onShowDepositModal={handleShowDepositModal}
                    />
                  )
                )}
                {currentScreen === 'recipients' && (
                  useModernDesign ? (
                    <ModernRecipientSelection
                      user={user}
                      onBack={() => navigateTo('home')}
                      onRecipientSelect={handleRecipientSelect}
                    />
                  ) : (
                    <RecipientSelection
                      user={user}
                      onBack={() => navigateTo('home')}
                      onRecipientSelect={handleRecipientSelect}
                    />
                  )
                )}
                {currentScreen === 'amount' && selectedRecipient && (
                  useModernDesign ? (
                    <ModernSendAmount
                      recipient={selectedRecipient}
                      type={selectedRecipient.currency === 'CBUSD' ? 'app_transfer' : 'bank_withdrawal'}
                      exchangeRates={exchangeRates}
                      onBack={() => navigateTo('recipients')}
                      onConfirm={handleAmountConfirm}
                      onError={handleTransactionError}
                      onNavigateToPin={navigateToPin}
                    />
                  ) : (
                    <SendAmount
                      recipient={selectedRecipient}
                      type={selectedRecipient.currency === 'CBUSD' ? 'app_transfer' : 'bank_withdrawal'}
                      exchangeRates={exchangeRates}
                      onBack={() => navigateTo('recipients')}
                      onConfirm={handleAmountConfirm}
                      onError={handleTransactionError}
                    />
                  )
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
                  useModernDesign ? (
                    <ModernProfileScreen
                      user={user}
                      onBack={() => navigateTo('home')}
                      onLogout={handleLogout}
                      onUpdateUser={setUser}
                      onNavigate={navigateTo}
                      onNavigateToPin={navigateToPin}
                    />
                  ) : (
                    <ProfileScreen
                      user={user}
                      onBack={() => navigateTo('home')}
                      onLogout={handleLogout}
                      onUpdateUser={setUser}
                    />
                  )
                )}
                {currentScreen === 'history' && (
                  useModernDesign ? (
                    <ModernTransactionHistory
                      transactions={transactions}
                      onBack={() => navigateTo('home')}
                      onViewReceipt={viewReceipt}
                    />
                  ) : (
                    <TransactionHistory
                      transactions={transactions}
                      onBack={() => navigateTo('home')}
                      onViewReceipt={viewReceipt}
                    />
                  )
                )}
                {currentScreen === 'receipt' && currentTransaction && (
                  <ReceiptScreen
                    transaction={currentTransaction}
                    user={user}
                    onBack={() => navigateTo('history')}
                  />
                )}
                {currentScreen === 'notifications' && (
                  <ModernNotificationScreen
                    onBack={() => navigateTo('home')}
                  />
                )}
                {currentScreen === 'analytics' && (
                  <ModernAnalyticsScreen
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
                {currentScreen === 'withdraw' && user && (
                  <ModernWithdrawScreen
                    userBalance={user.balance}
                    onBack={() => navigateTo('home')}
                    onWithdraw={async (amount, selectedAccount, pin, twoFactorCode) => {
                      try {
                        // Handle withdrawal logic here
                        const newTransaction = {
                          id: `wit_${Date.now()}`,
                          recipient: `${selectedAccount.bankName} - ${selectedAccount.accountNumber}`,
                          recipientId: 'withdrawal',
                          amount: amount.toString(),
                          currency: 'NGN',
                          convertedAmount: (amount / 1500).toString(), // Convert to CBUSD
                          recipientCurrency: 'CBUSD',
                          status: 'completed' as const,
                          date: new Date().toLocaleDateString(),
                          timestamp: Date.now(),
                          avatar: '🏦',
                          referenceNumber: `WIT${Date.now()}`,
                          exchangeRate: 1500,
                          fee: (amount * 0.004).toString(),
                          totalPaid: (amount + (amount * 0.004)).toString(),
                          type: 'withdrawal' as const,
                          flow_type: 'outflow' as const
                        };
                        setCurrentTransaction(newTransaction);
                        navigateTo('success');
                      } catch (error) {
                        console.error('Withdrawal failed:', error);
                        const failedTransaction = {
                          id: `wit_${Date.now()}`,
                          recipient: `${selectedAccount.bankName} - ${selectedAccount.accountNumber}`,
                          recipientId: 'withdrawal',
                          amount: amount.toString(),
                          currency: 'NGN',
                          convertedAmount: (amount / 1500).toString(),
                          recipientCurrency: 'CBUSD',
                          status: 'failed' as const,
                          date: new Date().toLocaleDateString(),
                          timestamp: Date.now(),
                          avatar: '🏦',
                          referenceNumber: `WIT${Date.now()}`,
                          exchangeRate: 1500,
                          fee: (amount * 0.004).toString(),
                          totalPaid: (amount + (amount * 0.004)).toString(),
                          type: 'withdrawal' as const,
                          flow_type: 'outflow' as const
                        };
                        setCurrentTransaction(failedTransaction);
                        navigateTo('failure');
                      }
                    }}
                    onNavigateToPin={navigateToPin}
                    onNavigate={navigateTo}
                  />
                )}
                {currentScreen === 'bank-accounts' && user && (
                  <ModernBankAccounts
                    userId={user.id}
                    onBack={() => navigateTo('home')}
                  />
                )}
                {currentScreen === 'add-money' && user && (
                  <ModernAddMoneyScreen
                    user={user}
                    onBack={() => navigateTo('home')}
                    onComplete={async (amount, currency, method) => {
                      try {
                        // Call the actual deposit API to get instructions
                        const depositResult = await TransactionService.initiateDeposit({
                          amount,
                          currency
                        });
                        
                        if (depositResult.success) {
                          // For now, simulate successful deposit since this API only gives instructions
                          // In a real app, there would be a webhook or confirmation API
                          
                          // Refresh balance after successful deposit
                          try {
                            const balanceData = await dashboardService.getWalletBalance();
                            const updatedUser = { ...user, balance: balanceData || user.balance };
                            setUser(updatedUser);
                            localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
                          } catch (balanceError) {
                            console.error('Failed to refresh balance:', balanceError);
                          }
                          
                          // Add deposit transaction to history
                          const depositTransaction = {
                            id: `dep_${Date.now()}`,
                            recipient: `Deposit from ${currency}`,
                            recipientId: 'deposit',
                            amount: amount.toString(),
                            currency: currency,
                            convertedAmount: amount.toString(),
                            recipientCurrency: 'CBUSD',
                            status: 'completed' as const,
                            date: new Date().toISOString(),
                            timestamp: Date.now(),
                            avatar: '💰',
                            referenceNumber: depositResult.data?.reference_id || depositResult.data?.id || `DEP${Date.now()}`,
                            exchangeRate: 1,
                            fee: '0',
                            totalPaid: amount.toString(),
                            type: 'deposit' as const,
                            flow_type: 'inflow' as const
                          };
                          
                          setTransactions(prev => [depositTransaction, ...prev]);
                          setCurrentTransaction(depositTransaction);
                          
                          // Add notification
                          NotificationService.addDepositNotification(
                            amount.toString(),
                            'CBUSD',
                            currency
                          );
                          
                          navigateTo('success');
                        } else {
                          throw new Error(depositResult.message || 'Deposit failed');
                        }
                      } catch (error: any) {
                        console.error('Deposit failed:', error);
                        
                        // Create failed transaction for UI
                        const failedTransaction = {
                          id: `dep_${Date.now()}`,
                          recipient: `Deposit from ${currency}`,
                          recipientId: 'deposit',
                          amount: amount.toString(),
                          currency: currency,
                          convertedAmount: amount.toString(),
                          recipientCurrency: 'CBUSD',
                          status: 'failed' as const,
                          date: new Date().toISOString(),
                          timestamp: Date.now(),
                          avatar: '💰',
                          referenceNumber: `DEP${Date.now()}`,
                          exchangeRate: 1,
                          fee: '0',
                          totalPaid: amount.toString(),
                          type: 'deposit' as const,
                          flow_type: 'inflow' as const,
                          note: error.message
                        };
                        setCurrentTransaction(failedTransaction);
                        navigateTo('failure');
                      }
                    }}
                  />
                )}
                {currentScreen === 'pin' && pinScreenConfig && (
                  <ModernPinScreen
                    onBack={() => {
                      setPinScreenConfig(null);
                      navigateTo(pinScreenConfig.returnScreen || 'home');
                    }}
                    onSuccess={(pin) => {
                      const config = pinScreenConfig;
                      setPinScreenConfig(null);
                      config.onSuccess?.(pin);
                      navigateTo(config.returnScreen || 'home');
                    }}
                    title={pinScreenConfig.title}
                    subtitle={pinScreenConfig.subtitle}
                    purpose={pinScreenConfig.purpose}
                    requireCurrentPin={pinScreenConfig.requireCurrentPin}
                    onCurrentPinVerified={pinScreenConfig.onCurrentPinVerified}
                  />
                )}
                {currentScreen === 'scan' && (
                  <ModernScanScreen
                    onBack={() => navigateTo('home')}
                    user={user}
                  />
                )}
                {currentScreen === 'rewards' && (
                  <ModernRewardsScreen
                    onBack={() => navigateTo('home')}
                    user={user}
                  />
                )}
                {currentScreen === 'linked-accounts' && user && (
                  <ModernBankAccounts
                    userId={user.id}
                    onBack={() => navigateTo('home')}
                  />
                )}
              </div>
              
              {/* Modern Footer - Show on most screens except login/signup */}
              {user && !['login', 'signup', 'pin'].includes(currentScreen) && (
                <ModernFooter
                  currentScreen={currentScreen}
                  onNavigate={navigateTo}
                />
              )}
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
              <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">SecureRemit</h1>
                    <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name.split(' ')[0]}</p>
                  </div>
                  
                  {/* Desktop Balance Display */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Balance</p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                      ${(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      ₦{((user.balance || 0) * 1532.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Desktop Navigation */}
                  <nav className="space-y-2">
                    <button
                      onClick={() => navigateTo('home')}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        currentScreen === 'home' 
                          ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigateTo('recipients')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Send Money
                    </button>
                    <button
                      onClick={() => navigateTo('history')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Transaction History
                    </button>
                    <button
                      onClick={() => navigateTo('enhanced-analytics')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => navigateTo('analytics')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Exchange Rates
                    </button>
                    <button
                      onClick={() => navigateTo('simulation')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Bank Simulation
                    </button>
                    <button
                      onClick={() => navigateTo('developer-examples')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Dev Examples
                    </button>
                    <button
                      onClick={() => navigateTo('notifications')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Notifications
                    </button>
                    <button
                      onClick={() => navigateTo('profile')}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
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
                    <ModernLoginScreen 
                      onLogin={handleLogin} 
                      onSwitchToSignup={() => navigateTo('signup')} 
                    />
                  </div>
                </div>
              )}
              {currentScreen === 'signup' && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-lg">
                    <ModernSignupScreen 
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
                  onRemoveRecipient={handleRemoveRecipient}
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
                      user={user}
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
                <ModernNotificationScreen
                  onBack={() => navigateTo('home')}
                />
              )}
              {currentScreen === 'analytics' && (
                <ModernAnalyticsScreen
                  onBack={() => navigateTo('home')}
                />
              )}
              {currentScreen === 'enhanced-analytics' && (
                <EnhancedAnalyticsScreen
                  onBack={() => navigateTo('home')}
                />
              )}
              {currentScreen === 'simulation' && (
                <BankToSimulation
                  onBack={() => navigateTo('home')}
                />
              )}
              {currentScreen === 'developer-examples' && (
                <DeveloperExamples
                  onBack={() => navigateTo('home')}
                />
              )}
              {currentScreen === 'admin' && (
                <AdminDashboard
                  onLogout={handleLogout}
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
        )}
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

