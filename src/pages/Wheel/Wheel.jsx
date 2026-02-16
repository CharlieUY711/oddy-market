import React, { useState, useEffect } from 'react';
import { SpinWheel } from '@components/marketing/SpinWheel';
import { wheelService } from '@services/wheelService';
import { useNotifications } from '@context/NotificationContext';
import styles from './Wheel.module.css';

export const Wheel = () => {
  const { error } = useNotifications();
  const [activeWheel, setActiveWheel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveWheel();
  }, []);

  async function loadActiveWheel() {
    try {
      setLoading(true);
      const data = await wheelService.getActive();
      if (data.wheel) {
        setActiveWheel(data.wheel);
      }
    } catch (err) {
      console.error('Error loading active wheel:', err);
      error('Error al cargar la rueda de la suerte');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando rueda de la suerte...</p>
        </div>
      </div>
    );
  }

  if (!activeWheel) {
    return (
      <div className={styles.container}>
        <div className={styles.noWheel}>
          <h1>🎡 Rueda de la Suerte</h1>
          <p>No hay ninguna rueda activa en este momento.</p>
          <p className={styles.subtext}>
            Vuelve pronto para participar y ganar increíbles premios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎡 {activeWheel.name}</h1>
        {activeWheel.description && (
          <p className={styles.description}>{activeWheel.description}</p>
        )}
      </div>
      <div className={styles.wheelWrapper}>
        <SpinWheel mode="public" />
      </div>
    </div>
  );
};
