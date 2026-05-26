import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import Card from './Card';
import Button from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          padding: '2rem'
        }}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)' }}>
                ⚠️ Visual Rendering Error
              </div>
            }
            hoverable={false}
            style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}
          >
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
              The application encountered an unexpected rendering exception. Don't worry—your local cached meal logs and offline data are completely safe.
            </p>
            {this.state.error && (
              <pre style={{
                textAlign: 'left',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '0.35rem',
                border: '1px solid var(--border-light)',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                color: 'var(--text-muted)'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <Button onClick={this.handleReset} variant="primary" style={{ width: '100%' }}>
              Try Again / Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
