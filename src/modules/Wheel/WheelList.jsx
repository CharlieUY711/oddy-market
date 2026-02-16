import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SpinWheel } from '@components/marketing/SpinWheel';
import styles from './Wheel.module.css';

export const WheelList = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/admin-dashboard/marketing')}
        >
          ← Volver a Marketing
        </button>
      </div>
      <div className={styles.content}>
        <SpinWheel mode="admin" />
      </div>
    </div>
  );
};
