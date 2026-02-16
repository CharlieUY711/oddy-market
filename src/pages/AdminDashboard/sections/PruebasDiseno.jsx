import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Database, Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import DashboardHeader from '@components/Dashboard/DashboardHeader';
import styles from './Section.module.css';

export const PruebasDiseno = () => {
  const navigate = useNavigate();

  const modules = [
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
    },
    {
      id: 'crm',
      title: 'CRM',
      description: 'Gestión de relaciones con clientes',
      icon: <Users size={32} />,
      color: '#e8f5e9',
      iconColor: '#4caf50',
      endpoint: '/crm',
      route: '/admin-dashboard/modules/crm'
    },
    {
      id: 'analytics',
      title: 'Analíticas',
      description: 'Reportes y métricas del sistema',
      icon: <TrendingUp size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/analytics',
      route: '/admin-dashboard/modules/analytics'
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
        title="Pruebas y Diseño"
        subtitle="Área de desarrollo y pruebas de módulos"
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
     </div>
  );
};
