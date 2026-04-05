import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { AppCard } from '@/Components/data-display/AppCard';

interface ReactPageErrorBoundaryProps {
    children: ReactNode;
}

interface ReactPageErrorBoundaryState {
    hasError: boolean;
    message?: string;
}

export class ReactPageErrorBoundary extends Component<
    ReactPageErrorBoundaryProps,
    ReactPageErrorBoundaryState
> {
    state: ReactPageErrorBoundaryState = {
        hasError: false,
        message: undefined,
    };

    static getDerivedStateFromError(error: Error): ReactPageErrorBoundaryState {
        return {
            hasError: true,
            message: error.message,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('React page render failed.', error, errorInfo);
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="min-h-screen bg-app-glow px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <AppCard className="border-rose-200/80 bg-white/95 p-8 shadow-surface">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600 ring-1 ring-rose-100">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-600">
                                    Render Error
                                </p>
                                <h1 className="text-2xl font-semibold text-slate-950">
                                    This page could not finish loading
                                </h1>
                                <p className="text-sm leading-6 text-slate-600">
                                    The frontend hit an unexpected render error. Refresh the page once, and if it
                                    still appears, use the message below for debugging.
                                </p>
                                {this.state.message ? (
                                    <pre className="overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
                                        {this.state.message}
                                    </pre>
                                ) : null}
                            </div>
                        </div>
                    </AppCard>
                </div>
            </div>
        );
    }
}
