import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../Button';
import styles from './ErrorMessage.module.css';

/**
 * Componente para mostrar mensajes de error user-friendly
 * @param {object} props
 * @param {string} props.title - Título del error
 * @param {string} props.message - Mensaje del error
 * @param {Function} props.onRetry - Función para reintentar
 * @param {Function} props.onGoHome - Función para ir al inicio
 * @param {boolean} props.showHomeButton - Mostrar botón de inicio
 * @param {string} props.type - Tipo: 'error' | 'warning' | 'info'
 */
export const ErrorMessage = ({
  title = '¡Oops! Algo salió mal',
  message = 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
  onRetry,
  onGoHome,
  showHomeButton = true,
  type = 'error',
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return <AlertCircle className={styles.icon} />;
    }
  };

  return (
    <div className={`${styles.errorMessage} ${styles[type]} ${className}`}>
      <div className={styles.iconWrapper}>
        {getIcon()}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>
      {(onRetry || onGoHome) && (
        <div className={styles.actions}>
          {onRetry && (
            <Button
              variant="primary"
              size="md"
              onClick={onRetry}
              className={styles.retryButton}
            >
              <RefreshCw className={styles.buttonIcon} />
              Reintentar
            </Button>
          )}
          {showHomeButton && onGoHome && (
            <Button
              variant="outline"
              size="md"
              onClick={onGoHome}
              className={styles.homeButton}
            >
              <Home className={styles.buttonIcon} />
              Ir al inicio
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Componente para error de página completa
 */
export const FullPageError = ({ title, message, onRetry, onGoHome }) => {
  return (
    <div className={styles.fullPageError}>
      <ErrorMessage
        title={title}
        message={message}
        onRetry={onRetry}
        onGoHome={onGoHome}
        showHomeButton={true}
      />
    </div>
  );
};

/**
 * Componente para error inline (en cards, secciones, etc.)
 */
export const InlineError = ({ message, onRetry }) => {
  return (
    <div className={styles.inlineError}>
      <AlertCircle className={styles.inlineIcon} />
      <span className={styles.inlineMessage}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className={styles.inlineRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
};
