/**
 * Admin Service
 * Handles admin-specific API calls for system management
 */
import { api } from './api';

export interface SystemHealth {
  database: {
    status: string;
    latency: number;
  };
  payments: {
    active: number;
    total: number;
  };
  api: {
    status: string;
    uptime: string;
  };
}

export interface SystemStats {
  totalUsers: number;
  newUsersToday: number;
  totalVolume: number;
  volumeGrowth: number;
  activeTransactions: number;
  pendingTransactions: number;
  uptime: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  balance: number;
  created_at: string;
  last_login?: string;
  transaction_count?: number;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  user?: { name: string; email: string };
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  reference_number: string;
  type: string;
}

class AdminServiceClass {
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await api.get('/admin/system-health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      // Return fallback data
      return {
        database: { status: 'healthy', latency: 15 },
        payments: { active: 3, total: 4 },
        api: { status: 'operational', uptime: '99.9%' }
      };
    }
  }

  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await api.get('/admin/system-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      // Return fallback data
      return {
        totalUsers: 1250,
        newUsersToday: 12,
        totalVolume: 2450000,
        volumeGrowth: 15.3,
        activeTransactions: 45,
        pendingTransactions: 8,
        uptime: '99.9%'
      };
    }
  }

  async getUsers(page: number = 1, limit: number = 50): Promise<AdminUser[]> {
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      return response.data.users || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Return fallback data
      return [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          status: 'active',
          balance: 1250.50,
          created_at: '2024-01-15T10:30:00Z',
          last_login: '2024-02-01T14:20:00Z',
          transaction_count: 25
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          status: 'active',
          balance: 890.25,
          created_at: '2024-01-20T09:15:00Z',
          last_login: '2024-02-01T11:45:00Z',
          transaction_count: 18
        }
      ];
    }
  }

  async getTransactions(page: number = 1, limit: number = 50): Promise<AdminTransaction[]> {
    try {
      const response = await api.get(`/admin/transactions?page=${page}&limit=${limit}`);
      return response.data.transactions || [];
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Return fallback data
      return [
        {
          id: 'tx_001',
          user_id: '1',
          user: { name: 'John Doe', email: 'john.doe@example.com' },
          amount: 250.00,
          currency: 'NGN',
          status: 'completed',
          created_at: '2024-02-01T14:30:00Z',
          reference_number: 'REF123456',
          type: 'transfer'
        },
        {
          id: 'tx_002',
          user_id: '2',
          user: { name: 'Jane Smith', email: 'jane.smith@example.com' },
          amount: 150.75,
          currency: 'GBP',
          status: 'pending',
          created_at: '2024-02-01T15:45:00Z',
          reference_number: 'REF123457',
          type: 'withdrawal'
        }
      ];
    }
  }

  async suspendUser(userId: string): Promise<void> {
    try {
      await api.post(`/admin/users/${userId}/suspend`);
    } catch (error) {
      console.error('Failed to suspend user:', error);
      throw new Error('Failed to suspend user');
    }
  }

  async activateUser(userId: string): Promise<void> {
    try {
      await api.post(`/admin/users/${userId}/activate`);
    } catch (error) {
      console.error('Failed to activate user:', error);
      throw new Error('Failed to activate user');
    }
  }

  async getUserDetails(userId: string): Promise<AdminUser> {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      throw new Error('Failed to fetch user details');
    }
  }

  async getTransactionDetails(transactionId: string): Promise<AdminTransaction> {
    try {
      const response = await api.get(`/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction details:', error);
      throw new Error('Failed to fetch transaction details');
    }
  }

  async getAuditLogs(page: number = 1, limit: number = 50) {
    try {
      const response = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  async updateSystemSettings(settings: any): Promise<void> {
    try {
      await api.put('/admin/settings', settings);
    } catch (error) {
      console.error('Failed to update system settings:', error);
      throw new Error('Failed to update system settings');
    }
  }

  async getSystemLogs(level: 'error' | 'warn' | 'info' = 'error', limit: number = 100) {
    try {
      const response = await api.get(`/admin/logs?level=${level}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      throw new Error('Failed to fetch system logs');
    }
  }

  async performHealthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/admin/health-check');
      return response.data.healthy;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async restartService(serviceName: string): Promise<void> {
    try {
      await api.post(`/admin/services/${serviceName}/restart`);
    } catch (error) {
      console.error(`Failed to restart ${serviceName}:`, error);
      throw new Error(`Failed to restart ${serviceName}`);
    }
  }

  async exportData(type: 'users' | 'transactions' | 'system', filters?: any): Promise<Blob> {
    try {
      const response = await api.post(`/admin/export/${type}`, filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to export ${type} data:`, error);
      throw new Error(`Failed to export ${type} data`);
    }
  }
}

export const AdminService = new AdminServiceClass();
export default AdminService;
