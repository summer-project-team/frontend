import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Download, Receipt, TrendingUp, TrendingDown, Calendar, Tag, StickyNote, ArrowUpRight, ArrowDownLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Transaction } from '../App';

interface ModernTransactionHistoryProps {
  transactions: Transaction[];
  onBack: () => void;
  onViewReceipt: (transaction: Transaction) => void;
}

// Currency symbol helper
const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'NGN': '₦',
    'GBP': '£',
    'EUR': '€',
    'CBUSD': '$',
  };
  return symbols[currency] || currency;
};

// Transaction categories for filtering
const transactionCategories = [
  { value: 'all', label: 'All Categories', icon: '📌' },
  { value: 'family_friends', label: 'Family & Friends', icon: '👨‍👩‍👧‍👦' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'bills_utilities', label: 'Bills & Utilities', icon: '🏠' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'other', label: 'Other', icon: '📌' },
];

export function ModernTransactionHistory({ transactions, onBack, onViewReceipt }: ModernTransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      const matchesSearch = transaction.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transaction.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (transaction.note && transaction.note.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      
      // Category filter
      const matchesCategory = filterCategory === 'all' || 
                             (transaction.category === filterCategory) ||
                             (!transaction.category && filterCategory === 'other');
      
      // Date filter
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      let matchesDate = true;
      
      switch (dateFilter) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          matchesDate = transactionDate >= today;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          matchesDate = transactionDate >= monthAgo;
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          matchesDate = transactionDate >= yearAgo;
          break;
        default:
          matchesDate = true;
      }
      
      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [transactions, searchQuery, filterStatus, filterCategory, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50';
      case 'pending':
        return 'bg-amber-100/80 text-amber-700 border-amber-200/50';
      case 'failed':
        return 'bg-red-100/80 text-red-700 border-red-200/50';
      default:
        return 'bg-gray-100/80 text-gray-700 border-gray-200/50';
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'deposit' || transaction.status === 'received') {
      return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const summaryStats = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'completed');
    const totalSent = completed.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const thisMonth = completed.filter(t => {
      const transactionDate = new Date(t.date);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    });
    const monthlyTotal = thisMonth.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      totalSent,
      totalTransactions: transactions.length,
      monthlyTotal,
      completedCount: completed.length
    };
  }, [transactions]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });
    
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header with glass morphism */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between p-6 pt-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="backdrop-blur-md bg-white/40 dark:bg-white/10 rounded-full p-3 border border-white/30 hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Transaction History</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{filteredTransactions.length} transactions</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="backdrop-blur-md bg-white/40 dark:bg-white/10 rounded-full p-3 border border-white/30 hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-300"
          >
            <Download size={20} className="text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/40 to-white/20 dark:from-white/10 dark:to-white/5 rounded-3xl p-6 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-200/50">
                All time
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sent</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">${summaryStats.totalSent.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{summaryStats.completedCount} completed</p>
          </div>
          
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/40 to-white/20 dark:from-white/10 dark:to-white/5 rounded-3xl p-6 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/50">
                This month
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Total</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">${summaryStats.monthlyTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{summaryStats.totalTransactions} transactions</p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="px-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by recipient, reference, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 backdrop-blur-xl bg-white/40 dark:bg-white/10 border-white/40 dark:border-white/20 rounded-2xl h-14 focus:bg-white/50 dark:focus:bg-white/15 transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'all', label: 'All', icon: Filter },
            { key: 'completed', label: 'Completed', icon: TrendingUp },
            { key: 'pending', label: 'Pending', icon: RefreshCw },
            { key: 'failed', label: 'Failed', icon: TrendingDown }
          ].map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as any)}
              variant="ghost"
              className={`px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                filterStatus === filter.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300'
              }`}
            >
              <filter.icon size={16} className="mr-2" />
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'all', label: 'All time' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This week' },
            { key: 'month', label: 'This month' },
            { key: 'year', label: 'This year' }
          ].map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setDateFilter(filter.key as any)}
              variant="ghost"
              size="sm"
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                dateFilter === filter.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                  : 'backdrop-blur-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 text-xs'
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grouped Transactions List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-6 mt-6">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center shadow-lg">
                <Receipt size={32} className="text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No transactions found</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                  setDateFilter('all');
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, transactions]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center space-x-3 px-2">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{date}</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/30 dark:bg-white/10 px-2 py-1 rounded-full">
                    {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>
                
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="backdrop-blur-xl bg-white/40 dark:bg-white/5 rounded-3xl p-5 border border-white/30 dark:border-white/10 cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 group"
                    onClick={() => onViewReceipt(transaction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-14 h-14 border-2 border-white/30 shadow-lg">
                            <AvatarImage src={transaction.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                              {transaction.recipient[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-white/30 flex items-center justify-center shadow-md">
                            {getTransactionIcon(transaction)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {transaction.recipient}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.date)} • {new Date(transaction.date).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                              {transaction.referenceNumber}
                            </p>
                            {transaction.category && (
                              <span className="text-xs px-2 py-1 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {transactionCategories.find(c => c.value === transaction.category)?.icon} {transactionCategories.find(c => c.value === transaction.category)?.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {transaction.type === 'deposit' || transaction.status === 'received' ? '+' : '-'}
                            {getCurrencySymbol(transaction.currency)}{transaction.amount}
                          </p>
                          {transaction.recipientCurrency !== transaction.currency && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ≈ {getCurrencySymbol(transaction.recipientCurrency)}{transaction.convertedAmount}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {transaction.status === 'pending' && <RefreshCw size={10} className="mr-1 animate-spin" />}
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </div>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        
                        {transaction.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 italic max-w-32 truncate">
                            "{transaction.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
