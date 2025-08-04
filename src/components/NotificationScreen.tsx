import React, { useState } from 'react';
import { ArrowLeft, Bell, Check, X, Clock, DollarSign, Send, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Screen } from '../App';

interface NotificationScreenProps {
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

export function NotificationScreen({ onBack }: NotificationScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Notifications will be populated dynamically based on user events
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pt-12 backdrop-blur-lg bg-white/30 dark:bg-white/10 border-b border-white/30 dark:border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full p-2 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="text-center">
          <h2 className="text-gray-800 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full px-3 py-1 border border-white/30 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/20 text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="pt-24 pb-24 flex-1 overflow-y-auto">{/* Add pt-24 for header space and pb-24 for footer space */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Bell size={32} className="text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center px-6">No notifications yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center px-6 mt-2">
              You'll see transaction updates, security alerts, and other important information here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  notification.read
                    ? 'bg-gray-50/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10'
                    : 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-500/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          notification.read 
                            ? 'text-gray-800 dark:text-gray-200' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Check size={14} className="text-blue-500" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <X size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
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