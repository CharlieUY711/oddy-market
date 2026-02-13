import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, FileText, Printer, QrCode, Sparkles } from 'lucide-react';
import styles from './Section.module.css';

export const Herramientas = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'editor',
      title: 'Editor de Imágenes',
      description: 'Edición, filtros y optimización con IA',
      icon: <Image size={32} />,
      color: '#e8f5e9',
      iconColor: '#4caf50',
      endpoint: '/library/image/edit'
    },
    {
      id: 'documents',
      title: 'Generador de Documentos',
      description: 'Crea facturas, contratos y más con IA',
      icon: <FileText size={32} />,
      color: '#e3f2fd',
      iconColor: '#2196f3',
      endpoint: '/documents/generate'
    },
    {
      id: 'printing',
      title: 'Impresión',
      description: 'Documentos, etiquetas y códigos de barras',
      icon: <Printer size={32} />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
      endpoint: '/documents/print'
    },
    {
      id: 'qr',
      title: 'Generador de QR',
      description: 'Códigos QR personalizados con tracking',
      icon: <QrCode size={32} />,
      color: '#fff3e0',
      iconColor: '#ff9800',
      endpoint: '/labels/generate'
    },
    {
      id: 'ai',
      title: 'Herramientas IA',
      description: 'Inteligencia artificial y machine learning',
      icon: <Sparkles size={32} />,
      color: '#fce4ec',
      iconColor: '#e91e63',
      endpoint: '/ai/tools'
    }
  ];

  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Herramientas</h2>
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
