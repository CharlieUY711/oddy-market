import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Store } from 'lucide-react';
import styles from './DashboardHeader.module.css';

/**
 * DashboardHeader - Encabezado estandarizado para todas las vistas del dashboard
 * 
 * @param {string} title - El título que se mostrará en el encabezado
 * @param {array} breadcrumbs - Array de objetos {label, path} para la ruta de navegación
 * @param {string} className - Clases CSS adicionales (opcional)
 */
const DashboardHeader = ({ title, breadcrumbs = [], className = '' }) => {
  const navigate = useNavigate();

  return (
    <header className={`${styles.dashboardHeader} ${className}`}>
      <div className={styles.titleSection}>
        {breadcrumbs.length > 0 ? (
          <div className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.onClick ? (
                  <span 
                    className={styles.breadcrumbLink}
                    onClick={crumb.onClick}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className={styles.breadcrumbSeparator}>-</span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <h2 className={styles.title}>{title}</h2>
        )}
      </div>
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
