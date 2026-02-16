import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '@components/Dashboard/DashboardHeader';
import styles from './GraphicsDefinitions.module.css';

export const GraphicsPreview = () => {
  const { gridId } = useParams();
  const navigate = useNavigate();

  const getGridTitle = () => {
    switch (gridId) {
      case 'grid1': return 'Grid 1 - Logos e Iconos';
      case 'grid2': return 'Grid 2 - Banners';
      case 'grid3': return 'Grid 3 - Fondos y Texturas';
      default: return 'Vista Previa';
    }
  };

  const breadcrumbs = [
    { label: 'Sistema', path: '/admin-dashboard', onClick: () => navigate('/admin-dashboard') },
    { label: 'Definiciones Gráficas', path: '/admin-dashboard/modules/graphics', onClick: () => navigate('/admin-dashboard/modules/graphics') },
    { label: getGridTitle(), path: null, onClick: null }
  ];

  return (
    <div className={styles.container}>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          <h1 className={styles.previewTitle}>{getGridTitle()}</h1>
          <button 
            className={styles.backBtn}
            onClick={() => navigate('/admin-dashboard/modules/graphics')}
          >
            ← Volver
          </button>
        </div>

        <div className={styles.previewContent}>
          <div className={styles.previewPlaceholder}>
            <h2>Vista Previa del {getGridTitle()}</h2>
            <p>Aquí se mostrará el contenido de este grid en modo previsualización</p>
          </div>
        </div>
      </div>
    </div>
  );
};
