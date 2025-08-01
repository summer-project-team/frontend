import { api } from './api';
import type { ApiResponse } from './api';

// Backend API response types
interface DashboardApiResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      country_code: string;
      kyc_status: string;
    };
    wallet: {
      id: string;
      wallet_address: string;
      balances: {
        ngn: number;
        gbp: number;
        usd: number;
        cbusd: number;
      };
    };
    total_balance_usd: string;
    transaction_stats: {
      sent: number;
      received: number;
      failed: number;
      total: number;
    };
    saved_recipients_count: number;
    recent_transactions: Array<{
      id: string;
      transaction_type: string;
      amount: string;
      currency_from: string;
      currency_to: string;
      status: string;
      created_at: string;
    }>;
    system_status: {
      status: string;
      last_updated: string;
    };
  };
}

interface WalletApiResponse {
  success: boolean;
  wallet: {
    id: string;
    wallet_address: string;
    balances: {
      ngn: string;
      gbp: string;
      usd: string;
      cbusd: string;
    };
    created_at: string;
  };
}

// Frontend types that match App.tsx
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number; // CBUSD balance only
  currency: string;
  phoneNumber: string;
  verificationLevel: 'basic' | 'verified' | 'premium';
}

interface Transaction {
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
}

class DashboardService {
  /**
   * Get user dashboard data with real CBUSD balance
   */
  async getDashboardData(): Promise<{ user: User; transactions: Transaction[] }> {
    try {
      const response = await api.get<DashboardApiResponse>('/dashboard');
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Map backend user data to frontend User interface
        const user: User = {
          id: data.user.id,
          name: `${data.user.first_name} ${data.user.last_name}`,
          email: data.user.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.first_name + ' ' + data.user.last_name)}&background=6366f1&color=fff`,
          balance: data.wallet.balances.cbusd, // Only CBUSD balance as specified
          currency: 'CBUSD',
          phoneNumber: data.user.phone_number,
          verificationLevel: data.user.kyc_status === 'verified' ? 'verified' : 'basic'
        };

        // Map backend transactions to frontend Transaction interface
        const transactions: Transaction[] = data.recent_transactions.map(tx => {
          // Generate a more meaningful recipient name based on transaction type
          let recipient = 'Transaction';
          if (tx.transaction_type === 'mint') {
            recipient = `Deposit from ${tx.currency_from}`;
          } else if (tx.transaction_type === 'burn') {
            recipient = `Withdraw to ${tx.currency_to}`;
          } else if (tx.transaction_type === 'app_transfer') {
            recipient = 'App Transfer';
          }

          return {
            id: tx.id,
            recipient,
            recipientId: tx.id,
            amount: tx.amount,
            currency: tx.currency_from,
            convertedAmount: tx.amount, // Same as amount for now
            recipientCurrency: tx.currency_to,
            status: this.mapTransactionStatus(tx.status),
            date: tx.created_at,
            timestamp: new Date(tx.created_at).getTime(),
            avatar: 'https://ui-avatars.com/api/?name=T&background=6366f1&color=fff',
            referenceNumber: tx.id.substring(0, 8).toUpperCase(),
            exchangeRate: 1, // Default exchange rate
            fee: '0.00', // Backend doesn't provide fee info
            totalPaid: tx.amount,
            category: this.mapTransactionCategory(tx.transaction_type)
          };
        });

        return { user, transactions };
      }
      
      throw new Error('Failed to fetch dashboard data');
    } catch (error: any) {
      console.error('Dashboard service error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }

  /**
   * Get wallet balance (CBUSD only)
   */
  async getWalletBalance(): Promise<number> {
    try {
      console.log('DashboardService: Fetching wallet balance...');
      const response = await api.get<WalletApiResponse>('/users/wallet');
      console.log('DashboardService: Wallet API response:', response.data);
      
      if (response.data.success) {
        const balance = parseFloat(response.data.wallet.balances.cbusd) || 0;
        console.log('DashboardService: Parsed balance:', balance);
        return balance;
      }
      
      throw new Error('Failed to fetch wallet balance');
    } catch (error: any) {
      console.error('DashboardService: Wallet balance error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet balance');
    }
  }

  /**
   * Map backend transaction status to frontend status
   */
  private mapTransactionStatus(backendStatus: string): Transaction['status'] {
    switch (backendStatus.toLowerCase()) {
      case 'completed':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      default:
        return 'completed';
    }
  }

  /**
   * Map backend transaction type to frontend category
   */
  private mapTransactionCategory(transactionType: string): Transaction['category'] {
    switch (transactionType.toLowerCase()) {
      case 'mint':
      case 'burn':
        return 'other';
      case 'app_transfer':
        return 'family_friends';
      case 'bank_transfer':
        return 'business';
      default:
        return 'other';
    }
  }

  /**
   * Refresh user dashboard data (useful after transactions)
   */
  async refreshDashboard(): Promise<{ user: User; transactions: Transaction[] }> {
    return this.getDashboardData();
  }
}

export const dashboardService = new DashboardService();
export type { User, Transaction };
