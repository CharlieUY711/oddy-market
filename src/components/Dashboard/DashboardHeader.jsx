import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Store } from 'lucide-react';
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
          <Store size={16} />
        </button>
        <button
          className={styles.iconBtn}
          onClick={() => navigate('/admin-dashboard')}
          title="Ir al Home"
        >
          <Home size={16} />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
