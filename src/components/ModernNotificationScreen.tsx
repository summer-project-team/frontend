import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, X, Clock, DollarSign, Send, Download, Sparkles, CheckCircle, AlertTriangle, Info, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { NotificationService } from '../services/NotificationService';

interface ModernNotificationScreenProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'transaction' | 'system' | 'security' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: React.ReactNode;
}

export function ModernNotificationScreen({ onBack }: ModernNotificationScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    try {
      setIsLoading(true);
      const userNotifications = NotificationService.getNotifications();
      
      // Transform notifications to include proper icons and fix timestamp
      const transformedNotifications = userNotifications.map(notif => ({
        ...notif,
        timestamp: typeof notif.timestamp === 'number' ? new Date(notif.timestamp).toISOString() : notif.timestamp,
        icon: getNotificationIcon(notif.type)
      }));
      
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <DollarSign size={20} className="text-green-600 dark:text-green-400" />;
      case 'system':
        return <Info size={20} className="text-blue-600 dark:text-blue-400" />;
      case 'security':
        return <AlertTriangle size={20} className="text-orange-600 dark:text-orange-400" />;
      case 'promotion':
        return <Gift size={20} className="text-purple-600 dark:text-purple-400" />;
      default:
        return <Bell size={20} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'bg-green-500/20';
      case 'system':
        return 'bg-blue-500/20';
      case 'security':
        return 'bg-orange-500/20';
      case 'promotion':
        return 'bg-purple-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const markAsRead = (id: string) => {
    try {
      NotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      notifications.forEach(notif => {
        if (!notif.read) {
          NotificationService.markAsRead(notif.id);
        }
      });
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = (id: string) => {
    try {
      NotificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return timestamp;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-gradient-to-tl from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 pt-8 backdrop-blur-lg bg-white/30 dark:bg-white/10 border-b border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{unreadCount}</span>
              </div>
            )}
          </div>
          
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
            >
              <CheckCircle size={20} className="text-gray-700 dark:text-gray-300" />
            </Button>
          ) : (
            <div className="w-10"> {/* Spacer */}</div>
          )}
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 pt-28">
          {notifications.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center">
                  <Bell size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Notifications</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  className={`backdrop-blur-xl rounded-3xl p-6 border shadow-2xl hover:shadow-3xl transition-all duration-500 group ${
                    notification.read 
                      ? 'bg-white/30 dark:bg-white/5 border-white/30 dark:border-white/10' 
                      : 'bg-white/50 dark:bg-white/10 border-white/40 dark:border-white/20 ring-2 ring-indigo-500/20'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-2xl ${getNotificationBackground(notification.type)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {notification.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-xl p-1 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                          >
                            <X size={14} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </span>
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 backdrop-blur-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200/30 dark:border-indigo-500/30 rounded-xl px-3 py-1"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subtle Liquid Glass Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/10 to-transparent dark:from-slate-900/30 dark:via-slate-900/15 dark:to-transparent backdrop-blur-md"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/20"></div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/40 dark:bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
}
