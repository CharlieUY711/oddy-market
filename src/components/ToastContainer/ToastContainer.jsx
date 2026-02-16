import React from 'react';
import { useNotifications } from '@context/NotificationContext';
import { Toast } from '../Toast';
import styles from './ToastContainer.module.css';

export const ToastContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};
