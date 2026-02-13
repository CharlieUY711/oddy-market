import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Image, ShoppingBag, Truck } from 'lucide-react';
import styles from './Section.module.css';

export const ECommerce = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'articles',
      title: 'Artículos',
      description: 'Gestión de catálogo y sincronización multi-canal',
      icon: <Package size={32} />,
      color: '#fff3e0',
      iconColor: '#ff9800',
      endpoint: '/articles'
    },
    {
      id: 'library',
      title: 'Biblioteca (Imágenes y Archivos)',
      description: 'Gestión centralizada de medios con acceso a editores',
      icon: <Image size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/library/files'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: 'Administración de órdenes de compra',
      icon: <ShoppingBag size={32} />,
      color: '#e3f2fd',
      iconColor: '#2196f3',
      endpoint: '/orders'
    },
    {
      id: 'shipping',
      title: 'Envíos',
      description: 'Sistema completo de logística y tracking',
      icon: <Truck size={32} />,
      color: '#e0f2f1',
      iconColor: '#009688',
      endpoint: '/shipments'
    }
  ];

  const handleModuleClick = (module) => {
    // Aquí podrías navegar a una vista detallada del módulo
    console.log('Navigating to module:', module.id);
    // navigate(`/admin-dashboard/ecommerce/${module.id}`);
  };

  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>eCommerce</h2>
          <p className={styles.sectionSubtitle}>Seleccioná un módulo para comenzar</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => navigate('/')}>
          Volver a la tienda
        </button>
      </header>

      <div className={styles.moduleGrid}>
        {modules.map((module) => (
          <div 
            key={module.id} 
            className={styles.moduleCard}
            onClick={() => handleModuleClick(module)}
          >
            <div className={styles.moduleIcon} style={{ background: module.color }}>
              <div style={{ color: module.iconColor }}>{module.icon}</div>
            </div>
            <h3 className={styles.moduleTitle}>{module.title}</h3>
            <p className={styles.moduleDescription}>{module.description}</p>
            <div className={styles.moduleFooter}>
              <span className={styles.moduleEndpoint}>API: {module.endpoint}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
