import React, { Component, ErrorInfo, ReactNode } from "react";
import { localMonitor } from "../../lib/local-monitor";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    localMonitor.logError(error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="perf-error-boundary-container">
          <div className="perf-error-boundary-card">
            <svg
              className="perf-error-boundary-icon animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="perf-error-boundary-title">¡Ups! Algo salió mal</h1>
            <p className="perf-error-boundary-description">
              Ha ocurrido un error inesperado al cargar la aplicación. Hemos guardado el reporte del error para revisarlo localmente.
            </p>
            <div className="perf-error-boundary-btn-row">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
