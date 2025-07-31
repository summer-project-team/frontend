import api from './api';

export interface PinStatus {
  pinEnabled: boolean;
}

export interface SetupPinRequest {
  pin: string;
  confirmPin: string;
}

export interface VerifyPinRequest {
  pin: string;
}

export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
  confirmNewPin: string;
}

export interface DisablePinRequest {
  currentPin: string;
}

export default class PinService {
  // Get PIN status
  static async getPinStatus(): Promise<PinStatus> {
    try {
      const response = await api.get('/users/pin/status');
      return response.data;
    } catch (error) {
      console.error('Error getting PIN status:', error);
      throw this.handleError(error);
    }
  }

  // Setup transaction PIN
  static async setupPin(params: SetupPinRequest): Promise<void> {
    try {
      await api.post('/users/pin/setup', params);
    } catch (error) {
      console.error('Error setting up PIN:', error);
      throw this.handleError(error);
    }
  }

  // Verify transaction PIN
  static async verifyPin(params: VerifyPinRequest): Promise<void> {
    try {
      await api.post('/users/pin/verify', params);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw this.handleError(error);
    }
  }

  // Change transaction PIN
  static async changePin(params: ChangePinRequest): Promise<void> {
    try {
      await api.put('/users/pin/change', params);
    } catch (error) {
      console.error('Error changing PIN:', error);
      throw this.handleError(error);
    }
  }

  // Disable transaction PIN
  static async disablePin(params: DisablePinRequest): Promise<void> {
    try {
      await api.delete('/users/pin', { data: params });
    } catch (error) {
      console.error('Error disabling PIN:', error);
      throw this.handleError(error);
    }
  }

  // Error handler
  private static handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }
}
