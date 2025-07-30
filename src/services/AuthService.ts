import { api } from './api';
import type { ApiResponse } from './api';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  phone_number: string;
  country_code: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthUser {
  id: string;
  phone_number: string;
  country_code: string;
  email: string;
  first_name: string;
  last_name: string;
  kyc_status: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  token: string;
  refresh_token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id: string;
  phone_number: string;
  requires_verification: boolean;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refresh_token: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.data.token);
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  /**
   * Verify phone number after registration
   */
  async verifyPhone(phone_number: string, country_code: string, verification_code: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/verify-phone', {
        phone_number,
        country_code,
        verification_code
      });
      
      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.data.token);
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }
        
        // Store user data (we'll need to get it from /users/me endpoint)
        this.getCurrentUser();
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw new Error(error.response?.data?.message || 'Phone verification failed');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await api.get<ApiResponse<AuthUser>>('/users/me');
      
      if (response.data.success) {
        // Store updated user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error('Failed to get user profile');
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      if (response.data.success) {
        // Update stored tokens
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear tokens if refresh fails
      this.logout();
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to blacklist token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): AuthUser | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Pick<AuthUser, 'email' | 'first_name' | 'last_name'>>): Promise<AuthUser> {
    try {
      const response = await api.put<ApiResponse<AuthUser>>('/users/update-profile', updates);
      
      if (response.data.success) {
        // Store updated user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error('Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
}

export const authService = new AuthService();
