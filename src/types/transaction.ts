// Types for API Requests and Responses
export interface QuoteRequest {
  amount: number;
  currency_from: string;
  currency_to: string;
  payment_method?: string;
  recipient_phone?: string;
  recipient_country_code?: string;
}

export interface Quote {
  id: string;
  exchange_rate: number;
  amount: number;
  converted_amount: number;
  fee: number;
  total: number;
  currency_from: string;
  currency_to: string;
  valid_until: string;
  can_lock_rate: boolean;
}

export interface RateLock {
  id: string;
  quote_id: string;
  exchange_rate: number;
  expires_at: string;
}

export interface SendMoneyRequest {
  recipient_phone: string;
  recipient_country_code: string;
  amount: number;
  narration?: string;
  two_factor_code?: string;
  rate_lock_id?: string;
  transaction_pin?: string;
}

export interface WithdrawRequest {
  amount: number;
  currency: string;
  bank_account_number: string;  // Fixed: backend expects this field name
  bank_name: string;           // Added: required by backend
  account_holder_name: string; // Added: required by backend  
  two_factor_code?: string;    // Added: for high-value transfers
  transaction_pin?: string;    // Added: for PIN authentication
}

export interface DepositRequest {
  currency: string;
  amount: number;
  payment_method?: string;
}

export interface Transaction {
  id: string;
  type: 'app_transfer' | 'bank_withdrawal' | 'bank_deposit';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency_from: string;
  currency_to: string;
  exchange_rate: number;
  fee: number;
  total: number;
  recipient?: {
    phone?: string;
    bank_code?: string;
    account_number?: string;
  };
  created_at: string;
  completed_at?: string;
  reference_id: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
}
