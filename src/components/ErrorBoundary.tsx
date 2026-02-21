'use client';

import { Component, ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <GlassCard className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                Something went wrong
              </h2>
              <p className="text-sm text-white/60 mb-4">
                An unexpected error occurred
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flux-orange text-black font-medium hover:bg-flux-orange/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorFallback({ 
  message = 'Error loading data', 
  onRetry 
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
      <p className="text-white/70 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
