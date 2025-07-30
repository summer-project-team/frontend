import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, ChevronRight, CreditCard, Smartphone, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Recipient } from '../App';
import { toast } from 'sonner';

interface RecipientSelectionProps {
  onBack: () => void;
  onRecipientSelect: (recipient: Recipient) => void;
}

// Nigerian banks list for the dropdown
const nigerianBanks = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank Nigeria Plc' },
  { code: '023', name: 'Citibank Nigeria Limited' },
  { code: '058', name: 'Diamond Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '221', name: 'Globus Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '090', name: 'MainStreet Bank' },
  { code: '057', name: 'Polaris Bank' },
  { code: '076', name: 'Skye Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

export function RecipientSelection({ onBack, onRecipientSelect }: RecipientSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedRecipients, setSavedRecipients] = useState<Recipient[]>([]);
  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<'bank' | 'phone' | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    phoneNumber: '',
    country: 'Nigeria'
  });

  // Load saved recipients from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_recipients') || '[]');
    setSavedRecipients(saved);
  }, []);

  // Use only saved recipients (no mock ones)
  const allRecipients = savedRecipients;

  const filteredRecipients = allRecipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecipientClick = (recipient: Recipient) => {
    setSelectedId(recipient.id);
    setTimeout(() => {
      onRecipientSelect(recipient);
    }, 200);
  };

  const handleBankChange = (bankCode: string) => {
    const selectedBank = nigerianBanks.find(bank => bank.code === bankCode);
    if (selectedBank) {
      setNewRecipient(prev => ({ 
        ...prev, 
        bankCode: bankCode,
        bankName: selectedBank.name 
      }));
    }
  };

  const handleAddRecipient = () => {
    if (recipientType === 'bank' && newRecipient.name && newRecipient.accountNumber && newRecipient.bankCode) {
      const recipient: Recipient = {
        id: `recipient_${Date.now()}`,
        name: newRecipient.name,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
        country: newRecipient.country,
        currency: newRecipient.country === 'Nigeria' ? 'NGN' : newRecipient.country === 'United Kingdom' ? 'GBP' : 'USD'
      };
      
      const updatedRecipients = [...savedRecipients, recipient];
      setSavedRecipients(updatedRecipients);
      localStorage.setItem('saved_recipients', JSON.stringify(updatedRecipients));
      
      toast.success('Recipient added successfully');
      setIsAddRecipientOpen(false);
      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
      setRecipientType(null);
    } else if (recipientType === 'phone' && newRecipient.name && newRecipient.phoneNumber) {
      const recipient: Recipient = {
        id: `phone_${newRecipient.phoneNumber}`,
        name: newRecipient.name,
        avatar: `https://images.unsplash.com/photo-1494790108755-2616b6e08c3c?w=150&h=150&fit=crop&crop=face`,
        country: 'App User',
        currency: 'USDC'
      };
      
      const updatedRecipients = [...savedRecipients, recipient];
      setSavedRecipients(updatedRecipients);
      localStorage.setItem('saved_recipients', JSON.stringify(updatedRecipients));
      
      toast.success('App recipient added successfully');
      setIsAddRecipientOpen(false);
      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
      setRecipientType(null);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  return (
    <div className="h-full flex flex-col">
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
        <h2 className="text-gray-800 dark:text-white">Send Money</h2>
        <div className="w-10"></div>
      </div>

      {/* Search Bar */}
      <div className="p-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search recipients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 backdrop-blur-md bg-white/30 border-white/40 rounded-2xl h-14 focus:bg-white/40 transition-all duration-300"
          />
        </div>
      </div>

      {/* Add New Recipient Button */}
      <div className="px-6 mb-6">
        <Dialog open={isAddRecipientOpen} onOpenChange={setIsAddRecipientOpen}>
          <DialogTrigger asChild>
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-white/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Plus size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white">Add New Recipient</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send to someone new</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 mx-auto" style={{ maxWidth: 'min(28rem, 90vw)' }}>
            <DialogHeader>
              <DialogTitle className="text-center text-gray-800 dark:text-white">
                Add New Recipient
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
                {!recipientType 
                  ? "Add a new recipient to send money quickly and easily"
                  : recipientType === 'bank'
                    ? "Enter bank account details for the recipient"
                    : "Enter phone number for the app user"
                }
              </DialogDescription>
            </DialogHeader>
            
            {!recipientType ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400">Choose recipient type:</p>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setRecipientType('bank')}
                    className="flex items-center gap-4 p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/30 dark:hover:bg-gray-900/50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-gray-800 dark:text-white">Bank Account</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send to local bank account</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => setRecipientType('phone')}
                    className="flex items-center gap-4 p-4 bg-gray-100/30 dark:bg-gray-900/30 rounded-xl border border-gray-200/30 dark:border-white/10 hover:bg-gray-200/30 dark:hover:bg-gray-900/50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Smartphone size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-gray-800 dark:text-white">App User</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send USDC to another app user</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-800 dark:text-white">Recipient Name</Label>
                  <Input
                    id="name"
                    value={newRecipient.name}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter recipient name"
                    className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                  />
                </div>
                
                {recipientType === 'bank' ? (
                  <>
                    <div>
                      <Label htmlFor="account" className="text-gray-800 dark:text-white">Account Number</Label>
                      <Input
                        id="account"
                        value={newRecipient.accountNumber}
                        onChange={(e) => setNewRecipient(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="Enter account number"
                        className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank" className="text-gray-800 dark:text-white">Bank</Label>
                      <select
                        id="bank"
                        value={newRecipient.bankCode}
                        onChange={(e) => handleBankChange(e.target.value)}
                        className="mt-1 w-full p-3 rounded-xl bg-gray-100/30 dark:bg-gray-900/30 border border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white"
                      >
                        <option value="">Select a bank</option>
                        {nigerianBanks.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <Label htmlFor="phone" className="text-gray-800 dark:text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newRecipient.phoneNumber}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter phone number"
                      className="mt-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                    />
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setRecipientType(null);
                      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
                    }}
                    variant="outline"
                    className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleAddRecipient}
                    className="flex-1 card-gradient hover:opacity-90 text-white"
                  >
                    Add Recipient
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipients List */}
      <div className="flex-1 px-6 pb-6">
        <h3 className="mb-4 text-gray-700 dark:text-gray-300">Recent Recipients</h3>
        {filteredRecipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Plus size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center">No recipients yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-2">
              Add your first recipient to get started with sending money
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecipients.map((recipient) => (
            <div
              key={recipient.id}
              onClick={() => handleRecipientClick(recipient)}
              className={`backdrop-blur-md rounded-2xl p-4 border border-white/30 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedId === recipient.id
                  ? 'bg-blue-500/20 border-blue-500/40 shadow-lg'
                  : 'bg-white/25 hover:bg-white/35'
              }`}
              style={{
                boxShadow: selectedId === recipient.id 
                  ? '0 0 20px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={recipient.avatar} />
                      <AvatarFallback>{recipient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {selectedId === recipient.id && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-white">{recipient.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{recipient.country} • {recipient.currency}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-xs bg-white/40 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400 mr-3">
                    {recipient.currency}
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}