import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  TrendingUp, 
  Settings as SettingsIcon,
  FileText,
  Wrench
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

export const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin-dashboard'
    },
    {
      id: 'ecommerce',
      label: 'eCommerce',
      icon: <ShoppingCart size={20} />,
      path: '/admin-dashboard/ecommerce'
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: <TrendingUp size={20} />,
      path: '/admin-dashboard/marketing'
    },
    {
      id: 'herramientas',
      label: 'Herramientas',
      icon: <Wrench size={20} />,
      path: '/admin-dashboard/herramientas'
    },
    {
      id: 'gestion',
      label: 'Gestión',
      icon: <FileText size={20} />,
      path: '/admin-dashboard/gestion'
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: <SettingsIcon size={20} />,
      path: '/admin-dashboard/sistema'
    }
  ];

  const isActive = (path) => {
    if (path === '/admin-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.adminDashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>ODDY Market</h1>
          <p className={styles.subtitle}>Panel de Administración</p>
        </div>

        <nav className={styles.menu}>
          {menuSections.map((section) => (
            <button
              key={section.id}
              className={`${styles.menuItem} ${isActive(section.path) ? styles.active : ''}`}
              onClick={() => navigate(section.path)}
            >
              <span className={styles.menuIcon}>{section.icon}</span>
              <span className={styles.menuLabel}>{section.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.tipDelDia}>
            <span className={styles.tipIcon}>✨</span>
            <p className={styles.tipTitle}>Tip del día</p>
            <p className={styles.tipText}>
              Usá las herramientas de IA para optimizar tus descripciones de productos automáticamente
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
