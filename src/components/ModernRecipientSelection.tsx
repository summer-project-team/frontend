import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, ChevronRight, CreditCard, Smartphone, ArrowRight, Users, Phone, Building2, User as UserIcon, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Recipient } from '../App';
import { User } from '../types/user.ts';
import { toast } from 'sonner';

interface ModernRecipientSelectionProps {
  user: User | null;
  onBack: () => void;
  onRecipientSelect: (recipient: Recipient) => void;
}

// Nigerian banks list for the dropdown
const nigerianBanks = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank Nigeria Plc' },
  { code: '023', name: 'Citibank Nigeria Limited' },
  { code: '063', name: 'Diamond Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '103', name: 'Globus Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '090', name: 'MainStreet Bank' },
  { code: '101', name: 'Polaris Bank' },
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

export function ModernRecipientSelection({ user, onBack, onRecipientSelect }: ModernRecipientSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedRecipients, setSavedRecipients] = useState<Recipient[]>([]);
  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<'bank' | 'phone' | null>(null);
  const [activeTab, setActiveTab] = useState<'app-users' | 'bank-accounts'>('app-users');
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    phoneNumber: '',
    country: 'Nigeria'
  });

  // Load saved recipients from localStorage (user-specific)
  useEffect(() => {
    if (user?.id) {
      const userSpecificKey = `saved_recipients_${user.id}`;
      const globalKey = 'saved_recipients';
      
      const userRecipients = localStorage.getItem(userSpecificKey);
      
      if (userRecipients) {
        try {
          const recipients = JSON.parse(userRecipients);
          const migratedRecipients = recipients.map((recipient: any) => {
            if (recipient.currency !== 'CBUSD' && (!recipient.accountNumber || !recipient.bankCode)) {
              console.warn(`Recipient "${recipient.name}" is missing bank details. Please update this recipient.`);
              return {
                ...recipient,
                accountNumber: recipient.accountNumber || null,
                bankCode: recipient.bankCode || null,
                bankName: recipient.bankName || 'Unknown Bank'
              };
            }
            return recipient;
          });
          setSavedRecipients(migratedRecipients);
        } catch (error) {
          console.error('Error loading saved recipients:', error);
          setSavedRecipients([]);
        }
      } else {
        const globalRecipients = localStorage.getItem(globalKey);
        if (globalRecipients) {
          try {
            const recipients = JSON.parse(globalRecipients);
            const migratedRecipients = recipients.map((recipient: any) => {
              if (recipient.currency !== 'CBUSD' && (!recipient.accountNumber || !recipient.bankCode)) {
                return {
                  ...recipient,
                  accountNumber: recipient.accountNumber || null,
                  bankCode: recipient.bankCode || null,
                  bankName: recipient.bankName || 'Unknown Bank'
                };
              }
              return recipient;
            });
            setSavedRecipients(migratedRecipients);
            localStorage.setItem(userSpecificKey, globalRecipients);
            console.log(`Migrated ${migratedRecipients.length} recipients to user-specific storage for user ${user.id}`);
          } catch (error) {
            console.error('Error migrating recipients:', error);
            setSavedRecipients([]);
          }
        } else {
          setSavedRecipients([]);
        }
      }
    }
  }, [user?.id]);

  const handleAddRecipient = () => {
    if (recipientType === 'bank' && newRecipient.name && newRecipient.accountNumber && newRecipient.bankCode) {
      const existingBankRecipient = savedRecipients.find(r => 
        r.accountNumber === newRecipient.accountNumber && 
        r.bankCode === newRecipient.bankCode
      );
      
      if (existingBankRecipient) {
        toast.error('This bank account is already added');
        return;
      }

      const recipient: Recipient = {
        id: `bank_${newRecipient.bankCode}_${newRecipient.accountNumber}_${Date.now()}`,
        name: newRecipient.name,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
        country: newRecipient.country,
        currency: newRecipient.country === 'Nigeria' ? 'NGN' : newRecipient.country === 'United Kingdom' ? 'GBP' : 'USD',
        bankCode: newRecipient.bankCode,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName
      };
      
      const updatedRecipients = [...savedRecipients, recipient];
      setSavedRecipients(updatedRecipients);
      
      if (user?.id) {
        localStorage.setItem(`saved_recipients_${user.id}`, JSON.stringify(updatedRecipients));
      }
      
      toast.success('Bank recipient added successfully');
      setIsAddRecipientOpen(false);
      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
      setRecipientType(null);
    } else if (recipientType === 'phone' && newRecipient.name && newRecipient.phoneNumber) {
      const existingPhoneRecipient = savedRecipients.find(r => 
        r.phone === newRecipient.phoneNumber
      );
      
      if (existingPhoneRecipient) {
        toast.error('This phone number is already added');
        return;
      }

      const recipient: Recipient = {
        id: `phone_${newRecipient.phoneNumber}_${Date.now()}`,
        name: newRecipient.name,
        avatar: `https://images.unsplash.com/photo-1494790108755-2616b6e08c3c?w=150&h=150&fit=crop&crop=face`,
        country: 'App User',
        currency: 'CBUSD',
        phone: newRecipient.phoneNumber
      };
      
      const updatedRecipients = [...savedRecipients, recipient];
      setSavedRecipients(updatedRecipients);
      
      if (user?.id) {
        localStorage.setItem(`saved_recipients_${user.id}`, JSON.stringify(updatedRecipients));
      }
      
      toast.success('App recipient added successfully');
      setIsAddRecipientOpen(false);
      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
      setRecipientType(null);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  // Auto-open dialog when recipientType is set
  useEffect(() => {
    if (recipientType && !isAddRecipientOpen) {
      setIsAddRecipientOpen(true);
    }
  }, [recipientType, isAddRecipientOpen]);

  const filteredRecipients = savedRecipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group recipients by type
  const appUsers = filteredRecipients.filter(r => r.currency === 'CBUSD');
  const bankRecipients = filteredRecipients.filter(r => r.currency !== 'CBUSD');

  // Get current tab recipients for empty state check
  const currentTabRecipients = activeTab === 'app-users' ? appUsers : bankRecipients;

  const handleSelectRecipient = (recipient: Recipient) => {
    onRecipientSelect(recipient);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Send to</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setRecipientType(activeTab === 'app-users' ? 'phone' : 'bank');
            setIsAddRecipientOpen(true);
          }}
          className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search recipients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-12 text-gray-800 dark:text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('app-users')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 ${
              activeTab === 'app-users'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Smartphone size={16} />
            <span className="font-medium text-sm">App Users</span>
            {appUsers.length > 0 && (
              <div className="px-1.5 py-0.5 bg-green-500/20 rounded-full">
                <span className="text-green-600 dark:text-green-400 text-xs font-medium">{appUsers.length}</span>
              </div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('bank-accounts')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 ${
              activeTab === 'bank-accounts'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Building2 size={16} />
            <span className="font-medium text-sm">Bank Accounts</span>
            {bankRecipients.length > 0 && (
              <div className="px-1.5 py-0.5 bg-blue-500/20 rounded-full">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">{bankRecipients.length}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Recipients List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {savedRecipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center mb-4">
              <Users size={32} className="text-gray-500" />
            </div>
            <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-2">No recipients yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Add your first recipient to start sending money quickly and easily
            </p>
            <Button
              onClick={() => {
                setRecipientType(activeTab === 'app-users' ? 'phone' : 'bank');
                setIsAddRecipientOpen(true);
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl px-6 shadow-lg"
            >
              <Plus className="mr-2" size={18} />
              Add {activeTab === 'app-users' ? 'App User' : 'Bank Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* App Users Tab Content */}
            {activeTab === 'app-users' && (
              <>
                {appUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                      <Smartphone size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-semibold mb-2">No app users yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Add app users to send CBUSD instantly
                    </p>
                    <Button
                      onClick={() => {
                        setRecipientType('phone');
                        setIsAddRecipientOpen(true);
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-6 shadow-lg"
                    >
                      <Plus className="mr-2" size={18} />
                      Add App User
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Smartphone size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-gray-800 dark:text-white font-semibold">App Users</h3>
                      <div className="px-2 py-1 bg-green-500/20 rounded-full">
                        <span className="text-green-600 dark:text-green-400 text-xs font-medium">Instant</span>
                      </div>
                    </div>
                    {appUsers.map((recipient) => (
                      <button
                        key={recipient.id}
                        onClick={() => handleSelectRecipient(recipient)}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700">
                            <AvatarImage src={recipient.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-medium">
                              {recipient.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="text-gray-800 dark:text-white font-semibold">{recipient.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{recipient.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-green-500/20 rounded-full">
                            <span className="text-green-600 dark:text-green-400 text-xs font-medium">{recipient.currency}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Bank Accounts Tab Content */}
            {activeTab === 'bank-accounts' && (
              <>
                {bankRecipients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                      <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-semibold mb-2">No bank accounts yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Add bank accounts to send money locally
                    </p>
                    <Button
                      onClick={() => {
                        setRecipientType('bank');
                        setIsAddRecipientOpen(true);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl px-6 shadow-lg"
                    >
                      <Plus className="mr-2" size={18} />
                      Add Bank Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-gray-800 dark:text-white font-semibold">Bank Accounts</h3>
                      <div className="px-2 py-1 bg-blue-500/20 rounded-full">
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">2-5 minutes</span>
                      </div>
                    </div>
                    {bankRecipients.map((recipient) => (
                      <button
                        key={recipient.id}
                        onClick={() => handleSelectRecipient(recipient)}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700">
                            <AvatarImage src={recipient.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-medium">
                              {recipient.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="text-gray-800 dark:text-white font-semibold">{recipient.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{recipient.bankName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{recipient.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-blue-500/20 rounded-full">
                            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">{recipient.currency}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Recipient Dialog */}
      <Dialog open={isAddRecipientOpen} onOpenChange={(open) => {
        setIsAddRecipientOpen(open);
        if (!open) {
          setRecipientType(null);
          setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
        }
      }}>
        <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mx-auto max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-gray-800 dark:text-white">
              Add New Recipient
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
              {recipientType === 'bank'
                ? "Enter bank account details"
                : recipientType === 'phone'
                  ? "Enter phone number for app user"
                  : "Choose how you want to send money"
              }
            </DialogDescription>
          </DialogHeader>
          
          {!recipientType ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setRecipientType('phone')}
                  className="flex items-center gap-4 p-4 bg-green-500/10 dark:bg-green-500/20 rounded-2xl border border-green-500/30 hover:bg-green-500/20 dark:hover:bg-green-500/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Smartphone size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-gray-800 dark:text-white font-semibold">App User</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send CBUSD instantly</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                </button>
                
                <button
                  onClick={() => setRecipientType('bank')}
                  className="flex items-center gap-4 p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl border border-blue-500/30 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CreditCard size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-gray-800 dark:text-white font-semibold">Bank Account</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send to local bank account</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
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
                  className="mt-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
              
              {recipientType === 'phone' ? (
                <div>
                  <Label htmlFor="phone" className="text-gray-800 dark:text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newRecipient.phoneNumber}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter phone number"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="account" className="text-gray-800 dark:text-white">Account Number</Label>
                    <Input
                      id="account"
                      value={newRecipient.accountNumber}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Enter account number"
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bank" className="text-gray-800 dark:text-white">Bank</Label>
                    <select
                      id="bank"
                      value={newRecipient.bankCode}
                      onChange={(e) => {
                        const selectedBank = nigerianBanks.find(bank => bank.code === e.target.value);
                        setNewRecipient(prev => ({
                          ...prev,
                          bankCode: e.target.value,
                          bankName: selectedBank?.name || ''
                        }));
                      }}
                      className="mt-1 w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white"
                    >
                      <option value="">Select bank</option>
                      {nigerianBanks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddRecipient}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl"
                >
                  Add Recipient
                </Button>
                <Button
                  onClick={() => {
                    // If recipientType was pre-set from tabs, close the dialog
                    // Otherwise, go back to type selection
                    if (recipientType) {
                      setIsAddRecipientOpen(false);
                      setRecipientType(null);
                      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
                    } else {
                      setRecipientType(null);
                      setNewRecipient({ name: '', accountNumber: '', bankCode: '', bankName: '', phoneNumber: '', country: 'Nigeria' });
                    }
                  }}
                  variant="outline"
                  className="px-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl"
                >
                  {recipientType ? 'Cancel' : 'Back'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
