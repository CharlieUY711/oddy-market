import React from 'react';
import { Button } from '../Button';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Log to error tracking service (e.g., Sentry)
    // TODO: Integrate with Sentry when configured
    // Sentry.captureException(error, { extra: errorInfo });

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Optionally reload the page if too many errors
    if (this.state.errorCount >= 3) {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI can be passed as prop
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default error UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h1 className={styles.errorTitle}>¡Oops! Algo salió mal</h1>
            <p className={styles.errorMessage}>
              {this.state.errorCount >= 3
                ? 'Parece que hay un problema persistente. Por favor, recarga la página.'
                : 'Ocurrió un error inesperado. Puedes intentar de nuevo.'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorDetailsSummary}>
                  Ver detalles del error (modo desarrollo)
                </summary>
                <div className={styles.errorDetailsContent}>
                  <p className={styles.errorName}>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className={styles.errorStack}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className={styles.errorActions}>
              {this.state.errorCount < 3 ? (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={this.handleReset}
                  >
                    Intentar de nuevo
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={this.handleGoHome}
                  >
                    Ir al inicio
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={this.handleReload}
                >
                  Recargar página
                </Button>
              )}
            </div>

            {this.props.contactSupport && (
              <p className={styles.errorSupport}>
                Si el problema persiste, <a href="/contact">contacta a soporte</a>
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar ErrorBoundary de forma funcional
 * Útil para capturar errores específicos
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};
