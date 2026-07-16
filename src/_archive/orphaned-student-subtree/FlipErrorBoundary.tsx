import React from "react";

interface FlipErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: (error: Error) => void;
}

interface FlipErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches any runtime error thrown by the flipbook (react-pageflip) — e.g.
 * calling pageFlip() before the instance is ready, or accessing DOM geometry
 * during layout — and renders a safe fallback instead of white-screening the
 * entire route. This is what was missing: there was no error boundary above
 * the flipbook, so any throw took down the whole /cartilla/student/libro page.
 */
export class FlipErrorBoundary extends React.Component<
  FlipErrorBoundaryProps,
  FlipErrorBoundaryState
> {
  constructor(props: FlipErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): FlipErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[FlipErrorBoundary] flipbook crashed:", error, info);
    }
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
