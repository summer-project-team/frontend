import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Shield, CreditCard, Settings, LogOut, Camera, Check, X, Bell, Lock, Smartphone, Globe, Moon, ChevronRight, Trash2, AlertTriangle, KeyRound, Loader2, Plus, Landmark, User as UserIcon, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { User, Screen } from '../App';
import { UserService } from '../services/UserService';
import { authService } from '../services/AuthService';
import { bankingService, type BankAccount, type LinkAccountRequest } from '../services/BankingService';
import { userToAuthUserUpdate, splitName, combineName } from '../utils/userMapping';

interface ModernProfileScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onNavigate?: (screen: Screen) => void;
  onNavigateToPin?: (config: {
    purpose: 'verify' | 'setup' | 'change';
    title?: string;
    subtitle?: string;
    requireCurrentPin?: boolean;
    onSuccess: (pin: string) => void;
    onCurrentPinVerified?: () => void;
    returnScreen?: Screen;
  }) => void;
}

export function ModernProfileScreen({ user, onBack, onLogout, onUpdateUser, onNavigate, onNavigateToPin }: ModernProfileScreenProps) {
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

  // PIN state
  const [pinEnabled, setPinEnabled] = useState(false);
  const [checkingPinStatus, setCheckingPinStatus] = useState(true);

  // Check PIN status on mount
  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const { pinEnabled: enabled } = await UserService.getPinStatus();
        setPinEnabled(enabled);
      } catch (error) {
        console.error('Error checking PIN status:', error);
      } finally {
        setCheckingPinStatus(false);
      }
    };

    checkPinStatus();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // For now, just update locally without backend call
      // TODO: Implement proper UserService.updateProfile method
      
      // Update the user object with the new data
      const updatedUser: User = {
        ...user,
        name: combineName(editForm.firstName, editForm.lastName),
        first_name: editForm.firstName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
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

  // PIN Management Functions
  const handlePinSetup = () => {
    if (onNavigateToPin) {
      onNavigateToPin({
        purpose: 'setup',
        title: 'Set Up Transaction PIN',
        subtitle: 'Create a secure 4-digit PIN for transactions',
        onSuccess: (pin) => {
          setPinEnabled(true);
          toast.success('Transaction PIN set up successfully!');
        },
        returnScreen: 'profile'
      });
    }
  };

  const handlePinChange = () => {
    if (onNavigateToPin) {
      onNavigateToPin({
        purpose: 'change',
        title: 'Change Transaction PIN',
        subtitle: 'Enter your current PIN and create a new one',
        requireCurrentPin: true,
        onSuccess: (pin) => {
          toast.success('Transaction PIN changed successfully!');
        },
        returnScreen: 'profile'
      });
    }
  };

  const handlePinDisable = () => {
    if (onNavigateToPin) {
      onNavigateToPin({
        purpose: 'verify',
        title: 'Disable Transaction PIN',
        subtitle: 'Enter your PIN to disable transaction security',
        onSuccess: async (pin) => {
          try {
            await UserService.disableTransactionPin(pin);
            setPinEnabled(false);
            toast.success('Transaction PIN disabled successfully!');
          } catch (error: any) {
            toast.error(error.message || 'Failed to disable PIN');
          }
        },
        returnScreen: 'profile'
      });
    }
  };

  const renderProfileView = () => (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="mx-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-6 shadow-2xl border border-white/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-4 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-2xl"></div>
        </div>
        
        {/* Glass overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/5 rounded-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-white/30 shadow-xl">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                {user.first_name?.[0] || user.name[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 border border-white/30">
              <Camera size={16} className="text-white" />
            </button>
          </div>
          
          <h2 className="text-white text-2xl font-bold mb-2">{user.name}</h2>
          <p className="text-white/80 text-sm mb-1">{user.email}</p>
          <p className="text-white/70 text-sm">{user.phoneNumber}</p>
          
          <div className="flex items-center gap-2 mt-3 px-3 py-1 bg-white/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-white/90 text-xs font-medium capitalize">{user.verificationLevel}</span>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="mx-4 space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/20"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/20"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/20"
                    placeholder="Email address"
                    type="email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <Input
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/20"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl h-12 shadow-lg"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check className="mr-2" size={18} />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="px-6 bg-white/50 dark:bg-white/10 border-white/50 dark:border-white/20 rounded-2xl h-12"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Personal Information Card */}
            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <UserIcon size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                    <p className="text-gray-800 dark:text-white font-medium">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Mail size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-gray-800 dark:text-white font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Phone size={18} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="text-gray-800 dark:text-white font-medium">{user.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Options */}
      <div className="mx-4 space-y-3">
        <button
          onClick={() => setCurrentView('security')}
          className="w-full flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-gray-800 dark:text-white font-medium">Security</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">PIN, 2FA, and security settings</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={() => onNavigate?.('bank-accounts')}
          className="w-full flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CreditCard size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-gray-800 dark:text-white font-medium">Bank Accounts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Link and manage accounts</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className="w-full flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Settings size={18} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-left">
              <p className="text-gray-800 dark:text-white font-medium">App Settings</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notifications, language, and more</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:bg-red-50/70 dark:hover:bg-red-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <LogOut size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-red-600 dark:text-red-400 font-medium">Sign Out</p>
              <p className="text-sm text-red-500/70 dark:text-red-400/70">Sign out of your account</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors" />
        </button>
      </div>
    </div>
  );

  // Security view with simplified design for now
  const renderSecurityView = () => (
    <div className="mx-4 space-y-4">
      <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Lock size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Biometric Login</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Use fingerprint or face ID</p>
              </div>
            </div>
            <Switch
              checked={settings.security.biometric}
              onCheckedChange={(checked) => handleSettingToggle('security', 'biometric', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <KeyRound size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Extra security for your account</p>
              </div>
            </div>
            <Switch
              checked={settings.security.twoFactor}
              onCheckedChange={(checked) => handleSettingToggle('security', 'twoFactor', checked)}
            />
          </div>
          
          {/* Transaction PIN Section */}
          <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Shield size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Transaction PIN</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {checkingPinStatus ? 'Checking status...' : 
                     pinEnabled ? 'PIN is currently enabled' : 'Set up a PIN for transactions'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!checkingPinStatus && (
                  <>
                    {!pinEnabled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePinSetup}
                        className="bg-white/50 dark:bg-white/10 border-white/50 dark:border-white/20 hover:bg-white/70 dark:hover:bg-white/20"
                      >
                        Set Up
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePinChange}
                          className="bg-white/50 dark:bg-white/10 border-white/50 dark:border-white/20 hover:bg-white/70 dark:hover:bg-white/20"
                        >
                          Change
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePinDisable}
                          className="bg-red-50/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-500/30 hover:bg-red-100/70 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                        >
                          Disable
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Payment and Settings views can be simplified for now
  const renderPaymentView = () => (
    <div className="mx-4">
      <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Bank Accounts</h3>
        <p className="text-gray-600 dark:text-gray-400">Bank account management coming soon...</p>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="mx-4 space-y-4">
      <div className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/50 dark:border-white/20 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">App Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Bell size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive transaction alerts</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) => handleSettingToggle('notifications', 'push', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Mail size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get updates via email</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) => handleSettingToggle('notifications', 'email', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 backdrop-blur-lg bg-white/30 dark:bg-white/10 border-b border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={currentView === 'profile' ? onBack : () => setCurrentView('profile')}
          className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-2 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-gray-800 dark:text-white font-semibold">
          {currentView === 'profile' ? 'Profile' :
           currentView === 'security' ? 'Security' :
           currentView === 'payment' ? 'Bank Accounts' :
           'App Settings'}
        </h2>
        {currentView === 'profile' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-2 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
          </Button>
        )}
        {currentView !== 'profile' && <div className="w-10" />}
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-6">
        {currentView === 'profile' && renderProfileView()}
        {currentView === 'security' && renderSecurityView()}
        {currentView === 'payment' && renderPaymentView()}
        {currentView === 'settings' && renderSettingsView()}
      </div>
    </div>
  );
}
