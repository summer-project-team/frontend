export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'transaction' | 'system' | 'security' | 'promotion';
    timestamp: number;
    read: boolean;
    data?: any;
    priority: 'low' | 'medium' | 'high';
  }
  
  class NotificationServiceClass {
    private notifications: Notification[] = [];
    private listeners: ((notifications: Notification[]) => void)[] = [];
    private userId: string | null = null;
  
    initialize(userId: string) {
      this.userId = userId;
      this.loadNotifications();
      this.startPeriodicCheck();
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  
    private loadNotifications() {
      if (this.userId) {
        const saved = localStorage.getItem(`notifications_${this.userId}`);
        if (saved) {
          this.notifications = JSON.parse(saved);
          this.notifyListeners();
        }
      }
    }
  
    private saveNotifications() {
      if (this.userId) {
        localStorage.setItem(`notifications_${this.userId}`, JSON.stringify(this.notifications));
      }
    }
  
    private startPeriodicCheck() {
      // Check for new notifications every 30 seconds
      setInterval(() => {
        this.checkForNewNotifications();
      }, 30000);
    }
  
    private checkForNewNotifications() {
      // Simulate checking for new notifications from server
      const now = Date.now();
      const randomChecks = [
        {
          chance: 0.05, // 5% chance every check
          notification: {
            title: 'Exchange Rate Alert',
            message: 'USD to NGN rate has improved! Great time to send money.',
            type: 'system' as const,
            priority: 'medium' as const,
          }
        },
        {
          chance: 0.02, // 2% chance
          notification: {
            title: 'Security Notice',
            message: 'New login detected from a different device.',
            type: 'security' as const,
            priority: 'high' as const,
          }
        },
        {
          chance: 0.03, // 3% chance
          notification: {
            title: 'Limited Time Offer',
            message: 'Send money with 0% fees this weekend!',
            type: 'promotion' as const,
            priority: 'medium' as const,
          }
        }
      ];
  
      randomChecks.forEach(check => {
        if (Math.random() < check.chance) {
          this.addNotification({
            ...check.notification,
          });
        }
      });
    }
  
    addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
      const newNotification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        read: false,
        ...notification,
      };
  
      this.notifications.unshift(newNotification);
      this.saveNotifications();
      this.notifyListeners();
      this.showBrowserNotification(newNotification);
  
      return newNotification;
    }
  
    private showBrowserNotification(notification: Notification) {
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png', // App icon
          badge: '/badge-72x72.png',
          tag: notification.id,
          requireInteraction: notification.priority === 'high',
        });
  
        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
        };
  
        // Auto close after 5 seconds for non-high priority notifications
        if (notification.priority !== 'high') {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }
      }
    }
  
    // Transaction-specific notifications
    addTransactionNotification(type: 'sent' | 'received' | 'completed' | 'failed', recipientName: string, amount: string, currency: string) {
      let title = '';
      let message = '';
      let priority: 'low' | 'medium' | 'high' = 'medium';
  
      switch (type) {
        case 'sent':
          title = 'Money Sent Successfully';
          message = `$${amount} sent to ${recipientName}`;
          break;
        case 'received':
          title = 'Money Received';
          message = `You received $${amount} from ${recipientName}`;
          break;
        case 'completed':
          title = 'Transaction Completed';
          message = `Your transfer of $${amount} to ${recipientName} has been completed`;
          break;
        case 'failed':
          title = 'Transaction Failed';
          message = `Your transfer of $${amount} to ${recipientName} could not be processed`;
          priority = 'high';
          break;
      }
  
      return this.addNotification({
        title,
        message,
        type: 'transaction',
        priority,
        data: { recipientName, amount, currency, transactionType: type }
      });
    }
  
    getNotifications(): Notification[] {
      return [...this.notifications];
    }
  
    getUnreadCount(): number {
      return this.notifications.filter(n => !n.read).length;
    }
  
    markAsRead(notificationId: string) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        this.saveNotifications();
        this.notifyListeners();
      }
    }
  
    markAllAsRead() {
      let hasChanges = false;
      this.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        this.saveNotifications();
        this.notifyListeners();
      }
    }
  
    deleteNotification(notificationId: string) {
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        this.notifications.splice(index, 1);
        this.saveNotifications();
        this.notifyListeners();
      }
    }
  
    clearAll() {
      this.notifications = [];
      this.saveNotifications();
      this.notifyListeners();
    }
  
    subscribe(listener: (notifications: Notification[]) => void) {
      this.listeners.push(listener);
      // Immediately call with current notifications
      listener([...this.notifications]);
      
      return () => {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
          this.listeners.splice(index, 1);
        }
      };
    }
  
    private notifyListeners() {
      this.listeners.forEach(listener => {
        listener([...this.notifications]);
      });
    }
  
    // Cleanup when user logs out
    cleanup() {
      this.notifications = [];
      this.listeners = [];
      this.userId = null;
    }
  }
  
  export const NotificationService = new NotificationServiceClass();