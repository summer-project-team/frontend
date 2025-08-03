import React from 'react';
import { ArrowLeft, Download, Share2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Transaction, User } from '../App';
import { formatCurrency } from '../utils/currency';

interface ReceiptScreenProps {
  transaction: Transaction;
  user: User | null;
  onBack: () => void;
}

export function ReceiptScreen({ transaction, user, onBack }: ReceiptScreenProps) {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle2 size={24} className="text-green-600" />;
      case 'failed':
        return <XCircle size={24} className="text-red-600" />;
      default:
        return <Clock size={24} className="text-orange-600" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'from-green-400 to-emerald-500';
      case 'failed':
        return 'from-red-400 to-orange-500';
      default:
        return 'from-orange-400 to-yellow-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF receipt
    const receiptData = {
      transaction,
      user,
      downloadDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${transaction.referenceNumber}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${transaction.referenceNumber}`,
          text: `Transaction receipt for ${formatCurrency(transaction.amount, transaction.currency)} sent to ${transaction.recipient}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-gradient-to-tl from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 pt-16">
        <button
          onClick={onBack}
          className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Receipt</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <Share2 size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleDownload}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-3 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <Download size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto pb-6">
        {/* Status Header */}
        <div className="p-6 text-center">
          <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${getStatusColor()} rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 dark:border-white/20`}>
            {getStatusIcon()}
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
            {transaction.status === 'completed' ? 'Transfer Completed' :
             transaction.status === 'failed' ? 'Transfer Failed' : 'Transfer Pending'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</p>
        </div>

        {/* Receipt Card */}
        <div className="px-6">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-white/10 rounded-3xl border border-white/50 dark:border-white/20 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 p-6 border-b border-white/30 dark:border-white/20">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Transaction Receipt</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1 rounded-lg inline-block">
                  {transaction.referenceNumber}
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="p-6 space-y-6">
              {/* Sender & Recipient */}
              <div className="space-y-4">
                <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-white/30 dark:border-white/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">From</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 border-2 border-white/50">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-800 dark:text-white font-semibold">{user?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-white/30 dark:border-white/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">To</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 border-2 border-white/50">
                      <AvatarImage src={transaction.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        {transaction.recipient[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-800 dark:text-white font-semibold">{transaction.recipient}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.recipientCurrency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Details */}
              <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-5 border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Amount Sent</span>
                    <span className="text-gray-800 dark:text-white font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Exchange Rate</span>
                    <span className="text-gray-800 dark:text-white text-sm">1 USD = {transaction.exchangeRate.toLocaleString()} {transaction.recipientCurrency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Recipient Gets</span>
                    <span className="text-gray-800 dark:text-white font-semibold">{transaction.convertedAmount} {transaction.recipientCurrency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Transfer Fee</span>
                    <span className="text-gray-800 dark:text-white">{formatCurrency(transaction.fee, transaction.currency)}</span>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-700/50 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">Total Paid</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(transaction.totalPaid, transaction.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-white/30 dark:border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Reference Number</span>
                  <span className="text-gray-800 dark:text-white font-mono text-sm bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded">{transaction.referenceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    transaction.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                  <span className="text-gray-800 dark:text-white text-sm">{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-900/50 p-4 text-center border-t border-white/30 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pt-6 space-y-3">
          <button
            onClick={handleDownload}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl transition-all duration-300 hover:scale-105 text-white font-medium flex items-center justify-center gap-2 shadow-lg"
          >
            <Download size={20} />
            Download Receipt
          </button>
          
          {'share' in navigator && (
            <button
              onClick={handleShare}
              className="w-full h-12 backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-2xl hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 text-gray-700 dark:text-gray-300 font-medium flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Share Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}