import { api } from './api';

// Add this to your user service or create a new file
export class UserService {
  /**
   * Delete user account (soft delete)
   */
  static async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if account can be deleted
   */
  static async canDeleteAccount(): Promise<{
    canDelete: boolean;
    reasons?: string[];
  }> {
    try {
      // Check wallet balance
      const walletResponse = await api.get('/users/wallet');
      const balance = walletResponse.data.cbusd_balance || 0;
      
      // Check pending transactions
      const transactionsResponse = await api.get('/transactions');
      const pendingTransactions = transactionsResponse.data.transactions?.filter(
        (tx: any) => tx.status === 'pending' || tx.status === 'processing'
      ) || [];
      
      const reasons = [];
      
      if (balance > 0) {
        reasons.push('You have remaining balance. Please withdraw all funds first.');
      }
      
      if (pendingTransactions.length > 0) {
        reasons.push('You have pending transactions. Please wait for them to complete.');
      }
      
      return {
        canDelete: reasons.length === 0,
        reasons: reasons.length > 0 ? reasons : undefined
      };
    } catch (error) {
      console.error('Error checking delete eligibility:', error);
      throw error;
    }
  }

  /**
   * Get PIN status
   */
  static async getPinStatus(): Promise<{ pinEnabled: boolean }> {
    try {
      const response = await api.get('/users/pin/status');
      return response.data;
    } catch (error) {
      console.error('Error getting PIN status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Setup transaction PIN
   */
  static async setupTransactionPin(pin: string, confirmPin: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/users/pin/setup', { pin, confirmPin });
      return response.data;
    } catch (error) {
      console.error('Error setting up PIN:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify transaction PIN
   */
  static async verifyTransactionPin(pin: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/users/pin/verify', { pin });
      return response.data;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change transaction PIN
   */
  static async changeTransactionPin(
    currentPin: string, 
    newPin: string, 
    confirmNewPin: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/users/pin/change', {
        currentPin,
        newPin,
        confirmNewPin
      });
      return response.data;
    } catch (error) {
      console.error('Error changing PIN:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Disable transaction PIN
   */
  static async disableTransactionPin(currentPin: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete('/users/pin', {
        data: { currentPin }
      });
      return response.data;
    } catch (error) {
      console.error('Error disabling PIN:', error);
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('An unexpected error occurred');
  }
}
