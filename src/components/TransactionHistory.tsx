import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Download, Receipt, TrendingUp, TrendingDown, Calendar, Tag, StickyNote } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Transaction } from '../App';
import { renderCustomAvatar } from './AvatarCustomization';
import { formatTransactionAmount } from '../utils/currency';

interface TransactionHistoryProps {
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

interface TransactionHistoryProps {
  transactions: Transaction[];
  onBack: () => void;
  onViewReceipt: (transaction: Transaction) => void;
}

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

export function TransactionHistory({ transactions, onBack, onViewReceipt }: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  const filteredTransactions = transactions.filter(transaction => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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

  const totalSent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalTransactions = transactions.length;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 backdrop-blur-lg bg-white/20 border-b border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-gray-800">Transaction History</h2>
        <Button
          variant="ghost"
          size="sm"
          className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30"
        >
          <Download size={20} />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm text-gray-600">Total Sent</span>
            </div>
            <p className="text-xl text-gray-800">${totalSent.toFixed(2)}</p>
          </div>
          <div className="backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30">
            <div className="flex items-center space-x-2 mb-2">
              <Receipt size={16} className="text-blue-600" />
              <span className="text-sm text-gray-600">Transactions</span>
            </div>
            <p className="text-xl text-gray-800">{totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-12 focus:bg-white/40 transition-all duration-300"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'completed', label: 'Completed' },
            { key: 'pending', label: 'Pending' },
            { key: 'failed', label: 'Failed' }
          ].map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as any)}
              variant={filterStatus === filter.key ? "default" : "outline"}
              className={`px-4 py-2 rounded-xl whitespace-nowrap ${
                filterStatus === filter.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'backdrop-blur-md bg-white/30 border-white/40 hover:bg-white/40'
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-3 mt-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <Receipt size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30 cursor-pointer hover:bg-white/35 transition-all duration-300"
                onClick={() => onViewReceipt(transaction)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={transaction.avatar} />
                      <AvatarFallback>{transaction.recipient[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-800">{transaction.recipient}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      <p className="text-xs text-gray-400 font-mono">{transaction.referenceNumber}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-gray-800">{formatTransactionAmount(transaction)}</p>
                    <p className="text-xs text-gray-600">
                      {transaction.convertedAmount} {transaction.recipientCurrency}
                    </p>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}