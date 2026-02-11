import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title || '',
      message: notification.message || '',
      duration: notification.duration || 5000,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback(
    (message, title = 'Éxito') => {
      return addNotification({ type: 'success', title, message });
    },
    [addNotification]
  );

  const error = useCallback(
    (message, title = 'Error') => {
      return addNotification({ type: 'error', title, message });
    },
    [addNotification]
  );

  const info = useCallback(
    (message, title = 'Información') => {
      return addNotification({ type: 'info', title, message });
    },
    [addNotification]
  );

  const warning = useCallback(
    (message, title = 'Advertencia') => {
      return addNotification({ type: 'warning', title, message });
    },
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
