import React, { useEffect } from 'react';
import styles from './Toast.module.css';

export const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[notification.type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.content}>
        {notification.title && (
          <div className={styles.title}>{notification.title}</div>
        )}
        <div className={styles.message}>{notification.message}</div>
      </div>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};
