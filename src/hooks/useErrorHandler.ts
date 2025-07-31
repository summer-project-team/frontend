import { useState, useCallback } from 'react';
import { parseError, ErrorInfo } from '../utils/errorHandler';
import { toast } from 'sonner';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  autoExpire?: boolean;
  expireAfter?: number; // milliseconds
}

interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  setError: (error: any) => void;
  clearError: () => void;
  handleError: (error: any, customMessage?: string) => void;
  isError: boolean;
}

/**
 * Custom hook for consistent error handling across components
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { 
    showToast = true, 
    autoExpire = false, 
    expireAfter = 5000 
  } = options;
  
  const [error, setErrorState] = useState<ErrorInfo | null>(null);

  const setError = useCallback((error: any) => {
    const errorInfo = typeof error === 'string' 
      ? { message: error, type: 'unknown' as const }
      : parseError(error);
    
    setErrorState(errorInfo);
    
    if (showToast) {
      toast.error(errorInfo.message);
    }
    
    if (autoExpire && expireAfter > 0) {
      setTimeout(() => {
        setErrorState(null);
      }, expireAfter);
    }
  }, [showToast, autoExpire, expireAfter]);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorInfo = parseError(error);
    
    if (customMessage) {
      errorInfo.message = customMessage;
    }
    
    setErrorState(errorInfo);
    
    if (showToast) {
      toast.error(errorInfo.message);
    }
    
    if (autoExpire && expireAfter > 0) {
      setTimeout(() => {
        setErrorState(null);
      }, expireAfter);
    }
  }, [showToast, autoExpire, expireAfter]);

  return {
    error,
    setError,
    clearError,
    handleError,
    isError: error !== null
  };
}

/**
 * Hook specifically for async operations with loading state
 */
export function useAsyncError(options: UseErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options);
  const [isLoading, setIsLoading] = useState(false);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    setIsLoading(true);
    errorHandler.clearError();
    
    try {
      const result = await asyncFn();
      onSuccess?.(result);
      return result;
    } catch (error) {
      errorHandler.handleError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    isLoading,
    executeAsync
  };
}
