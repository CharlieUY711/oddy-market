import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Tag, 
  Receipt, 
  FileText, 
  RotateCw, 
  Shield 
} from 'lucide-react';
import styles from './Section.module.css';

export const Gestion = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'erp',
      title: 'ERP',
      description: 'Sistema completo de gestión empresarial',
      icon: <LayoutGrid size={32} />,
      color: '#e3f2fd',
      iconColor: '#2196f3',
      endpoint: '/erp/dashboard'
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Control de stock y movimientos',
      icon: <Tag size={32} />,
      color: '#e0f2f1',
      iconColor: '#009688',
      endpoint: '/inventory/stock'
    },
    {
      id: 'billing',
      title: 'Facturación',
      description: 'Emisión de facturas y remitos',
      icon: <Receipt size={32} />,
      color: '#e8f5e9',
      iconColor: '#4caf50',
      endpoint: '/billing/invoices'
    },
    {
      id: 'purchase',
      title: 'Órdenes de Compra',
      description: 'Gestión de compras a proveedores',
      icon: <FileText size={32} />,
      color: '#fff3e0',
      iconColor: '#ff9800',
      endpoint: '/provider/purchase-orders'
    },
    {
      id: 'secondhand',
      title: 'Second Hand (Moderación)',
      description: 'Aprobar/rechazar publicaciones de segunda mano',
      icon: <RotateCw size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/orders?type=secondhand'
    },
    {
      id: 'users',
      title: 'Usuarios (Roles y Permisos)',
      description: 'Sistema de roles y aprobaciones',
      icon: <Shield size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/users'
    }
  ];

  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Gestión</h2>
          <p className={styles.sectionSubtitle}>Seleccioná un módulo para comenzar</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => navigate('/')}>
          Volver a la tienda
        </button>
      </header>

      <div className={styles.moduleGrid}>
        {modules.map((module) => (
          <div key={module.id} className={styles.moduleCard}>
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
