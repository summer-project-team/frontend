import React, { useState } from 'react';
import { ArrowLeft, Gift, Star, Trophy, Zap, Crown, Coins } from 'lucide-react';
import { Button } from './ui/button';

interface ModernRewardsScreenProps {
  onBack: () => void;
  user?: {
    id: string;
    transactionCount?: number;
    loginStreak?: number;
    totalLogins?: number;
    points?: number;
  } | null;
}

export function ModernRewardsScreen({ onBack, user }: ModernRewardsScreenProps) {
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  // User stats with defaults
  const transactionCount = user?.transactionCount || 0;
  const totalLogins = user?.totalLogins || 1; // At least 1 since they're logged in
  const userPoints = user?.points || 450; // Mock user points

  // Calculate reward progress dynamically
  const getFirstTransactionProgress = () => {
    return transactionCount >= 1 ? 100 : 0;
  };

  const getFrequentSenderProgress = () => {
    // Every 3 transactions = 10% progress, max 100%
    const progressPer3Transactions = Math.floor(transactionCount / 3) * 10;
    return Math.min(progressPer3Transactions, 100);
  };

  const getDailyLoginProgress = () => {
    // Every 5 logins = 10% progress, max 100%
    const progressPer5Logins = Math.floor(totalLogins / 5) * 10;
    return Math.min(progressPer5Logins, 100);
  };

  const availableRewards = [
    {
      id: '1',
      title: 'First Transaction Bonus',
      description: 'Complete your first transaction and earn 100 points',
      points: 100,
      icon: Zap,
      progress: getFirstTransactionProgress(),
      completed: getFirstTransactionProgress() >= 100,
      type: 'achievement'
    },
    {
      id: '2',
      title: 'Frequent Sender',
      description: 'Send money 10 times this month',
      points: 250,
      icon: Trophy,
      progress: getFrequentSenderProgress(),
      completed: getFrequentSenderProgress() >= 100,
      type: 'challenge'
    },
    {
      id: '3',
      title: 'Refer a Friend',
      description: 'Invite friends and earn 500 points per referral',
      points: 500,
      icon: Crown,
      progress: 0,
      completed: false,
      type: 'referral'
    },
    {
      id: '4',
      title: 'Daily Login Streak',
      description: 'Login for 7 consecutive days',
      points: 150,
      icon: Star,
      progress: getDailyLoginProgress(),
      completed: getDailyLoginProgress() >= 100,
      type: 'daily'
    }
  ];

  const rewardsHistory = [
    {
      id: '1',
      title: 'Welcome Bonus',
      points: 50,
      date: '2025-08-01',
      type: 'earned'
    },
    {
      id: '2',
      title: 'First Transaction Bonus',
      points: 100,
      date: '2025-08-02',
      type: 'earned'
    },
    {
      id: '3',
      title: 'Coffee Voucher',
      points: -200,
      date: '2025-08-02',
      type: 'redeemed'
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400';
      case 'challenge': return 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400';
      case 'referral': return 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400';
      case 'daily': return 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 bg-gray-50/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="bg-white dark:bg-gray-800 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Rewards</h1>
        <div className="w-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24">
        {/* Points Summary */}
        <div className="p-4">
          <div className="bg-blue-600 dark:bg-blue-500 rounded-3xl p-6 border border-blue-500 dark:border-blue-400">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins size={32} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold mb-1">{userPoints.toLocaleString()}</h2>
              <p className="text-white/80">Total Points</p>
              <div className="mt-4">
                <Button className="bg-gray-200 hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-100 text-blue-600 border-gray-200 dark:border-gray-200">
                  Redeem Points
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${
              activeTab === 'available'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Gift size={18} />
            <span className="font-medium">Available</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Trophy size={18} />
            <span className="font-medium">History</span>
          </button>
        </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'available' ? (
          <div className="space-y-4">
            {availableRewards.map((reward) => {
              const IconComponent = reward.icon;
              return (
                <div
                  key={reward.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 ${
                    reward.completed ? 'ring-2 ring-green-500/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getTypeColor(reward.type)}`}>
                      <IconComponent size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{reward.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{reward.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600 dark:text-indigo-400">+{reward.points}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                      
                      {!reward.completed && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-gray-800 dark:text-white font-medium">{reward.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(reward.progress)}`}
                              style={{ width: `${Math.min(reward.progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {reward.completed && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                          <Trophy size={16} />
                          <span>Completed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {rewardsHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      item.type === 'earned' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {item.type === 'earned' ? '+' : ''}{item.points}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-20 pointer-events-none bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800">
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
}
