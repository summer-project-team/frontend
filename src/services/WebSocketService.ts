/**
 * WebSocket Service for Real-time Updates
 * Handles real-time transaction status updates and deposit confirmations
 */

interface WebSocketMessage {
  type: 'transaction_update' | 'deposit_confirmed' | 'balance_update' | 'notification';
  data: any;
}

interface WebSocketConfig {
  onTransactionUpdate?: (transaction: any) => void;
  onDepositConfirmed?: (deposit: any) => void;
  onBalanceUpdate?: (balance: number) => void;
  onNotification?: (notification: any) => void;
}

class WebSocketServiceClass {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private userId: string | null = null;
  private config: WebSocketConfig = {};

  initialize(userId: string, config: WebSocketConfig = {}) {
    this.userId = userId;
    this.config = config;
    this.connect();
  }

  private connect() {
    if (!this.userId) return;

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws` 
      : 'ws://localhost:3001/ws';

    try {
      this.socket = new WebSocket(`${wsUrl}?userId=${this.userId}`);
      
      this.socket.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('📨 WebSocket message received:', message.type, message.data);

    switch (message.type) {
      case 'transaction_update':
        this.config.onTransactionUpdate?.(message.data);
        break;
      case 'deposit_confirmed':
        this.config.onDepositConfirmed?.(message.data);
        break;
      case 'balance_update':
        this.config.onBalanceUpdate?.(message.data.balance);
        break;
      case 'notification':
        this.config.onNotification?.(message.data);
        break;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.userId = null;
    this.config = {};
  }

  // Send message to server
  send(type: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const WebSocketService = new WebSocketServiceClass();
export default WebSocketService;
