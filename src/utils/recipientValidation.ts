import { Recipient } from '../App';

export interface RecipientValidationResult {
  isValid: boolean;
  missingFields: string[];
  validationType: 'app_user' | 'bank_user' | 'unknown';
  canBeFixed: boolean;
  suggestions: string[];
}

export function validateRecipient(recipient: Recipient): RecipientValidationResult {
  const result: RecipientValidationResult = {
    isValid: true,
    missingFields: [],
    validationType: 'unknown',
    canBeFixed: false,
    suggestions: []
  };

  // Determine recipient type
  if (recipient.currency === 'CBUSD') {
    result.validationType = 'app_user';
    
    // For app users, phone number is required
    if (!recipient.phone) {
      result.isValid = false;
      result.missingFields.push('phone');
      result.suggestions.push('Add phone number for app-to-app transfers');
    }
  } else {
    result.validationType = 'bank_user';
    
    // For bank users, account number and bank code are required
    if (!recipient.accountNumber) {
      result.isValid = false;
      result.missingFields.push('accountNumber');
      result.suggestions.push('Add bank account number');
    }
    
    if (!recipient.bankCode) {
      result.isValid = false;
      result.missingFields.push('bankCode');
      result.suggestions.push('Add bank code');
    }
  }

  // Basic fields that all recipients should have
  if (!recipient.name || recipient.name.trim() === '') {
    result.isValid = false;
    result.missingFields.push('name');
    result.suggestions.push('Add recipient name');
  }

  // Determine if this can be automatically fixed
  result.canBeFixed = result.missingFields.length > 0 && !!recipient.name && recipient.name.trim() !== '';

  return result;
}

export function getRecipientTypeFromTransaction(recipient: Recipient): 'app_transfer' | 'bank_withdrawal' {
  if (recipient.currency === 'CBUSD' && recipient.phone) {
    return 'app_transfer';
  } else if (recipient.accountNumber && recipient.bankCode) {
    return 'bank_withdrawal';
  } else {
    // Default based on currency if account details are missing
    return recipient.currency === 'CBUSD' ? 'app_transfer' : 'bank_withdrawal';
  }
}

export function createIncompleteRecipientError(recipient: Recipient, validation: RecipientValidationResult): Error {
  const recipientType = validation.validationType === 'app_user' ? 'app user' : 'bank account';
  const missingFieldsText = validation.missingFields.join(', ');
  
  return new Error(
    `Cannot send money to "${recipient.name}". This ${recipientType} recipient is missing required information: ${missingFieldsText}. ` +
    `Please add this recipient again with complete details or update their information.`
  );
}

export function debugRecipientData(recipient: Recipient): void {
  const validation = validateRecipient(recipient);
  
  console.log('=== RECIPIENT DEBUG INFO ===');
  console.log('Recipient:', recipient.name);
  console.log('ID:', recipient.id);
  console.log('Currency:', recipient.currency);
  console.log('Country:', recipient.country);
  console.log('Validation Result:', validation);
  console.log('Raw Recipient Data:', {
    hasPhone: !!recipient.phone,
    phone: recipient.phone,
    hasAccountNumber: !!recipient.accountNumber,
    accountNumber: recipient.accountNumber,
    hasBankCode: !!recipient.bankCode,
    bankCode: recipient.bankCode,
    bankName: recipient.bankName
  });
  console.log('=== END RECIPIENT DEBUG ===');
}
