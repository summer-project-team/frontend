/**
 * Analytics Service
 * Integrates with backend analytics APIs
 */
import { api } from './api';

export interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TransactionTrend {
  date: string;
  sent: number;
  received: number;
  volume: number;
}

export interface AnalyticsSummary {
  totalSent: number;
  totalReceived: number;
  averageTransaction: number;
  transactionCount: number;
  topDestination: string;
  topCategory: string;
}

export interface CBUSDFlowsSummary {
  total_inflow: number;
  total_outflow: number;
  net_flow: number;
  inflow_count: number;
  outflow_count: number;
  total_transactions: number;
}

export interface CBUSDFlowsResponse {
  period: string;
  days: number;
  summary: CBUSDFlowsSummary;
  circulation: {
    total_supply: number;
    holders_count: number;
    avg_balance: number;
    max_balance: number;
  };
  velocity_metrics: {
    velocity: number;
    period_days: number;
  };
  reserve_metrics: {
    total_backing_value: number;
    reserve_ratio: number;
    backing_currencies: any[];
  };
  health_indicators: {
    circulation_growth_rate: number;
    velocity: number;
    reserve_ratio: number;
    backing_diversity: number;
    flow_stability: number;
  };
}

class AnalyticsServiceClass {
  async getSpendingPatterns(period: '7d' | '30d' | '90d' = '30d'): Promise<SpendingPattern[]> {
    try {
      const response = await api.get(`/analytics/spending-patterns?period=${period}`);
      return response.data.patterns || [];
    } catch (error) {
      console.error('Failed to fetch spending patterns:', error);
      return this.getFallbackSpendingPatterns();
    }
  }

  async getTransactionTrends(period: '7d' | '30d' | '90d' = '30d'): Promise<TransactionTrend[]> {
    try {
      const response = await api.get(`/analytics/transaction-trends?period=${period}`);
      return response.data.trends || [];
    } catch (error) {
      console.error('Failed to fetch transaction trends:', error);
      return this.getFallbackTransactionTrends();
    }
  }

  async getAnalyticsSummary(period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsSummary> {
    try {
      const response = await api.get(`/analytics/summary?period=${period}`);
      return response.data.summary;
    } catch (error) {
      console.error('Failed to fetch analytics summary:', error);
      return this.getFallbackSummary();
    }
  }

  async getMonthlyComparison() {
    try {
      const response = await api.get('/analytics/monthly-comparison');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch monthly comparison:', error);
      return { currentMonth: 0, previousMonth: 0, change: 0 };
    }
  }

  async getCurrencyDistribution() {
    try {
      const response = await api.get('/analytics/currency-distribution');
      return response.data.distribution || [];
    } catch (error) {
      console.error('Failed to fetch currency distribution:', error);
      return [];
    }
  }

  async getCBUSDFlows(period: '7d' | '30d' | '90d' = '30d'): Promise<CBUSDFlowsResponse | null> {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const response = await api.get(`/analytics/cbusd-flows?days=${days}&period=daily`);
      
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch CBUSD flows:', error);
      return null;
    }
  }

  // Fallback data for offline/error scenarios
  private getFallbackSpendingPatterns(): SpendingPattern[] {
    return [
      { category: 'Family & Friends', amount: 1250, percentage: 35, trend: 'stable' },
      { category: 'Business', amount: 900, percentage: 25, trend: 'up' },
      { category: 'Bills & Utilities', amount: 720, percentage: 20, trend: 'down' },
      { category: 'Shopping', amount: 540, percentage: 15, trend: 'stable' },
      { category: 'Other', amount: 180, percentage: 5, trend: 'stable' }
    ];
  }

  private getFallbackTransactionTrends(): TransactionTrend[] {
    const now = new Date();
    const trends: TransactionTrend[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        sent: Math.floor(Math.random() * 1000) + 500,
        received: Math.floor(Math.random() * 800) + 300,
        volume: Math.floor(Math.random() * 5) + 3
      });
    }
    
    return trends;
  }

  private getFallbackSummary(): AnalyticsSummary {
    return {
      totalSent: 3590,
      totalReceived: 2140,
      averageTransaction: 285,
      transactionCount: 23,
      topDestination: 'United Kingdom',
      topCategory: 'Family & Friends'
    };
  }
}

export const AnalyticsService = new AnalyticsServiceClass();
export default AnalyticsService;
