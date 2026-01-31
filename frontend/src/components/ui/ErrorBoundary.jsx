import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Error Boundary component to catch React errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {this.props.message || "We encountered an unexpected error. Please try again."}
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleReset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left w-full max-w-lg">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error Details (Dev only)
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * API Error display component
 */
const ApiError = ({ error, onRetry, className }) => {
  const message = error?.response?.data?.message || error?.message || 'An error occurred';
  const statusCode = error?.response?.status;

  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className || ''}`}>
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h4 className="font-medium mb-1">
        {statusCode === 404 ? 'Not Found' : 
         statusCode === 403 ? 'Access Denied' : 
         statusCode === 401 ? 'Unauthorized' :
         statusCode >= 500 ? 'Server Error' : 'Error'}
      </h4>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
};

/**
 * Inline error message
 */
const InlineError = ({ message, className }) => (
  <p className={`text-sm text-destructive flex items-center gap-1 ${className || ''}`}>
    <AlertTriangle className="h-3 w-3" />
    {message}
  </p>
);

export { ErrorBoundary, ApiError, InlineError };
export default ErrorBoundary;
