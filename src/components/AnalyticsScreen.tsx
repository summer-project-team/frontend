import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AnalyticsScreenProps {
  onBack: () => void;
}

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  changePercent: number;
  flag: string;
}

export function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    { currency: 'NGN', rate: 1532.50, change: +12.70, changePercent: +0.83, flag: '🇳🇬' },
    { currency: 'GBP', rate: 0.79, change: -0.02, changePercent: -2.47, flag: '🇬🇧' },
    { currency: 'EUR', rate: 0.92, change: +0.01, changePercent: +1.09, flag: '🇪🇺' },
    { currency: 'CAD', rate: 1.36, change: +0.03, changePercent: +2.21, flag: '🇨🇦' },
    { currency: 'AUD', rate: 1.52, change: -0.01, changePercent: -0.66, flag: '🇦🇺' },
    { currency: 'JPY', rate: 149.80, change: +2.40, changePercent: +1.63, flag: '🇯🇵' },
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
          rate: rate.rate + (Math.random() - 0.5) * 10,
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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 backdrop-blur-lg bg-white/20 dark:bg-black/20 border-b border-gray-200/30 dark:border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/20 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-gray-800 dark:text-white">Exchange Rates</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshRates}
          disabled={isRefreshing}
          className="backdrop-blur-md bg-white/20 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
        >
          <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* Last Updated */}
      <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-200/30 dark:border-blue-500/30">
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
          Last updated: {formatTime(lastUpdated)}
        </p>
      </div>

      {/* Exchange Rates List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
        {/* USD Base Card */}
        <Card className="backdrop-blur-md bg-white/30 dark:bg-black/30 border-gray-200/30 dark:border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              🇺🇸 <span>USD (Pegged Currency)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">$1.00</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">United States Dollar</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">Base</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Currencies */}
        {exchangeRates.map((rate) => (
          <Card 
            key={rate.currency} 
            className="backdrop-blur-md bg-white/30 dark:bg-black/30 border-gray-200/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rate.flag}</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {rate.currency}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      1 USD = {rate.rate.toFixed(rate.currency === 'JPY' ? 2 : 4)} {rate.currency}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${
                    rate.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {rate.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm font-medium">
                      {rate.changePercent >= 0 ? '+' : ''}{rate.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className={`text-xs ${
                    rate.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Market Trends Card */}
        <Card className="backdrop-blur-md bg-white/30 dark:bg-black/30 border-gray-200/30 dark:border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-green-50/50 dark:bg-green-900/20">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Strongest Performer</p>
                <p className="text-xs text-green-600 dark:text-green-400">CAD +2.21%</p>
              </div>
              <TrendingUp size={20} className="text-green-600" />
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-xl bg-red-50/50 dark:bg-red-900/20">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Weakest Performer</p>
                <p className="text-xs text-red-600 dark:text-red-400">GBP -2.47%</p>
              </div>
              <TrendingDown size={20} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}