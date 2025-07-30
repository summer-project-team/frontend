import { useState, useCallback } from 'react';
import { 
  QuoteRequest, 
  Quote, 
  SendMoneyRequest, 
  WithdrawRequest, 
  Transaction 
} from '../types/transaction';
import TransactionService from '../services/TransactionService';

interface UseTransactionReturn {
  quote: Quote | null;
  transaction: Transaction | null;
  loading: boolean;
  error: Error | null;
  getQuote: (params: QuoteRequest) => Promise<Quote>;
  sendMoney: (params: SendMoneyRequest) => Promise<Transaction>;
  withdraw: (params: WithdrawRequest) => Promise<Transaction>;
  resetState: () => void;
}

export const useTransaction = (): UseTransactionReturn => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const resetState = useCallback(() => {
    setQuote(null);
    setTransaction(null);
    setError(null);
  }, []);

  const getQuote = useCallback(async (params: QuoteRequest): Promise<Quote> => {
    setLoading(true);
    setError(null);
    try {
      const newQuote = await TransactionService.getQuote(params);
      setQuote(newQuote);
      return newQuote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get quote');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMoney = useCallback(async (params: SendMoneyRequest): Promise<Transaction> => {
    setLoading(true);
    setError(null);
    try {
      const newTransaction = await TransactionService.sendMoney(params);
      setTransaction(newTransaction);
      return newTransaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send money');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const withdraw = useCallback(async (params: WithdrawRequest): Promise<Transaction> => {
    setLoading(true);
    setError(null);
    try {
      const newTransaction = await TransactionService.initiateWithdrawal(params);
      setTransaction(newTransaction);
      return newTransaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initiate withdrawal');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    quote,
    transaction,
    loading,
    error,
    getQuote,
    sendMoney,
    withdraw,
    resetState
  };
};
