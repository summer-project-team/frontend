import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { CreditCard, DollarSign, AlertCircle } from 'lucide-react';

interface WithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onWithdraw: (amount: number, bankDetails: BankDetails) => void;
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  country: string;
}

const nigerianBanks = [
  'Access Bank', 'Zenith Bank', 'GTBank', 'First Bank', 'UBA',
  'Fidelity Bank', 'FCMB', 'Sterling Bank', 'Union Bank', 'Wema Bank'
];

const ukBanks = [
  'Barclays', 'HSBC', 'Lloyds Bank', 'NatWest', 'Santander',
  'TSB', 'Halifax', 'Nationwide', 'Metro Bank', 'Monzo'
];

const usBanks = [
  'Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'US Bank',
  'PNC Bank', 'Capital One', 'TD Bank', 'BBVA', 'SunTrust'
];

export function WithdrawDialog({ isOpen, onClose, userBalance, onWithdraw }: WithdrawDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountName: '',
    accountNumber: '',
    bankName: '',
    country: 'Nigeria'
  });

  const getBankList = () => {
    switch (bankDetails.country) {
      case 'Nigeria': return nigerianBanks;
      case 'United Kingdom': return ukBanks;
      case 'United States': return usBanks;
      default: return nigerianBanks;
    }
  };

  const getWithdrawalFee = (withdrawAmount: number) => {
    return withdrawAmount * 0.02; // 2% withdrawal fee
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (numAmount > userBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (numAmount < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }
    setStep(2);
  };

  const handleWithdraw = () => {
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      toast.error('Please fill in all bank details');
      return;
    }
    
    const numAmount = parseFloat(amount);
    const fee = getWithdrawalFee(numAmount);
    const totalDeduction = numAmount + fee;
    
    if (totalDeduction > userBalance) {
      toast.error('Insufficient balance including fees');
      return;
    }

    onWithdraw(numAmount, bankDetails);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setAmount('');
    setBankDetails({
      accountName: '',
      accountNumber: '',
      bankName: '',
      country: 'Nigeria'
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-gray-800 dark:text-white">
            {step === 1 ? 'Withdraw Funds' : 'Bank Details'}
          </DialogTitle>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="space-y-6">
            {/* Available Balance */}
            <div className="text-center p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/30">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount" className="text-gray-800 dark:text-white">
                Withdrawal Amount
              </Label>
              <div className="relative mt-1">
                <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 text-lg bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Fee Information */}
            {amount && parseFloat(amount) > 0 && (
              <div className="space-y-2 p-4 rounded-xl bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/30 dark:border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">Fee Breakdown</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-yellow-700 dark:text-yellow-300">Withdrawal Amount:</span>
                    <span className="text-yellow-800 dark:text-yellow-200">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700 dark:text-yellow-300">Processing Fee (2%):</span>
                    <span className="text-yellow-800 dark:text-yellow-200">${getWithdrawalFee(parseFloat(amount)).toFixed(2)}</span>
                  </div>
                  <hr className="border-yellow-300/50" />
                  <div className="flex justify-between font-medium">
                    <span className="text-yellow-800 dark:text-yellow-200">Total Deduction:</span>
                    <span className="text-yellow-800 dark:text-yellow-200">${(parseFloat(amount) + getWithdrawalFee(parseFloat(amount))).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleAmountSubmit}
              className="w-full card-gradient hover:opacity-90 text-white"
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Country Selection */}
            <div>
              <Label className="text-gray-800 dark:text-white">Country</Label>
              <Select
                value={bankDetails.country}
                onValueChange={(value) => setBankDetails(prev => ({ ...prev, country: value, bankName: '' }))}
              >
                <SelectTrigger className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nigeria">🇳🇬 Nigeria</SelectItem>
                  <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="United States">🇺🇸 United States</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Name */}
            <div>
              <Label className="text-gray-800 dark:text-white">Bank Name</Label>
              <Select
                value={bankDetails.bankName}
                onValueChange={(value) => setBankDetails(prev => ({ ...prev, bankName: value }))}
              >
                <SelectTrigger className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10">
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {getBankList().map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Name */}
            <div>
              <Label htmlFor="accountName" className="text-gray-800 dark:text-white">
                Account Name
              </Label>
              <Input
                id="accountName"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="Enter account holder name"
                className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white"
              />
            </div>

            {/* Account Number */}
            <div>
              <Label htmlFor="accountNumber" className="text-gray-800 dark:text-white">
                Account Number
              </Label>
              <Input
                id="accountNumber"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Enter account number"
                className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50"
              >
                Back
              </Button>
              <Button
                onClick={handleWithdraw}
                className="flex-1 card-gradient hover:opacity-90 text-white"
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}