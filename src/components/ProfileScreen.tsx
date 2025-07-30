import React, { useState } from 'react';
import { ArrowLeft, Edit3, Shield, CreditCard, Settings, LogOut, Camera, Check, X, Bell, Lock, Smartphone, Globe, Moon, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { User } from '../App';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export function ProfileScreen({ user, onBack, onLogout, onUpdateUser }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentView, setCurrentView] = useState<'profile' | 'security' | 'payment' | 'settings'>('profile');
  const [editForm, setEditForm] = useState({
    name: user.name,
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

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editForm };
    onUpdateUser(updatedUser);
    localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user.name,
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

  const handleSelectChange = (category: string, setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    toast.success('Setting updated');
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
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-center backdrop-blur-md bg-white/30 border-white/40 rounded-2xl"
                />
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="text-center backdrop-blur-md bg-white/30 border-white/40 rounded-2xl"
                />
                <Input
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="text-center backdrop-blur-md bg-white/30 border-white/40 rounded-2xl"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl"
                  >
                    <Check size={16} className="mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1 backdrop-blur-md bg-white/30 border-white/40 rounded-xl hover:bg-white/40"
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

        {/* Payment Methods */}
        <button
          onClick={() => setCurrentView('payment')}
          className="w-full backdrop-blur-md bg-white/25 rounded-2xl p-4 border border-white/30 hover:bg-white/35 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-gray-800">Payment Methods</h3>
              <p className="text-sm text-gray-600">Manage cards and bank accounts</p>
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
        </div>
      </div>
    </div>
  );

  const renderPaymentView = () => (
    <div className="px-6 space-y-6">
      <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
        <h3 className="text-lg mb-4 text-gray-800">Payment Methods</h3>
        
        <div className="space-y-4">
          <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-800">•••• •••• •••• 4532</p>
                  <p className="text-sm text-gray-600">Visa - Expires 12/25</p>
                </div>
              </div>
              <button className="text-red-600 hover:text-red-700 transition-colors">
                Remove
              </button>
            </div>
          </div>

          <button className="w-full backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/20 hover:bg-white/40 transition-all duration-300 border-dashed">
            <div className="flex items-center justify-center space-x-2">
              <CreditCard size={20} className="text-gray-600" />
              <span className="text-gray-600">Add New Card</span>
            </div>
          </button>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/25 rounded-2xl p-6 border border-white/30">
        <h3 className="text-lg mb-4 text-gray-800">Bank Accounts</h3>
        
        <div className="space-y-4">
          <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800">Chase Bank</p>
                <p className="text-sm text-gray-600">•••• •••• 4532</p>
              </div>
              <button className="text-red-600 hover:text-red-700 transition-colors">
                Remove
              </button>
            </div>
          </div>

          <button className="w-full backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/20 hover:bg-white/40 transition-all duration-300 border-dashed">
            <div className="flex items-center justify-center space-x-2">
              <CreditCard size={20} className="text-gray-600" />
              <span className="text-gray-600">Add Bank Account</span>
            </div>
          </button>
        </div>
      </div>
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
           currentView === 'payment' ? 'Payment Methods' :
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
    </div>
  );
}