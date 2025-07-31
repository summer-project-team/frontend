import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Copy, Clock, CheckCircle, AlertCircle, Banknote, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface DepositInstructionsProps {
  onBack: () => void;
  depositData: {
    amount: number;
    currency: string;
    bank_account: string;
    reference_code: string;
    bank_name: string;
    instructions: string;
    expires_at: string;
  };
  onPaymentConfirm: () => void;
  user: any;
}

export function DepositInstructions({ onBack, depositData, onPaymentConfirm, user }: DepositInstructionsProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(depositData.expires_at).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [depositData.expires_at]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handlePaymentConfirm = async () => {
    setIsProcessing(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      onPaymentConfirm();
      toast.success('Payment confirmed! CBUSD credited to your wallet.');
    } catch (error) {
      toast.error('Failed to confirm payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrencyDetails = (currency: string) => {
    const details = {
      'NGN': { symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira' },
      'USD': { symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
      'GBP': { symbol: '£', flag: '🇬🇧', name: 'British Pound' }
    };
    return details[currency as keyof typeof details] || { symbol: currency, flag: '💰', name: currency };
  };

  const currencyDetails = getCurrencyDetails(depositData.currency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Deposit Instructions</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete your bank transfer to add funds</p>
          </div>
        </div>

        {/* Amount Summary Card */}
        <Card className="mb-6 glass-card dark:dark-glass border-gray-200/30 dark:border-white/10">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-gray-800 dark:text-white">
              {currencyDetails.flag} {currencyDetails.symbol}{depositData.amount.toLocaleString()}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">{currencyDetails.name}</p>
          </CardHeader>
        </Card>

        {/* Timer Card */}
        <Card className="mb-6 glass-card dark:dark-glass border-orange-200/30 dark:border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-orange-600 dark:text-orange-400" />
              <div className="flex-1">
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Time Remaining</p>
                <p className="text-orange-800 dark:text-orange-200 font-mono text-lg">{timeLeft}</p>
              </div>
              <AlertCircle size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        {/* Bank Details Card */}
        <Card className="mb-6 glass-card dark:dark-glass border-gray-200/30 dark:border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <CreditCard size={20} />
              Bank Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Name */}
            <div className="flex items-center justify-between p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                <p className="text-gray-800 dark:text-white font-medium">{user?.name || 'CrossBridge User'}</p>
              </div>
              <Button
                onClick={() => copyToClipboard(user?.name || 'CrossBridge User', 'Account name')}
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-gray-200/30 dark:hover:bg-white/10"
              >
                <Copy size={16} />
              </Button>
            </div>

            {/* Bank Name */}
            <div className="flex items-center justify-between p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                <p className="text-gray-800 dark:text-white font-medium">{depositData.bank_name}</p>
              </div>
              <Button
                onClick={() => copyToClipboard(depositData.bank_name, 'Bank name')}
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-gray-200/30 dark:hover:bg-white/10"
              >
                <Copy size={16} />
              </Button>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                <p className="text-gray-800 dark:text-white font-mono font-medium">{depositData.bank_account}</p>
              </div>
              <Button
                onClick={() => copyToClipboard(depositData.bank_account, 'Account number')}
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-gray-200/30 dark:hover:bg-white/10"
              >
                <Copy size={16} />
              </Button>
            </div>

            {/* Reference Code */}
            <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-500/30">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Reference Code (IMPORTANT)</p>
                <p className="text-blue-800 dark:text-blue-200 font-mono font-bold text-lg">{depositData.reference_code}</p>
              </div>
              <Button
                onClick={() => copyToClipboard(depositData.reference_code, 'Reference code')}
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-blue-200/30 dark:hover:bg-blue-900/30"
              >
                <Copy size={16} />
              </Button>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200/30 dark:border-green-500/30">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Amount to Send</p>
                <p className="text-green-800 dark:text-green-200 font-bold text-xl">
                  {currencyDetails.symbol}{depositData.amount.toLocaleString()}
                </p>
              </div>
              <Button
                onClick={() => copyToClipboard(depositData.amount.toString(), 'Amount')}
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-green-200/30 dark:hover:bg-green-900/30"
              >
                <Copy size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="mb-6 glass-card dark:dark-glass border-purple-200/30 dark:border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">Transfer Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Open your banking app or visit your bank</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Use mobile banking, internet banking, or visit a branch</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Make a transfer to the account details above</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Enter the exact account number and bank name</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Use the reference code</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Include <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{depositData.reference_code}</code> in the description/narration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Confirm your payment</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Click the button below after making the transfer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Button */}
        <Button
          onClick={handlePaymentConfirm}
          disabled={isProcessing}
          className="w-full card-gradient hover:opacity-90 text-white py-4 text-lg font-medium"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              I Have Made the Payment
            </div>
          )}
        </Button>

        {/* Demo Notice */}
        <div className="mt-4 p-4 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200/30 dark:border-yellow-500/30">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm text-center">
            <strong>Demo Mode:</strong> This is a demonstration. Clicking "I Have Made the Payment" will automatically credit CBUSD to your wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
