import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Switched to modern class property syntax for state and method binding.
  // This is a more robust way to define state and handlers in React class components,
  // resolving compilation errors related to missing properties like 'setState' and 'props'.
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    // This is a simple way to retry rendering. For a more robust solution,
    // you might want to trigger a state update in a parent component.
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-10 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <i className='bx bxs-error-alt text-6xl text-red-500 mb-4'></i>
          <h2 className="text-3xl font-bold text-slate-800">Oups ! Une erreur est survenue.</h2>
          <p className="text-gray-600 mt-2 mb-6">
            Une erreur inattendue s'est produite lors de l'affichage de ce module.
          </p>
          <button 
            onClick={this.handleReload}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Recharger l'application
          </button>
           <details className="mt-6 text-left text-xs text-gray-500">
            <summary className="cursor-pointer">Détails techniques</summary>
            <pre className="mt-2 p-2 bg-slate-100 rounded text-wrap">
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
