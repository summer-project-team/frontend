import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, RefreshCw, Sparkles, BarChart3, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ModernAnalyticsScreenProps {
  onBack: () => void;
}

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  changePercent: number;
  flag: string;
  name: string;
}

export function ModernAnalyticsScreen({ onBack }: ModernAnalyticsScreenProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    { currency: 'NGN', rate: 1532.50, change: +12.70, changePercent: +0.83, flag: '🇳🇬', name: 'Nigerian Naira' },
    { currency: 'GBP', rate: 0.79, change: -0.02, changePercent: -2.47, flag: '🇬🇧', name: 'British Pound' },
    { currency: 'EUR', rate: 0.92, change: +0.01, changePercent: +1.09, flag: '🇪🇺', name: 'Euro' },
    { currency: 'CAD', rate: 1.36, change: +0.03, changePercent: +2.21, flag: '🇨🇦', name: 'Canadian Dollar' },
    { currency: 'AUD', rate: 1.52, change: -0.01, changePercent: -0.66, flag: '🇦🇺', name: 'Australian Dollar' },
    { currency: 'JPY', rate: 149.80, change: +2.40, changePercent: +1.63, flag: '🇯🇵', name: 'Japanese Yen' },
  ]);

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshRates = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setExchangeRates(prev => 
        prev.map(rate => ({
          ...rate,
          rate: Math.max(0.01, rate.rate + (Math.random() - 0.5) * 10),
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 5
        }))
      );
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (rate: number, currency: string): string => {
    if (isNaN(rate) || !isFinite(rate)) {
      return '0.00';
    }
    return rate.toFixed(currency === 'JPY' ? 2 : 4);
  };

  const formatChange = (change: number): string => {
    if (isNaN(change) || !isFinite(change)) {
      return '0.00';
    }
    return change.toFixed(4);
  };

  const formatPercent = (percent: number): string => {
    if (isNaN(percent) || !isFinite(percent)) {
      return '0.00';
    }
    return percent.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 dark:bg-blue-900 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-100 dark:bg-purple-900 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100 dark:bg-indigo-900 rounded-full opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </Button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Exchange Rates</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRates}
            disabled={isRefreshing}
            className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw size={20} className={`text-gray-700 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Last Updated Banner */}
        <div className="mx-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-500 rounded-2xl p-4">
            <div className="flex items-center justify-center space-x-2">
              <Activity size={16} className="text-blue-600 dark:text-blue-400 animate-pulse" />
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Last updated: {formatTime(lastUpdated)}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Exchange Rates List */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 pt-24 space-y-4">
          {/* USD Base Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-800 flex items-center justify-center">
                  <span className="text-xl">🇺🇸</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">USD</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">United States Dollar</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Pegged Currency</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">$1.00</p>
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <div className="px-2 py-1 bg-green-100 dark:bg-green-800 rounded-lg">
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">BASE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Currencies */}
          {exchangeRates.map((rate, index) => (
            <div 
              key={rate.currency}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-500 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">{rate.flag}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{rate.currency}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rate.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      1 USD = {formatCurrency(rate.rate, rate.currency)} {rate.currency}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(rate.rate, rate.currency)}
                  </p>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                      rate.change >= 0 
                        ? 'bg-green-100 dark:bg-green-800' 
                        : 'bg-red-100 dark:bg-red-800'
                    }`}>
                      {rate.change >= 0 ? 
                        <TrendingUp size={12} className="text-green-600 dark:text-green-400" /> : 
                        <TrendingDown size={12} className="text-red-600 dark:text-red-400" />
                      }
                      <span className={`text-xs font-medium ${
                        rate.change >= 0 
                          ? 'text-green-700 dark:text-green-400' 
                          : 'text-red-700 dark:text-red-400'
                      }`}>
                        {rate.changePercent >= 0 ? '+' : ''}{formatPercent(rate.changePercent)}%
                      </span>
                    </div>
                  </div>
                  <p className={`text-xs mt-1 ${
                    rate.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {rate.change >= 0 ? '+' : ''}{formatChange(rate.change)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Market Trends Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center">
                <Sparkles size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Market Trends</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's performance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-500 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">🚀 Strongest Performer</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">CAD +{formatPercent(2.21)}%</p>
                  </div>
                  <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-500 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">📉 Weakest Performer</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">GBP -{formatPercent(2.47)}%</p>
                  </div>
                  <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-20 pointer-events-none">
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
}
