import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Building2, 
  BarChart3, 
  Clock, 
  Plug, 
  Key, 
  Eye,
  Palette,
  RefreshCw
} from 'lucide-react';
import styles from './Section.module.css';

export const Sistema = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'graphics',
      title: 'Definiciones Gráficas',
      description: 'Logos, banners, fondos y elementos visuales',
      icon: <Palette size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/graphics'
    },
    {
      id: 'audit',
      title: 'Auditoría del Sistema',
      description: 'Evaluación completa de funcionalidades',
      icon: <Shield size={32} />,
      color: '#e3f2fd',
      iconColor: '#2196f3',
      endpoint: '/audit/logs'
    },
    {
      id: 'departments',
      title: 'Departamentos',
      description: 'Gestión de departamentos y categorías',
      icon: <Building2 size={32} />,
      color: '#e0f2f1',
      iconColor: '#009688',
      endpoint: '/departments'
    },
    {
      id: 'analytics',
      title: 'Analíticas',
      description: 'Reportes avanzados y métricas',
      icon: <BarChart3 size={32} />,
      color: '#e1f5fe',
      iconColor: '#03a9f4',
      endpoint: '/analytics/dashboard'
    },
    {
      id: 'logs',
      title: 'Auditoría y Logs',
      description: 'Historial de acciones del sistema',
      icon: <Clock size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/audit/logs'
    },
    {
      id: 'system-audit',
      title: 'Auditoría del Sistema',
      description: 'Evaluación completa de funcionalidades',
      icon: <Shield size={32} />,
      color: '#e3f2fd',
      iconColor: '#2196f3',
      endpoint: '/audit/system'
    },
    {
      id: 'integrations',
      title: 'Integraciones',
      description: 'RRSS, Mercado Libre, Pagos y más',
      icon: <Plug size={32} />,
      color: '#e8f5e9',
      iconColor: '#4caf50',
      endpoint: '/integrations/sync'
    },
    {
      id: 'apis',
      title: 'Configurar APIs',
      description: 'Claves y configuración de servicios',
      icon: <Key size={32} />,
      color: '#fff3e0',
      iconColor: '#ff9800',
      endpoint: '/api-keys'
    },
    {
      id: 'views',
      title: 'Configurar Vistas',
      description: 'Permisos de visualización por rol',
      icon: <Eye size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/settings/views'
    },
    {
      id: 'social-migration',
      title: 'Migración RRSS',
      description: 'Respaldar, eliminar y transformar perfiles de Instagram y Facebook',
      icon: <RefreshCw size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/social-migration'
    }
  ];

  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Sistema</h2>
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
            onClick={() => {
              const routes = {
                graphics: '/admin-dashboard/modules/graphics',
                audit: '/admin-dashboard/modules/audit',
                departments: '/admin-dashboard/modules/departments',
                analytics: '/admin-dashboard/modules/analytics',
                logs: '/admin-dashboard/modules/logs',
                'system-audit': '/admin-dashboard/modules/system-audit',
                integrations: '/admin-dashboard/modules/integrations',
                apis: '/admin-dashboard/modules/apis',
                views: '/admin-dashboard/modules/views',
                'social-migration': '/admin-dashboard/modules/social-migration'
              };
              if (routes[module.id]) {
                navigate(routes[module.id]);
              }
            }}
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
