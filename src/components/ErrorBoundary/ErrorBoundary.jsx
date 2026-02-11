import React from 'react';
import { Button } from '../Button';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.content}>
            <h1 className={styles.title}>¡Oops! Algo salió mal</h1>
            <p className={styles.message}>
              Lo sentimos, ha ocurrido un error inesperado.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.details}>
                <summary>Detalles del error (solo en desarrollo)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className={styles.actions}>
              <Button variant="primary" onClick={this.handleReset}>
                Intentar de nuevo
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                Ir al inicio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
