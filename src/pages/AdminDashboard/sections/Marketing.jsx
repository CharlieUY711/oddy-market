import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  Share2, 
  RotateCw, 
  TrendingUp, 
  Tag, 
  Target, 
  MessageSquare,
  Star
} from 'lucide-react';
import styles from './Section.module.css';

export const Marketing = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'crm',
      title: 'CRM',
      description: 'Gestión de clientes y relaciones',
      icon: <Users size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/crm/leads'
    },
    {
      id: 'mailing',
      title: 'Mailing',
      description: 'Campañas de email con Resend',
      icon: <Mail size={32} />,
      color: '#e8f5e9',
      iconColor: '#4caf50',
      endpoint: '/mailing/campaigns'
    },
    {
      id: 'social',
      title: 'Redes Sociales',
      description: 'Meta, Facebook, Instagram, WhatsApp',
      icon: <Share2 size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/social/accounts'
    },
    {
      id: 'wheel',
      title: 'Rueda de Sorteos',
      description: 'Gamificación y engagement',
      icon: <RotateCw size={32} />,
      color: '#fff3e0',
      iconColor: '#ff9800',
      endpoint: '/wheel/games'
    },
    {
      id: 'ads',
      title: 'Google Ads',
      description: 'Campañas publicitarias',
      icon: <TrendingUp size={32} />,
      color: '#e3f2fd',
      iconColor: '#2196f3',
      endpoint: '/marketing/ads'
    },
    {
      id: 'coupons',
      title: 'Cupones',
      description: 'Descuentos y promociones',
      icon: <Tag size={32} />,
      color: '#e8f5e9',
      iconColor: '#4caf50',
      endpoint: '/cart/coupons'
    },
    {
      id: 'fidelization',
      title: 'Fidelización',
      description: 'Programa de puntos',
      icon: <Star size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/marketing/loyalty'
    },
    {
      id: 'popups',
      title: 'Pop-ups & Banners',
      description: 'Mensajes promocionales',
      icon: <MessageSquare size={32} />,
      color: '#fff9c4',
      iconColor: '#fbc02d',
      endpoint: '/marketing/popups'
    },
    {
      id: 'abtest',
      title: 'A/B Testing',
      description: 'Optimización continua',
      icon: <Target size={32} />,
      color: '#e1f5fe',
      iconColor: '#03a9f4',
      endpoint: '/marketing/abtests'
    },
    {
      id: 'campaigns',
      title: 'Campañas',
      description: 'Automatización marketing',
      icon: <TrendingUp size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/marketing/campaigns'
    }
  ];

  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Marketing</h2>
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
