import { api } from './api';
import type { ApiResponse } from './api';

// Types for banking
export interface BankAccount {
  id: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_type: 'savings' | 'checking' | 'current';
  currency: 'NGN' | 'GBP' | 'USD';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkAccountRequest {
  account_number: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
  account_type: 'savings' | 'checking' | 'current';
  currency: 'NGN' | 'GBP' | 'USD';
  // Note: user_id is automatically extracted from JWT token on backend
}

export interface LinkAccountResponse {
  success: boolean;
  message: string;
  account: BankAccount;
}

export interface GetAccountsResponse {
  success: boolean;
  accounts: BankAccount[];
}

export class BankingService {
  /**
   * Link a new bank account
   */
  async linkAccount(accountData: LinkAccountRequest): Promise<BankAccount> {
    try {
      console.log('BankingService: Linking account with data:', accountData);
      const response = await api.post<LinkAccountResponse>('/banking/link-account', accountData);
      
      if (response.data.success) {
        console.log('BankingService: Account linked successfully:', response.data.account);
        return response.data.account;
      }
      
      throw new Error(response.data.message || 'Failed to link account');
    } catch (error: any) {
      console.error('BankingService: Link account error:', error);
      throw new Error(error.response?.data?.message || 'Failed to link bank account');
    }
  }

  /**
   * Get user's linked bank accounts
   */
  async getAccounts(): Promise<BankAccount[]> {
    try {
      console.log('BankingService: Fetching bank accounts...');
      const response = await api.get<GetAccountsResponse>('/banking/accounts');
      
      if (response.data.success) {
        console.log('BankingService: Accounts fetched successfully:', response.data.accounts);
        return response.data.accounts;
      }
      
      throw new Error('Failed to fetch accounts');
    } catch (error: any) {
      console.error('BankingService: Get accounts error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch bank accounts');
    }
  }

  /**
   * Remove a linked bank account
   */
  async removeAccount(accountId: string): Promise<void> {
    try {
      console.log('BankingService: Removing account:', accountId);
      const response = await api.delete<ApiResponse<null>>(`/banking/accounts/${accountId}`);
      
      if (response.data.success) {
        console.log('BankingService: Account removed successfully');
        return;
      }
      
      throw new Error('Failed to remove account');
    } catch (error: any) {
      console.error('BankingService: Remove account error:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove bank account');
    }
  }

  /**
   * Format account number for display (mask middle digits)
   */
  formatAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber;
    const first = accountNumber.slice(0, 2);
    const last = accountNumber.slice(-2);
    const middle = '•'.repeat(accountNumber.length - 4);
    return `${first}${middle}${last}`;
  }

  /**
   * Get bank name from bank code (Nigerian banks)
   */
  getBankName(bankCode: string): string {
    const banks: { [key: string]: string } = {
      '044': 'Access Bank',
      '014': 'Afribank Nigeria Plc',
      '023': 'Citibank Nigeria Limited',
      '063': 'Diamond Bank',
      '011': 'First Bank of Nigeria',
      '214': 'First City Monument Bank',
      '070': 'Fidelity Bank',
      '103': 'Globus Bank',
      '058': 'Guaranty Trust Bank',
      '030': 'Heritage Bank',
      '301': 'Jaiz Bank',
      '082': 'Keystone Bank',
      '090': 'MainStreet Bank',
      '101': 'Polaris Bank',
      '076': 'Skye Bank',
      '221': 'Stanbic IBTC Bank',
      '068': 'Standard Chartered Bank',
      '232': 'Sterling Bank',
      '032': 'Union Bank of Nigeria',
      '033': 'United Bank for Africa',
      '215': 'Unity Bank',
      '035': 'Wema Bank',
      '057': 'Zenith Bank',
    };
    
    return banks[bankCode] || 'Unknown Bank';
  }
}

export const bankingService = new BankingService();
export default bankingService;
