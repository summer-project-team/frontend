import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Home, Receipt } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Transaction } from '../App';
import { formatCurrency } from '../utils/currency';

interface TransactionResultProps {
  isSuccess: boolean;
  transaction: Transaction;
  onDone: () => void;
  onTryAgain: () => void;
  onViewReceipt: () => void;
}

export function TransactionResult({ 
  isSuccess, 
  transaction, 
  onDone, 
  onTryAgain,
  onViewReceipt 
}: TransactionResultProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (isSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Success Animation Background */}
        <div className={`absolute inset-0 transition-all duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-20 left-10 w-24 h-24 bg-green-200/40 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-8 w-16 h-16 bg-emerald-200/40 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-40 left-16 w-20 h-20 bg-green-300/40 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-sm">
          {/* Success Icon Animation */}
          <div className={`mb-8 transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle2 size={48} className="text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className={`mb-8 transition-all duration-1000 delay-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-3xl mb-2 text-gray-800">Transfer Successful!</h1>
            <p className="text-gray-600">Your money is on its way</p>
          </div>

          {/* Transaction Details */}
          <div className={`mb-8 transition-all duration-1000 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="backdrop-blur-lg bg-white/30 rounded-3xl p-6 border border-white/40 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={transaction.avatar} />
                    <AvatarFallback>{transaction.recipient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-gray-800">{transaction.recipient}</p>
                    <p className="text-sm text-gray-600">{transaction.recipientCurrency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-gray-800">{formatCurrency(transaction.amount, transaction.currency)}</p>
                    <p className="text-sm text-gray-600">{transaction.convertedAmount} {transaction.recipientCurrency}</p>
                  </div>
                </div>
                
                <div className="border-t border-white/40 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reference</span>
                    <span className="text-gray-800 font-mono">{transaction.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="text-gray-800">${transaction.totalPaid}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Arrival Time</span>
                    <span className="text-gray-800">Instantly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-3 transition-all duration-1000 delay-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Button
              onClick={onViewReceipt}
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <Receipt size={20} className="mr-2" />
              View Receipt
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onDone}
                variant="outline"
                className="h-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl hover:bg-white/40 transition-all duration-300"
              >
                <Home size={16} className="mr-2" />
                Home
              </Button>
              <Button
                onClick={() => onDone()}
                variant="outline"
                className="h-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl hover:bg-white/40 transition-all duration-300"
              >
                Send Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failure Screen
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Failure Animation Background */}
      <div className={`absolute inset-0 transition-all duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-20 left-10 w-24 h-24 bg-red-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-8 w-16 h-16 bg-orange-200/30 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-16 w-20 h-20 bg-red-300/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center max-w-sm">
        {/* Failure Icon */}
        <div className={`mb-8 transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
            <XCircle size={48} className="text-white" />
          </div>
        </div>

        {/* Error Message */}
        <div className={`mb-8 transition-all duration-1000 delay-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-3xl mb-2 text-gray-800">Transfer Failed</h1>
          <p className="text-gray-600">We couldn't process your transaction</p>
        </div>

        {/* Transaction Details */}
        <div className={`mb-8 transition-all duration-1000 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="backdrop-blur-lg bg-white/30 rounded-3xl p-6 border border-white/40 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={transaction.avatar} />
                  <AvatarFallback>{transaction.recipient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-gray-800">{transaction.recipient}</p>
                  <p className="text-sm text-gray-600">{transaction.recipientCurrency}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl text-gray-800">{formatCurrency(transaction.amount, transaction.currency)}</p>
                </div>
              </div>
              
              <div className="border-t border-white/40 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Reference</span>
                  <span className="text-gray-800 font-mono">{transaction.referenceNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className={`mb-8 transition-all duration-1000 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="backdrop-blur-lg bg-white/30 rounded-2xl p-6 border border-white/40 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Network connection issue</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <p className="text-sm text-gray-600">Your funds are safe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`space-y-3 transition-all duration-1000 delay-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <Button
            onClick={onTryAgain}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <RefreshCw size={20} className="mr-2" />
            Try Again
          </Button>
          <Button
            onClick={onDone}
            variant="outline"
            className="w-full h-14 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl hover:bg-white/40 transition-all duration-300"
          >
            <Home size={20} className="mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}