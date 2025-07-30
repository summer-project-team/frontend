import React from 'react';
import { ArrowLeft, Download, Share2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Transaction, User } from '../App';

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
          text: `Transaction receipt for $${transaction.amount} sent to ${transaction.recipient}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

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
        <h2 className="text-gray-800">Receipt</h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30"
          >
            <Share2 size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30"
          >
            <Download size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Status Header */}
        <div className="p-6 text-center">
          <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${getStatusColor()} rounded-full flex items-center justify-center shadow-2xl`}>
            {getStatusIcon()}
          </div>
          <h1 className="text-2xl mb-2 text-gray-800">
            {transaction.status === 'completed' ? 'Transfer Completed' :
             transaction.status === 'failed' ? 'Transfer Failed' : 'Transfer Pending'}
          </h1>
          <p className="text-gray-600">{formatDate(transaction.date)}</p>
        </div>

        {/* Receipt Card */}
        <div className="px-6">
          <div className="backdrop-blur-lg bg-white/30 rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border-b border-white/20">
              <div className="text-center">
                <h3 className="text-lg text-gray-800 mb-2">Transaction Receipt</h3>
                <p className="text-sm text-gray-600 font-mono">{transaction.referenceNumber}</p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="p-6 space-y-6">
              {/* Sender & Recipient */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">From</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">To</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={transaction.avatar} />
                      <AvatarFallback>{transaction.recipient[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-800">{transaction.recipient}</p>
                      <p className="text-sm text-gray-600">{transaction.recipientCurrency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Details */}
              <div className="backdrop-blur-md bg-white/20 rounded-2xl p-4 border border-white/30">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Sent</span>
                    <span className="text-gray-800">${transaction.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exchange Rate</span>
                    <span className="text-gray-800">1 USD = {transaction.exchangeRate.toLocaleString()} {transaction.recipientCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient Gets</span>
                    <span className="text-gray-800">{transaction.convertedAmount} {transaction.recipientCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transfer Fee</span>
                    <span className="text-gray-800">${transaction.fee}</span>
                  </div>
                  <div className="border-t border-white/30 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Paid</span>
                      <span className="text-gray-800">${transaction.totalPaid}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference Number</span>
                  <span className="text-gray-800 font-mono text-sm">{transaction.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-800 text-sm">{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pt-6 space-y-3">
          <Button
            onClick={handleDownload}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <Download size={20} className="mr-2" />
            Download Receipt
          </Button>
          
          {'share' in navigator && (
            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full h-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl hover:bg-white/40 transition-all duration-300"
            >
              <Share2 size={20} className="mr-2" />
              Share Receipt
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}