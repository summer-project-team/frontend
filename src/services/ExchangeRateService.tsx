export class ExchangeRateService {
  private static rates: { [key: string]: number } = {
    'NGN': 1580.25,   // Updated to match backend base rate
    'GBP': 0.7842,    // USD to GBP
    'EUR': 0.8567,    // USD to EUR  
    'CBUSD': 1.0      // CBUSD pegged to USD
  };

  private static baseRates: { [key: string]: number } = {
    'NGN': 1580.25,
    'GBP': 0.7842,
    'EUR': 0.8567,
    'CBUSD': 1.0
  };

  private static lastUpdate: number = Date.now();
  private static updateInterval: NodeJS.Timeout | null = null;

  static initialize() {
    console.log('Initializing Exchange Rate Service with enhanced local model');
    // Start rate fluctuation simulation
    this.startRateUpdates();
  }

  static getRates() {
    return { ...this.rates };
  }

  static getRate(currency: string): number {
    return this.rates[currency] || 1;
  }

  static getLastUpdate(): number {
    return this.lastUpdate;
  }

  /**
   * Get exchange rate between two currencies
   * @param from Source currency 
   * @param to Target currency
   * @returns Exchange rate
   */
  static getCrossRate(from: string, to: string): number {
    if (from === to) return 1;

    const fromRate = this.rates[from] || 1;
    const toRate = this.rates[to] || 1;

    // If both are against USD, calculate cross rate
    if (from === 'USD') {
      return toRate;
    } else if (to === 'USD') {
      return 1 / fromRate;
    } else {
      // Cross rate calculation: FROM -> USD -> TO
      return toRate / fromRate;
    }
  }

  private static startRateUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateRates();
    }, 30000); // Update every 30 seconds

    // Initial update
    this.updateRates();
  }

  private static updateRates() {
    const now = new Date();
    const timeOfDay = now.getHours() + (now.getMinutes() / 60);
    const dayOfWeek = now.getDay();

    // Apply realistic market-based fluctuations
    Object.keys(this.rates).forEach(currency => {
      if (currency === 'CBUSD') {
        // CBUSD is a stablecoin, minimal fluctuation
        const baseRate = this.baseRates[currency];
        const minimalFluctuation = (Math.random() - 0.5) * 0.002; // ±0.1%
        this.rates[currency] = baseRate * (1 + minimalFluctuation);
        return;
      }

      const baseRate = this.baseRates[currency];
      let fluctuation = 0;

      // Base random fluctuation
      fluctuation += (Math.random() - 0.5) * 0.01; // ±0.5%

      // Time-based fluctuations (market hours)
      if (timeOfDay >= 8 && timeOfDay <= 17) {
        // Higher volatility during business hours
        fluctuation += (Math.random() - 0.5) * 0.008;
      } else {
        // Lower volatility outside business hours  
        fluctuation += (Math.random() - 0.5) * 0.003;
      }

      // Weekend effects (lower volatility)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        fluctuation *= 0.5;
      }

      // Currency-specific volatility
      const volatilityMultipliers: { [key: string]: number } = {
        'NGN': 1.5,    // Higher volatility for emerging market currencies
        'GBP': 1.0,    // Standard volatility
        'EUR': 0.8,    // Lower volatility for stable currencies
        'CBUSD': 0.1   // Stablecoin, minimal volatility
      };

      const multiplier = volatilityMultipliers[currency] || 1.0;
      fluctuation *= multiplier;

      // Ensure fluctuation doesn't exceed reasonable bounds (±3%)
      fluctuation = Math.max(-0.03, Math.min(0.03, fluctuation));

      const newRate = baseRate * (1 + fluctuation);
      
      // Ensure rates don't drift too far from base rates (±10%)
      const maxDeviation = 0.1;
      const deviation = (newRate - baseRate) / baseRate;
      
      if (Math.abs(deviation) > maxDeviation) {
        this.rates[currency] = baseRate * (1 + Math.sign(deviation) * maxDeviation);
      } else {
        this.rates[currency] = newRate;
      }
    });

    this.lastUpdate = Date.now();
    console.log('Exchange rates updated:', this.rates);
  }

  static formatRate(rate: number, currency: string): string {
    // Format based on currency characteristics
    if (currency === 'NGN') {
      return rate.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    }
    
    if (currency === 'GBP' || currency === 'EUR') {
      return rate.toLocaleString('en-US', { 
        minimumFractionDigits: 4,
        maximumFractionDigits: 4 
      });
    }
    
    return rate.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 4 
    });
  }

  static getChangeIndicator(currency: string): 'up' | 'down' | 'neutral' {
    const currentRate = this.rates[currency];
    const baseRate = this.baseRates[currency];
    const change = (currentRate - baseRate) / baseRate;
    
    if (change > 0.001) return 'up';   // >0.1% increase
    if (change < -0.001) return 'down'; // >0.1% decrease
    return 'neutral';
  }

  static getChangePercentage(currency: string): number {
    const currentRate = this.rates[currency];
    const baseRate = this.baseRates[currency];
    return ((currentRate - baseRate) / baseRate) * 100;
  }

  /**
   * Get market status based on current time
   * @returns Market status information
   */
  static getMarketStatus(): { 
    status: 'open' | 'closed' | 'weekend';
    nextOpen?: string;
    timezone: string;
  } {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const dayOfWeek = now.getUTCDay();

    // Weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        status: 'weekend',
        nextOpen: 'Monday 09:00 UTC',
        timezone: 'UTC'
      };
    }

    // Market hours (9 AM - 5 PM UTC weekdays)
    if (utcHour >= 9 && utcHour < 17) {
      return {
        status: 'open',
        timezone: 'UTC'
      };
    }

    return {
      status: 'closed',
      nextOpen: utcHour < 9 ? 'Today 09:00 UTC' : 'Tomorrow 09:00 UTC',
      timezone: 'UTC'
    };
  }

  /**
   * Cleanup method to clear intervals
   */
  static cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}