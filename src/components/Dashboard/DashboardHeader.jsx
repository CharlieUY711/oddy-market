import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaStore } from 'react-icons/fa';
import styles from './DashboardHeader.module.css';

/**
 * DashboardHeader - Encabezado estandarizado para todas las vistas del dashboard
 * 
 * @param {string} title - El título que se mostrará en el encabezado
 * @param {string} className - Clases CSS adicionales (opcional)
 */
const DashboardHeader = ({ title, className = '' }) => {
  const navigate = useNavigate();

  return (
    <header className={`${styles.dashboardHeader} ${className}`}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.iconGroup}>
        <button
          className={styles.iconBtn}
          onClick={() => navigate('/')}
          title="Ir a la Tienda"
        >
          <FaStore />
        </button>
        <button
          className={styles.iconBtn}
          onClick={() => navigate('/admin')}
          title="Ir al Home"
        >
          <FaHome />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
