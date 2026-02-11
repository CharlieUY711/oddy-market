import React from 'react';
import styles from './Loading.module.css';

export const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizeClass = styles[size] || styles.md;
  const containerClass = fullScreen ? styles.fullScreen : styles.container;

  return (
    <div className={containerClass}>
      <div className={`${styles.spinner} ${sizeClass}`} role="status" aria-label="Cargando">
        <span className={styles.visuallyHidden}>Cargando...</span>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'sm' }) => {
  return <Loading size={size} />;
};
