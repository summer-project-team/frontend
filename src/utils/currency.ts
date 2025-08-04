/**
 * Currency utility functions for proper currency formatting
 */

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  'NGN': { symbol: '₦', code: 'NGN', name: 'Nigerian Naira' },
  'USD': { symbol: '$', code: 'USD', name: 'US Dollar' },
  'GBP': { symbol: '£', code: 'GBP', name: 'British Pound' },
  'CBUSD': { symbol: '$', code: 'CBUSD', name: 'CBUSD' }, // Stablecoin pegged to USD
};

/**
 * Format amount with proper currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code
 * @param showCode - Whether to show currency code alongside symbol
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string, 
  currency: string = 'USD', 
  showCode: boolean = false
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0.00';
  
  // Handle null/undefined currency
  const safeCurrency = currency || 'USD';
  const currencyConfig = CURRENCIES[safeCurrency.toUpperCase()] || CURRENCIES['USD'];
  const formattedAmount = numAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  if (showCode) {
    return `${currencyConfig.symbol}${formattedAmount} ${currencyConfig.code}`;
  }
  
  return `${currencyConfig.symbol}${formattedAmount}`;
}

/**
 * Get currency symbol for a given currency code
 * @param currency - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCIES[currency.toUpperCase()]?.symbol || '$';
}

/**
 * Determine display currency based on transaction type and currencies involved
 * For most transactions, show the original currency used
 * @param transaction - Transaction object
 * @returns The currency to display
 */
export function getDisplayCurrency(transaction: {
  currency?: string;
  recipientCurrency?: string;
  type?: string;
  source_currency?: string;
  target_currency?: string;
}): string {
  // For withdrawals, use the target currency (what the user receives)
  if (transaction.type === 'withdrawal') {
    return transaction.target_currency || transaction.recipientCurrency || 'NGN';
  }
  
  // For deposits, use the source currency (what the user deposited)
  if (transaction.type === 'deposit') {
    return transaction.source_currency || transaction.currency || 'NGN';
  }
  
  // For transfers, use the source currency (what was sent)
  return transaction.source_currency || transaction.currency || 'USD';
}

/**
 * Add flow_type to transactions that don't have it
 * This helps maintain consistent transaction direction display
 */
export function enrichTransactionWithFlowType<T extends {
  type?: string;
  status?: string;
  recipient?: string;
  recipientId?: string;
  flow_type?: 'inflow' | 'outflow';
}>(transaction: T): T & { flow_type: 'inflow' | 'outflow' } {
  if (transaction.flow_type) {
    return transaction as T & { flow_type: 'inflow' | 'outflow' };
  }

  // Determine flow type based on transaction properties
  const isIncoming = transaction.type === 'deposit' || 
                    transaction.type === 'add_money' ||
                    transaction.type === 'bank_deposit' ||
                    transaction.status === 'received' || 
                    transaction.recipient?.toLowerCase().includes('deposit') ||
                    transaction.recipient?.toLowerCase().includes('add money') ||
                    transaction.recipientId === 'deposit' ||
                    (transaction.type === 'transfer' && transaction.status === 'received');

  return {
    ...transaction,
    flow_type: isIncoming ? 'inflow' : 'outflow'
  };
}

/**
 * Format transaction amount with proper currency
 * @param transaction - Transaction object
 * @param showSign - Whether to show +/- sign
 * @returns Formatted amount string
 */
export function formatTransactionAmount(
  transaction: {
    amount: string | number;
    currency?: string;
    recipientCurrency?: string;
    type?: string;
    source_currency?: string;
    target_currency?: string;
    status?: string;
    recipient?: string;
    recipientId?: string;
    flow_type?: 'inflow' | 'outflow'; // Add flow_type field
  },
  showSign: boolean = true
): string {
  const currency = getDisplayCurrency(transaction);
  const formattedAmount = formatCurrency(transaction.amount, currency);
  
  if (!showSign) return formattedAmount;
  
  // Use flow_type if available, otherwise determine from transaction properties
  let isIncoming: boolean;
  
  if (transaction.flow_type) {
    isIncoming = transaction.flow_type === 'inflow';
  } else {
    // Fallback logic for transactions without flow_type
    isIncoming = transaction.type === 'deposit' || 
                transaction.type === 'add_money' ||
                transaction.type === 'bank_deposit' ||
                transaction.status === 'received' || 
                transaction.recipient?.toLowerCase().includes('deposit') ||
                transaction.recipient?.toLowerCase().includes('add money') ||
                transaction.recipientId === 'deposit' ||
                (transaction.type === 'transfer' && transaction.status === 'received');
  }
  
  const sign = isIncoming ? '+' : '-';
  return `${sign}${formattedAmount}`;
}
