import React from 'react';
import { XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ErrorInfo } from '../utils/errorHandler';

interface ErrorDisplayProps {
  error: ErrorInfo | null;
  onDismiss?: () => void;
  showSuggestions?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onDismiss, 
  showSuggestions = true,
  className = '' 
}) => {
  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'authentication':
      case 'validation':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'network':
      case 'server':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.type) {
      case 'authentication':
      case 'validation':
        return 'bg-amber-50 border-amber-200';
      case 'network':
      case 'server':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (error.type) {
      case 'authentication':
      case 'validation':
        return 'text-amber-800';
      case 'network':
      case 'server':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {error.message}
          </p>
          
          {showSuggestions && error.suggestions && error.suggestions.length > 0 && (
            <div className="mt-2">
              <p className={`text-xs font-medium ${getTextColor()} mb-1`}>
                What you can try:
              </p>
              <ul className={`text-xs ${getTextColor()} space-y-1`}>
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto flex-shrink-0">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white`}
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
