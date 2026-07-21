'use client';

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary — WS4 reliability.
 * Catches render errors in children, shows fallback UI instead of crash.
 * Used around Canvas, Inspector, Timeline, and individual panels.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
          <p className="font-medium mb-1">Something went wrong</p>
          <p className="text-red-500">{this.state.error?.message ?? 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
