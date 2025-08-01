import { User } from '../App';
import { AuthUser } from '../services/AuthService';

/**
 * Convert AuthUser (backend format) to User (frontend format)
 */
export const authUserToUser = (authUser: AuthUser, balance: number = 0): User => {
  // Combine first_name and last_name into a single name field
  const name = `${authUser.first_name} ${authUser.last_name}`.trim();
  
  return {
    id: authUser.id,
    name: name || 'Unknown User',
    email: authUser.email,
    phoneNumber: authUser.phone_number,
    avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
    balance: balance,
    currency: 'CBUSD',
    verificationLevel: authUser.kyc_status === 'verified' ? 'verified' : 'basic'
  };
};

/**
 * Convert User (frontend format) to partial AuthUser (backend format) for updates
 */
export const userToAuthUserUpdate = (user: User): Partial<Pick<AuthUser, 'email' | 'first_name' | 'last_name'>> => {
  // Split name into first_name and last_name
  const nameParts = user.name.trim().split(' ');
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';
  
  return {
    email: user.email,
    first_name: first_name,
    last_name: last_name
  };
};

/**
 * Extract name parts from a full name string
 */
export const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const nameParts = fullName.trim().split(' ');
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || ''
  };
};

/**
 * Combine first and last name into a full name
 */
export const combineName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};
