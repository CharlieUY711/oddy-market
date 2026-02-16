import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Database, Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import DashboardHeader from '@components/Dashboard/DashboardHeader';
import styles from './Section.module.css';

export const Nuevo1 = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'erp',
      title: 'ERP Completo',
      description: 'Módulo de Enterprise Resource Planning - Gestión integral de recursos',
      icon: <Database size={32} />,
      color: '#e3f2fd',
      iconColor: '#2196f3',
      endpoint: '/erp',
      route: '/admin-dashboard/modules/erp'
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Gestión de stock y productos',
      icon: <Package size={32} />,
      color: '#fff3e0',
      iconColor: '#ff9800',
      endpoint: '/inventory',
      route: '/admin-dashboard/modules/inventory'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: 'Administración de órdenes',
      icon: <ShoppingBag size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/orders',
      route: '/admin-dashboard/modules/orders'
    }
  ];

  const handleModuleClick = (module) => {
    if (module.route) {
      navigate(module.route);
    }
  };

  return (
    <div className={styles.section}>
      <DashboardHeader
        title="Nuevo 1"
        subtitle="Sección de desarrollo y pruebas - Módulo 1"
        icon={<FlaskConical size={40} color="white" />}
      />

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

      <div style={{ marginTop: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#212121',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FlaskConical size={28} color="#2196f3" />
            Vista del Módulo Nuevo 1
          </h2>
          <p style={{ color: '#757575', marginBottom: '24px' }}>
            Esta es la sección Nuevo 1 para desarrollo y pruebas de módulos.
          </p>
        </div>
      </div>
    </div>
  );
};
