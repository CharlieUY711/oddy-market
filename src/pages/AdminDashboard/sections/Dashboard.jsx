import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import StandardHeader from '@components/StandardHeader';
import { getMenuLevel, getContextualVariables } from '@utils/viewConfig';
import styles from './Section.module.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuLevel, setMenuLevel] = useState(1);
  const [contextualVars, setContextualVars] = useState({});

  useEffect(() => {
    const level = getMenuLevel(location.pathname);
    const vars = getContextualVariables(location.pathname);
    setMenuLevel(level);
    setContextualVars(vars);
  }, [location.pathname]);

  const modules = [
    {
      id: 'sales',
      title: 'Ventas',
      description: '',
      icon: <DollarSign size={32} />,
      color: '#e8f5e9',
      iconColor: '#4caf50',
      endpoint: '/sales'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: '',
      icon: <ShoppingBag size={32} />,
      color: '#fff3e0',
      iconColor: '#ff9800',
      endpoint: '/orders'
    },
    {
      id: 'products',
      title: 'Artículos',
      description: '',
      icon: <Package size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/products'
    },
    {
      id: 'clients',
      title: 'Clientes',
      description: '',
      icon: <Users size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/clients'
    },
  ];

  const handleModuleClick = (module) => {
    const routes = {
      sales: '/admin-dashboard/modules/sales',
      orders: '/admin-dashboard/modules/orders',
      products: '/admin-dashboard/modules/articles',
      clients: '/admin-dashboard/modules/clients'
    };
    if (routes[module.id]) {
      navigate(routes[module.id]);
    }
  };

  return (
    <>
      <StandardHeader
        title={contextualVars.OpMenúPrincipalDasboard || 'Dashboard'}
        subtitle="Panel principal de administración"
        icon={<LayoutDashboard size={40} color="white" />}
        level={menuLevel}
      />
      <div className={styles.ecommerceGrid}>
        {/* Primera fila: 4 tarjetas */}
        {modules.map((module) => (
          <div 
            key={module.id} 
            className={`${styles.gridItem} ${styles.moduleCard}`}
            onClick={() => handleModuleClick(module)}
          >
            <div className={styles.moduleIcon} style={{ background: module.color }}>
              <div style={{ color: module.iconColor }}>{module.icon}</div>
            </div>
            <h3 className={styles.moduleTitle}>{module.title}</h3>
          </div>
        ))}
        
        {/* Segunda fila: Módulo vacío "Ventas" */}
        <div 
          className={styles.gridItem}
          style={{ 
            gridColumn: 'span 4',
            border: '2px dashed #e0e0e0',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#757575',
            borderRadius: '16px'
          }}
        >
          Ventas (Módulo Vacío)
        </div>
      </div>
    </>
  );
};
