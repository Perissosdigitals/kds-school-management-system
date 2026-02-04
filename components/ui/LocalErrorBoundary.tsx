import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class LocalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.componentName || 'Component'}:`, error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-red-800 font-semibold flex items-center gap-2">
                        <i className='bx bx-error-circle'></i>
                        Erreur de rendu ({this.props.componentName})
                    </h2>
                    <p className="text-red-600 text-sm mt-1">
                        {this.state.error?.message}
                    </p>
                    <details className="mt-2 text-xs text-red-500 font-mono whitespace-pre-wrap">
                        <summary className="cursor-pointer hover:text-red-700">Détails techniques</summary>
                        {this.state.error?.stack}
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                        Réessayer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
