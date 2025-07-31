import { Quote, QuoteRequest, RateLock, SendMoneyRequest, WithdrawRequest, 
         DepositRequest, Transaction, TransactionHistory, TransactionFilters } from '../types/transaction';
import { api } from './api';

export default class TransactionService {
  // Transaction Operations - Direct calls without quotes
  static async sendMoney(params: SendMoneyRequest): Promise<Transaction> {
    try {
      console.log('Sending money with params:', params);
      const response = await api.post('/transactions/send', params);
      return response.data.transaction;
    } catch (error) {
      console.error('Error sending money:', error);
      throw this.handleError(error);
    }
  }

  static async initiateWithdrawal(params: WithdrawRequest): Promise<Transaction> {
    try {
      console.log('Initiating withdrawal with params:', params);
      const response = await api.post('/transactions/app-to-bank', params);
      return response.data.transaction;
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      throw this.handleError(error);
    }
  }

  static async initiateDeposit(params: DepositRequest): Promise<{
    success: boolean;
    message: string;
    demo_notice?: string;
    deposit_instructions: {
      amount: number;
      currency: string;
      bank_account: string;
      reference_code: string;
      bank_name: string;
      instructions: string;
      expires_at: string;
    };
  }> {
    try {
      const response = await api.post('/transactions/bank-to-app', params);
      return response.data;
    } catch (error) {
      console.error('Error initiating deposit:', error);
      throw this.handleError(error);
    }
  }

  // Transaction Management
  static async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data.transaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw this.handleError(error);
    }
  }

  static async getTransactionHistory(filters?: TransactionFilters): Promise<TransactionHistory> {
    try {
      const response = await api.get('/transactions/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw this.handleError(error);
    }
  }

  static async cancelTransaction(id: string): Promise<Transaction> {
    try {
      const response = await api.post(`/transactions/${id}/cancel`);
      return response.data.transaction;
    } catch (error) {
      console.error('Error canceling transaction:', error);
      throw this.handleError(error);
    }
  }

  static async retryTransaction(id: string): Promise<Transaction> {
    try {
      const response = await api.post(`/transactions/${id}/retry`);
      return response.data.transaction;
    } catch (error) {
      console.error('Error retrying transaction:', error);
      throw this.handleError(error);
    }
  }

  // Transaction Status Monitoring
  static async getTransactionStatus(id: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    lastUpdate: string;
    failureReason?: string;
    progressSteps: {
      step: string;
      status: 'pending' | 'completed' | 'failed';
      timestamp: string;
    }[];
  }> {
    try {
      const response = await api.get(`/transactions/${id}/status`);
      return response.data.status;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw this.handleError(error);
    }
  }

  static async setupStatusWebhook(id: string, webhookUrl: string): Promise<void> {
    try {
      await api.post(`/transactions/${id}/webhook`, { webhook_url: webhookUrl });
    } catch (error) {
      console.error('Error setting up webhook:', error);
      throw this.handleError(error);
    }
  }

  // Error Handling
  private static handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.message || 'An error occurred';
      const code = error.response.status;
      const errorCode = error.response.data.error_code;
      
      // Handle specific transaction error codes
      if (errorCode) {
        switch (errorCode) {
          case 'INSUFFICIENT_BALANCE':
            return new Error('Insufficient balance to complete this transaction');
          case 'INVALID_BANK_DETAILS':
            return new Error('Invalid bank account details. Please verify and try again');
          case 'RATE_EXPIRED':
            return new Error('Exchange rate has expired. Please get a new quote');
          case 'DAILY_LIMIT_EXCEEDED':
            return new Error('Daily transaction limit exceeded');
          case 'ACCOUNT_RESTRICTED':
            return new Error('Account is temporarily restricted. Please contact support');
          case 'BANK_OFFLINE':
            return new Error('Bank service is temporarily unavailable. Please try again later');
        }
      }
      
      // Handle HTTP status codes
      switch (code) {
        case 400:
          return new Error(`Invalid request: ${message}`);
        case 401:
          return new Error('Authentication required');
        case 403:
          return new Error('Not authorized to perform this action');
        case 404:
          return new Error('Resource not found');
        case 429:
          return new Error('Too many requests. Please try again later');
        case 500:
          return new Error('Server error. Our team has been notified');
        case 503:
          return new Error('Service temporarily unavailable. Please try again later');
        default:
          return new Error(message);
      }
    }
    
    if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection');
    }
    
    // Other errors
    return new Error('An unexpected error occurred');
  }
}
