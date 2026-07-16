import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "wouter";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-muted-foreground">
            Something went wrong. Please try again.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Reload page
            </button>
            <Link
              href="/"
              className="rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Go home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
