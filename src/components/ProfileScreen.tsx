import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Shield, CreditCard, Settings, LogOut, Camera, Check, X, Bell, Lock, Smartphone, Globe, Moon, ChevronRight, Trash2, AlertTriangle, KeyRound, Loader2, Plus, Landmark } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { User } from '../App';
import { UserService } from '../services/UserService';
import { authService } from '../services/AuthService';
import { bankingService, type BankAccount, type LinkAccountRequest } from '../services/BankingService';
import { userToAuthUserUpdate, splitName, combineName } from '../utils/userMapping';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export function ProfileScreen({ user, onBack, onLogout, onUpdateUser }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentView, setCurrentView] = useState<'profile' | 'security' | 'payment' | 'settings'>('profile');
  
  // Split name into first and last name for better backend compatibility
  const { firstName, lastName } = splitName(user.name);
  
  const [editForm, setEditForm] = useState({
    firstName: firstName,
    lastName: lastName,
    email: user.email,
    phoneNumber: user.phoneNumber
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      sms: false,
      transactions: true
    },
    security: {
      biometric: true,
      twoFactor: false,
      autoLock: '5min'
    },
    app: {
      language: 'English',
      currency: 'USD',
      darkMode: false
    }
  });

  // Delete account state
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteEligibility, setDeleteEligibility] = useState<{
    canDelete: boolean;
    reasons?: string[];
  } | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // PIN management state
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinDialog, setPinDialog] = useState<'setup' | 'change' | 'disable' | null>(null);
  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  // Bank account management state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [accountForm, setAccountForm] = useState<LinkAccountRequest>({
    account_number: '',
    bank_code: '',
    bank_name: '',
    account_name: '',
    account_type: 'savings',
    currency: 'NGN'
  });
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<string | null>(null);
  const [isRemovingAccount, setIsRemovingAccount] = useState(false);

  // Check PIN status on mount
  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const { pinEnabled: enabled } = await UserService.getPinStatus();
        setPinEnabled(enabled);
      } catch (error) {
        console.error('Error checking PIN status:', error);
      }
    };
    
    checkPinStatus();
  }, []);

  // Load bank accounts when payment view is accessed
  useEffect(() => {
    if (currentView === 'payment') {
      loadBankAccounts();
    }
  }, [currentView]);

  const loadBankAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const accounts = await bankingService.getAccounts();
      setBankAccounts(accounts);
    } catch (error: any) {
      console.error('Error loading bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Prepare the update payload for backend
      const updateData = {
        email: editForm.email,
        first_name: editForm.firstName,
        last_name: editForm.lastName
      };
      
      console.log('ProfileScreen: Updating profile with data:', updateData);
      
      // Call the backend API
      const updatedAuthUser = await authService.updateProfile(updateData);
      console.log('ProfileScreen: Profile updated successfully:', updatedAuthUser);
      
      // Convert the AuthUser response back to User format
      const updatedUser: User = {
        ...user,
        name: combineName(updatedAuthUser.first_name, updatedAuthUser.last_name),
        email: updatedAuthUser.email
        // Keep existing phoneNumber, balance, etc. as they weren't updated
      };
      
      // Update the parent component's state
      onUpdateUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
      
    } catch (error: any) {
      console.error('ProfileScreen: Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    const { firstName, lastName } = splitName(user.name);
    setEditForm({
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    });
    setIsEditing(false);
  };

  const handleSettingToggle = (category: string, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    toast.success('Setting updated');
  };

    const handleSelectChange = (category: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleDeleteAccountClick = async () => {
    setIsCheckingEligibility(true);
    try {
      const eligibility = await UserService.canDeleteAccount();
      setDeleteEligibility(eligibility);
      setDeleteDialog(true);
    } catch (error) {
      toast.error('Failed to check account deletion eligibility');
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // PIN management functions
  const handlePinSetup = async () => {
    setPinLoading(true);
    setPinError('');
    
    try {
      await UserService.setupTransactionPin(pinForm.newPin, pinForm.confirmPin);
      setPinEnabled(true);
      setPinDialog(null);
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
      toast.success('Transaction PIN set successfully');
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Failed to set PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handlePinChange = async () => {
    setPinLoading(true);
    setPinError('');
    
    try {
      await UserService.changeTransactionPin(pinForm.currentPin, pinForm.newPin, pinForm.confirmPin);
      setPinDialog(null);
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
      toast.success('Transaction PIN changed successfully');
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Failed to change PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handlePinDisable = async () => {
    setPinLoading(true);
    setPinError('');
    
    try {
      await UserService.disableTransactionPin(pinForm.currentPin);
      setPinEnabled(false);
      setPinDialog(null);
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
      toast.success('Transaction PIN disabled successfully');
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Failed to disable PIN');
    } finally {
      setPinLoading(false);
    }
  };

  // Bank account management functions
  const handleLinkAccount = async () => {
    if (!accountForm.account_number || !accountForm.bank_code || !accountForm.bank_name || !accountForm.account_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLinkingAccount(true);
      const linkedAccount = await bankingService.linkAccount(accountForm);
      setBankAccounts(prev => [...prev, linkedAccount]);
      setAccountForm({
        account_number: '',
        bank_code: '',
        bank_name: '',
        account_name: '',
        account_type: 'savings',
        currency: 'NGN'
      });
      setShowAddAccountDialog(false);
      toast.success('Bank account linked successfully');
    } catch (error: any) {
      console.error('Error linking account:', error);
      toast.error(error.message || 'Failed to link bank account');
    } finally {
      setIsLinkingAccount(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    try {
      setIsRemovingAccount(true);
      await bankingService.removeAccount(accountId);
      setBankAccounts(prev => prev.filter(account => account.id !== accountId));
      setAccountToRemove(null);
      toast.success('Bank account removed successfully');
    } catch (error: any) {
      console.error('Error removing account:', error);
      toast.error(error.message || 'Failed to remove bank account');
    } finally {
      setIsRemovingAccount(false);
    }
  };

  const handleBankSelection = (bankCode: string) => {
    const bankName = bankingService.getBankName(bankCode);
    setAccountForm(prev => ({
      ...prev,
      bank_code: bankCode,
      bank_name: bankName
    }));
  };

  const handleConfirmDelete = async () => {
    setIsDeletingAccount(true);
    try {
      await UserService.deleteAccount();
      toast.success('Account deleted successfully');
      setDeleteDialog(false);
      // Logout user after successful deletion
      onLogout();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const getVerificationBadge = () => {
    switch (user.verificationLevel) {
      case 'premium':
        return { color: 'from-yellow-400 to-orange-500', text: 'Premium' };
      case 'verified':
        return { color: 'from-green-400 to-emerald-500', text: 'Verified' };
      default:
        return { color: 'from-gray-400 to-gray-500', text: 'Basic' };
    }
  };

  const verificationBadge = getVerificationBadge();

  const renderProfileView = () => (
    <>
      {/* Profile Card */}
      <div className="p-6">
        <div className="backdrop-blur-lg bg-white/30 rounded-3xl p-8 border border-white/40 shadow-2xl">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Camera size={16} className="text-white" />
              </button>
            </div>

            {/* User Info */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="First Name"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="text-center backdrop-blur-md bg-white/30 border-white/40 rounded-2xl"
                  />
                  <Input
                    placeholder="Last Name"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="text-center backdrop-blur-md bg-white/30 border-white/40 rounded-2xl"
                  />
                </div>
                <Input
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="text-center backdrop-blur-md bg-white/30 border-white/40 rounded-2xl"
                />
                <Input
                  placeholder="Phone Number"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="text-center backdrop-blur-md bg-white/30 border-white/40 rounded-2xl"
                  disabled
                  title="Phone number cannot be changed"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    variant="outline"
                    className="flex-1 backdrop-blur-md bg-white/30 border-white/40 rounded-xl hover:bg-white/40 disabled:opacity-50"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl mb-2 text-gray-800">{user.name}</h2>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <p className="text-gray-600 mb-4">{user.phoneNumber}</p>
                
                {/* Verification Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${verificationBadge.color} text-white shadow-lg`}>
                  <Shield size={16} className="mr-2" />
                  {verificationBadge.text}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-6 mb-6">
        <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Account Balance</p>
            <h3 className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="px-6 space-y-4">
        {/* Security */}
        <button
          onClick={() => setCurrentView('security')}
          className="w-full backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30 hover:bg-white/35 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
              <Shield size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-gray-800">Security Settings</h3>
              <p className="text-sm text-gray-600">Manage your security preferences</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </button>

        {/* Account Linking */}
        <button
          onClick={() => setCurrentView('payment')}
          className="w-full backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30 hover:bg-white/35 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-gray-800">Account Linking</h3>
              <p className="text-sm text-gray-600">Manage linked bank accounts</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </button>

        {/* App Settings */}
        <button
          onClick={() => setCurrentView('settings')}
          className="w-full backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30 hover:bg-white/35 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
              <Settings size={20} className="text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-gray-800">App Settings</h3>
              <p className="text-sm text-gray-600">Notifications, language, and more</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </button>

        {/* Logout */}
        <div className="pt-4">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full h-14 backdrop-blur-md bg-red-500/10 border-red-500/30 rounded-2xl hover:bg-red-500/20 text-red-600 transition-all duration-300"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );

  const renderSecurityView = () => (
    <div className="px-6 space-y-6">
      <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
        <h3 className="text-lg mb-4 text-gray-800">Security Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Smartphone size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-800">Biometric Login</p>
                <p className="text-sm text-gray-600">Use fingerprint or face ID</p>
              </div>
            </div>
            <Switch
              checked={settings.security.biometric}
              onCheckedChange={(checked) => handleSettingToggle('security', 'biometric', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Lock size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-800">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Extra security layer</p>
              </div>
            </div>
            <Switch
              checked={settings.security.twoFactor}
              onCheckedChange={(checked) => handleSettingToggle('security', 'twoFactor', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-gray-800">Auto-Lock Timer</p>
                <p className="text-sm text-gray-600">Lock app after inactivity</p>
              </div>
            </div>
            <Select
              value={settings.security.autoLock}
              onValueChange={(value) => handleSelectChange('security', 'autoLock', value)}
            >
              <SelectTrigger className="w-24 backdrop-blur-sm bg-white/30 border-white/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1min">1min</SelectItem>
                <SelectItem value="5min">5min</SelectItem>
                <SelectItem value="15min">15min</SelectItem>
                <SelectItem value="30min">30min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <KeyRound size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-gray-800">Transaction PIN</p>
                <p className="text-sm text-gray-600">
                  {pinEnabled ? 'PIN is enabled for transactions' : 'Set up PIN for transactions'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {pinEnabled ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPinDialog('change')}
                    className="backdrop-blur-sm bg-white/30 border-white/40 text-xs"
                  >
                    Change
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPinDialog('disable')}
                    className="backdrop-blur-sm bg-white/30 border-white/40 text-xs text-red-600"
                  >
                    Disable
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPinDialog('setup')}
                  className="backdrop-blur-sm bg-white/30 border-white/40 text-xs"
                >
                  Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentView = () => (
    <div className="px-6 space-y-6">
      {/* Cards Section - Note about backend limitation */}
      <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
        <h3 className="text-lg mb-4 text-gray-800">Cards</h3>
        
        <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/20">
          <div className="text-center py-8">
            <CreditCard size={40} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Card linking coming soon</p>
            <p className="text-sm text-gray-500">We're working on adding card support to our platform</p>
          </div>
        </div>
      </div>

      {/* Bank Accounts Section - Real implementation */}
      <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-gray-800">Bank Accounts</h3>
          {isLoadingAccounts && (
            <Loader2 size={16} className="text-gray-500 animate-spin" />
          )}
        </div>
        
        <div className="space-y-4">
          {bankAccounts.length === 0 && !isLoadingAccounts ? (
            <div className="backdrop-blur-sm bg-white/30 rounded-xl p-6 border border-white/20 text-center">
              <Landmark size={40} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No bank accounts linked</p>
              <p className="text-sm text-gray-500">Add your first bank account to get started</p>
            </div>
          ) : (
            bankAccounts.map((account) => (
              <div key={account.id} className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                      <Landmark size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{account.bank_name}</p>
                      <p className="text-sm text-gray-600">
                        {bankingService.formatAccountNumber(account.account_number)} • {account.account_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {account.account_name} • {account.currency}
                        {account.is_verified && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAccountToRemove(account.id)}
                    className="text-red-600 hover:text-red-700 transition-colors p-2"
                    disabled={isRemovingAccount}
                  >
                    {isRemovingAccount && accountToRemove === account.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}

          <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
            <DialogTrigger asChild>
              <button className="w-full backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/20 hover:bg-white/40 transition-all duration-300 border-dashed">
                <div className="flex items-center justify-center space-x-2">
                  <Plus size={20} className="text-gray-600" />
                  <span className="text-gray-600">Add Bank Account</span>
                </div>
              </button>
            </DialogTrigger>
            
            <DialogContent className="backdrop-blur-md bg-white/90">
              <DialogHeader>
                <DialogTitle>Link Bank Account</DialogTitle>
                <DialogDescription>
                  Add your bank account details to link it to your wallet
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank
                  </label>
                  <Select 
                    value={accountForm.bank_code} 
                    onValueChange={handleBankSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="044">Access Bank</SelectItem>
                      <SelectItem value="014">Afribank Nigeria Plc</SelectItem>
                      <SelectItem value="023">Citibank Nigeria Limited</SelectItem>
                      <SelectItem value="011">First Bank of Nigeria</SelectItem>
                      <SelectItem value="214">First City Monument Bank</SelectItem>
                      <SelectItem value="070">Fidelity Bank</SelectItem>
                      <SelectItem value="058">Guaranty Trust Bank</SelectItem>
                      <SelectItem value="030">Heritage Bank</SelectItem>
                      <SelectItem value="082">Keystone Bank</SelectItem>
                      <SelectItem value="076">Skye Bank</SelectItem>
                      <SelectItem value="221">Stanbic IBTC Bank</SelectItem>
                      <SelectItem value="068">Standard Chartered Bank</SelectItem>
                      <SelectItem value="232">Sterling Bank</SelectItem>
                      <SelectItem value="032">Union Bank of Nigeria</SelectItem>
                      <SelectItem value="033">United Bank for Africa</SelectItem>
                      <SelectItem value="215">Unity Bank</SelectItem>
                      <SelectItem value="035">Wema Bank</SelectItem>
                      <SelectItem value="057">Zenith Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <Input
                    type="text"
                    placeholder="1234567890"
                    value={accountForm.account_number}
                    onChange={(e) => setAccountForm(prev => ({
                      ...prev,
                      account_number: e.target.value
                    }))}
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={accountForm.account_name}
                    onChange={(e) => setAccountForm(prev => ({
                      ...prev,
                      account_name: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <Select 
                    value={accountForm.account_type} 
                    onValueChange={(value: 'savings' | 'checking' | 'current') => 
                      setAccountForm(prev => ({ ...prev, account_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <Select 
                    value={accountForm.currency} 
                    onValueChange={(value: 'NGN' | 'GBP' | 'USD') => 
                      setAccountForm(prev => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddAccountDialog(false)}
                    className="flex-1"
                    disabled={isLinkingAccount}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLinkAccount}
                    className="flex-1"
                    disabled={isLinkingAccount}
                  >
                    {isLinkingAccount ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Linking...
                      </>
                    ) : (
                      'Link Account'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Remove Account Confirmation */}
      <Dialog open={accountToRemove !== null} onOpenChange={() => setAccountToRemove(null)}>
        <DialogContent className="backdrop-blur-md bg-white/90">
          <DialogHeader>
            <DialogTitle>Remove Bank Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this bank account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setAccountToRemove(null)}
              className="flex-1"
              disabled={isRemovingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => accountToRemove && handleRemoveAccount(accountToRemove)}
              className="flex-1"
              disabled={isRemovingAccount}
            >
              {isRemovingAccount ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                'Remove Account'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderSettingsView = () => (
    <div className="px-6 space-y-6">
      {/* Notifications */}
      <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
        <h3 className="text-lg mb-4 text-gray-800">Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive app notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) => handleSettingToggle('notifications', 'push', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-800">Transaction Alerts</p>
                <p className="text-sm text-gray-600">Get notified of all transactions</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.transactions}
              onCheckedChange={(checked) => handleSettingToggle('notifications', 'transactions', checked)}
            />
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
        <h3 className="text-lg mb-4 text-gray-800">App Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Globe size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-gray-800">Language</p>
                <p className="text-sm text-gray-600">App display language</p>
              </div>
            </div>
            <Select
              value={settings.app.language}
              onValueChange={(value) => handleSelectChange('app', 'language', value)}
            >
              <SelectTrigger className="w-32 backdrop-blur-sm bg-white/30 border-white/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Moon size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-gray-800">Dark Mode</p>
                <p className="text-sm text-gray-600">Use dark theme</p>
              </div>
            </div>
            <Switch
              checked={settings.app.darkMode}
              onCheckedChange={(checked) => handleSettingToggle('app', 'darkMode', checked)}
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="backdrop-blur-md bg-red-50/50 rounded-2xl p-6 border border-red-200/50">
        <h3 className="text-lg mb-4 text-red-800">Danger Zone</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Delete Account</p>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
            </div>
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleDeleteAccountClick}
                  disabled={isCheckingEligibility}
                >
                  {isCheckingEligibility ? 'Checking...' : 'Delete'}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-2xl border-red-200/30">
                <DialogHeader>
                  <DialogTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-red-600">
                    This action cannot be undone. Your account and all associated data will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {deleteEligibility && !deleteEligibility.canDelete && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-yellow-800 font-medium mb-2">Cannot delete account</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {deleteEligibility.reasons?.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {deleteEligibility?.canDelete && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">
                        Are you absolutely sure? This will:
                      </p>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>• Delete your profile and personal information</li>
                        <li>• Remove all transaction history</li>
                        <li>• Close your wallet permanently</li>
                        <li>• Prevent you from accessing the account</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    {deleteEligibility?.canDelete && (
                      <Button
                        variant="destructive"
                        onClick={handleConfirmDelete}
                        disabled={isDeletingAccount}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 backdrop-blur-lg bg-white/20 border-b border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={currentView === 'profile' ? onBack : () => setCurrentView('profile')}
          className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-gray-800">
          {currentView === 'profile' ? 'Profile' :
           currentView === 'security' ? 'Security' :
           currentView === 'payment' ? 'Account Linking' :
           'App Settings'}
        </h2>
        {currentView === 'profile' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="backdrop-blur-md bg-white/20 rounded-full p-2 border border-white/30 hover:bg-white/30"
          >
            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
          </Button>
        )}
        {currentView !== 'profile' && <div className="w-10" />}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {currentView === 'profile' && renderProfileView()}
        {currentView === 'security' && renderSecurityView()}
        {currentView === 'payment' && renderPaymentView()}
        {currentView === 'settings' && renderSettingsView()}
      </div>

      {/* PIN Management Dialogs */}
      {pinDialog && (
        <Dialog open={!!pinDialog} onOpenChange={() => setPinDialog(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-2xl border-blue-200/30">
            <DialogHeader>
              <DialogTitle className="text-gray-800">
                {pinDialog === 'setup' && 'Set Up Transaction PIN'}
                {pinDialog === 'change' && 'Change Transaction PIN'}
                {pinDialog === 'disable' && 'Disable Transaction PIN'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {pinDialog === 'setup' && 'Create a 4-digit PIN to secure your transactions'}
                {pinDialog === 'change' && 'Enter your current PIN and choose a new one'}
                {pinDialog === 'disable' && 'Enter your current PIN to disable transaction security'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {pinError && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                  {pinError}
                </div>
              )}

              {pinDialog !== 'setup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current PIN
                  </label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinForm.currentPin}
                    onChange={(e) => setPinForm(prev => ({ ...prev, currentPin: e.target.value }))}
                    placeholder="Enter current PIN"
                    className="bg-white/50 border-white/20"
                  />
                </div>
              )}

              {pinDialog !== 'disable' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {pinDialog === 'setup' ? 'New PIN' : 'New PIN'}
                    </label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pinForm.newPin}
                      onChange={(e) => setPinForm(prev => ({ ...prev, newPin: e.target.value }))}
                      placeholder="Enter 4-digit PIN"
                      className="bg-white/50 border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm PIN
                    </label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pinForm.confirmPin}
                      onChange={(e) => setPinForm(prev => ({ ...prev, confirmPin: e.target.value }))}
                      placeholder="Confirm PIN"
                      className="bg-white/50 border-white/20"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPinDialog(null)}
                  disabled={pinLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (pinDialog === 'setup') handlePinSetup();
                    else if (pinDialog === 'change') handlePinChange();
                    else if (pinDialog === 'disable') handlePinDisable();
                  }}
                  disabled={pinLoading || 
                    (pinDialog === 'setup' && (!pinForm.newPin || !pinForm.confirmPin)) ||
                    (pinDialog === 'change' && (!pinForm.currentPin || !pinForm.newPin || !pinForm.confirmPin)) ||
                    (pinDialog === 'disable' && !pinForm.currentPin)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {pinLoading ? 'Processing...' : 
                   pinDialog === 'setup' ? 'Set PIN' :
                   pinDialog === 'change' ? 'Change PIN' :
                   'Disable PIN'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}