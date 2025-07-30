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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 backdrop-blur-lg bg-white/20 dark:bg-black/20 border-b border-gray-200/30 dark:border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/20 dark:bg-white/10 rounded-full p-2 border border-gray-200/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
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
            className="text-sm text-blue-600 dark:text-blue-400"
          >
            Mark all read
          </Button>
        )}
        {unreadCount === 0 && <div className="w-20" />}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Bell size={48} className="text-gray-400 mb-4" />
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
                            <Check size={16} className="text-blue-500" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <X size={16} className="text-red-500" />
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