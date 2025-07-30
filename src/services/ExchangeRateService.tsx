export class ExchangeRateService {
  private static rates: { [key: string]: number } = {
    'NGN': 1532.50,
    'KES': 128.40,
    'GHS': 12.85,
    'UGX': 3750.20,
    'TZS': 2380.75
  };

  private static baseRates: { [key: string]: number } = {
    'NGN': 1532.50,
    'KES': 128.40,
    'GHS': 12.85,
    'UGX': 3750.20,
    'TZS': 2380.75
  };

  private static lastUpdate: number = Date.now();

  static initialize() {
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

  private static startRateUpdates() {
    setInterval(() => {
      this.updateRates();
    }, 30000); // Update every 30 seconds
  }

  private static updateRates() {
    // Simulate realistic currency fluctuations (±0.5% to ±2%)
    Object.keys(this.rates).forEach(currency => {
      const baseRate = this.baseRates[currency];
      const fluctuation = (Math.random() - 0.5) * 0.04; // ±2% max change
      const newRate = baseRate * (1 + fluctuation);
      
      // Ensure rates don't drift too far from base rates
      const maxDeviation = 0.1; // ±10% from base rate
      const deviation = (newRate - baseRate) / baseRate;
      
      if (Math.abs(deviation) > maxDeviation) {
        this.rates[currency] = baseRate * (1 + Math.sign(deviation) * maxDeviation);
      } else {
        this.rates[currency] = newRate;
      }
    });

    this.lastUpdate = Date.now();
  }

  static formatRate(rate: number, currency: string): string {
    if (currency === 'NGN' || currency === 'UGX' || currency === 'TZS') {
      return rate.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    }
    return rate.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  }

  static getChangeIndicator(currency: string): 'up' | 'down' | 'neutral' {
    const currentRate = this.rates[currency];
    const baseRate = this.baseRates[currency];
    const change = (currentRate - baseRate) / baseRate;
    
    if (change > 0.001) return 'up';
    if (change < -0.001) return 'down';
    return 'neutral';
  }

  static getChangePercentage(currency: string): number {
    const currentRate = this.rates[currency];
    const baseRate = this.baseRates[currency];
    return ((currentRate - baseRate) / baseRate) * 100;
  }
}