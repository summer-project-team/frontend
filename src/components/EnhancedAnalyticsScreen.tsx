/**
 * Enhanced Analytics Screen with Real Backend Integration
 * Replaces mock data with actual API calls
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Activity, PieChart, BarChart3, Calendar, Download, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AnalyticsService, type SpendingPattern, type TransactionTrend, type AnalyticsSummary } from '../services/AnalyticsService';
import { toast } from 'sonner';

interface EnhancedAnalyticsScreenProps {
  onBack: () => void;
}

export function EnhancedAnalyticsScreen({ onBack }: EnhancedAnalyticsScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [transactionTrends, setTransactionTrends] = useState<TransactionTrend[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [monthlyComparison, setMonthlyComparison] = useState<any>(null);
  const [currencyDistribution, setCurrencyDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [patterns, trends, summary, comparison, distribution] = await Promise.all([
        AnalyticsService.getSpendingPatterns(selectedPeriod),
        AnalyticsService.getTransactionTrends(selectedPeriod),
        AnalyticsService.getAnalyticsSummary(selectedPeriod),
        AnalyticsService.getMonthlyComparison(),
        AnalyticsService.getCurrencyDistribution()
      ]);

      setSpendingPatterns(patterns);
      setTransactionTrends(trends);
      setAnalyticsSummary(summary);
      setMonthlyComparison(comparison);
      setCurrencyDistribution(distribution);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentageChange = () => {
    if (!monthlyComparison) return 0;
    const { currentMonth, previousMonth } = monthlyComparison;
    if (previousMonth === 0) return 100;
    return ((currentMonth - previousMonth) / previousMonth) * 100;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const exportData = () => {
    const data = {
      period: selectedPeriod,
      summary: analyticsSummary,
      spendingPatterns,
      transactionTrends,
      monthlyComparison,
      currencyDistribution,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crossbridge-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully!');
  };

  if (isLoading) {
    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 pt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </Button>
          
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Analytics</h1>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAnalyticsData}
              className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportData}
              className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Transaction Analytics
          </h2>
          <Select value={selectedPeriod} onValueChange={(value: '7d' | '30d' | '90d') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        {analyticsSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <DollarSign size={16} className="mr-2" />
                  Total Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(analyticsSummary.totalSent)}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  {getPercentageChange() >= 0 ? (
                    <TrendingUp size={12} className="text-green-500 mr-1" />
                  ) : (
                    <TrendingDown size={12} className="text-red-500 mr-1" />
                  )}
                  <span className={getPercentageChange() >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(getPercentageChange()).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <Activity size={16} className="mr-2" />
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {analyticsSummary.transactionCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Avg: {formatCurrency(analyticsSummary.averageTransaction)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <Users size={16} className="mr-2" />
                  Top Destination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {analyticsSummary.topDestination}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <PieChart size={16} className="mr-2" />
                  Top Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {analyticsSummary.topCategory}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Spending Patterns */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-white">
              <PieChart size={20} className="mr-2" />
              Spending by Category
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Breakdown of your spending across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index % 4 === 0 ? 'bg-blue-500' :
                      index % 4 === 1 ? 'bg-green-500' :
                      index % 4 === 2 ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {pattern.category}
                    </span>
                    {getTrendIcon(pattern.trend)}
                  </div>
                  <div className="text-right">
                    <div className="text-gray-800 dark:text-white font-semibold">
                      {formatCurrency(pattern.amount)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {pattern.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Trends */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-white">
              <BarChart3 size={20} className="mr-2" />
              Transaction Trends
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Daily transaction volume and amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactionTrends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="text-gray-700 dark:text-gray-300">
                    {new Date(trend.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sent</div>
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(trend.sent)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Received</div>
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        {formatCurrency(trend.received)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                      <div className="text-gray-800 dark:text-white font-medium">
                        {trend.volume}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Currency Distribution */}
        {currencyDistribution.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800 dark:text-white">
                <Calendar size={20} className="mr-2" />
                Currency Distribution
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Transaction breakdown by currency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currencyDistribution.map((currency, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                      {currency.code}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currency.percentage}%
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(currency.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
