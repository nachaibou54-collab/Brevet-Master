
import React, { ErrorInfo, ReactNode } from 'react';
import { errorTracker } from '../utils/errorTracker';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catch-all component for React errors.
 * Explicitly extends React.Component to resolve inheritance visibility issues for state, props, and setState.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  // Initializing state in the constructor and calling super(props) to satisfy TypeScript's inheritance requirements.
  constructor(props: Props) {
    super(props);
    // Proper initialization of inherited state property.
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Added override keyword for inherited lifecycle method.
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capture the error using the professional tracker.
    errorTracker.captureError(error, { componentStack: errorInfo.componentStack });
  }

  // Using arrow function for proper 'this' binding to the class instance.
  private handleReset = () => {
    // Proper access to inherited setState method.
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleDownloadReport = () => {
    errorTracker.downloadReport();
  };

  // Fixed: render method now correctly overrides React.Component.render
  public override render(): ReactNode {
    // Accessing 'state' inherited from React.Component to check for captured errors.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner animate-bounce">
              🩹
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">Oups, un petit bug !</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Désolé, l'application a rencontré un problème technique inattendu. Tes données de session ont été sauvegardées.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                Retourner à l'accueil
              </button>
              
              <button
                onClick={this.handleDownloadReport}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                📥 Télécharger le rapport technique
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
              >
                Actualiser la page
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <details className="text-left group">
                <summary className="text-[10px] font-black text-slate-400 cursor-pointer uppercase tracking-[0.2em] mb-2 list-none text-center hover:text-slate-600">
                  Détails techniques (pour support)
                </summary>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto">
                  <pre className="text-[10px] text-slate-500 font-mono whitespace-pre-wrap break-all">
                    {/* Accessing error details from the inherited state. */}
                    {this.state.error?.message}
                    {"\n\n"}
                    {this.state.error?.stack}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    // Accessing 'props' inherited from React.Component to render child elements.
    return this.props.children;
  }
}
