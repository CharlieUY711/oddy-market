import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { ExternalLink } from 'lucide-react';
import styles from './Admin.module.css';

export const Admin = () => {
  const backendLinks = [
    {
      title: '🗄️ Gestión de Productos',
      description: 'Ver, agregar, editar y eliminar productos',
      url: 'https://app.supabase.com/project/yomgqobfmgatavnbtvdz/editor',
      icon: '📦',
    },
    {
      title: '💻 Ejecutar SQL',
      description: 'Ejecutar queries y scripts SQL',
      url: 'https://app.supabase.com/project/yomgqobfmgatavnbtvdz/sql',
      icon: '⚡',
    },
    {
      title: '👥 Gestión de Usuarios',
      description: 'Administrar usuarios registrados',
      url: 'https://app.supabase.com/project/yomgqobfmgatavnbtvdz/auth/users',
      icon: '👤',
    },
    {
      title: '📊 Dashboard Supabase',
      description: 'Panel principal de Supabase',
      url: 'https://app.supabase.com/project/yomgqobfmgatavnbtvdz',
      icon: '🎛️',
    },
    {
      title: '📈 Logs y Monitoring',
      description: 'Ver logs y monitorear el sistema',
      url: 'https://app.supabase.com/project/yomgqobfmgatavnbtvdz/logs/explorer',
      icon: '📊',
    },
    {
      title: '🔐 API Settings',
      description: 'Ver y gestionar API keys',
      url: 'https://app.supabase.com/project/yomgqobfmgatavnbtvdz/settings/api',
      icon: '🔑',
    },
  ];

  const deploymentLinks = [
    {
      title: '▲ Dashboard Vercel',
      description: 'Panel principal de Vercel',
      url: 'https://vercel.com/carlos-varallas-projects/oddy-market',
      icon: '🚀',
    },
    {
      title: '📦 Deployments',
      description: 'Ver historial de deployments',
      url: 'https://vercel.com/carlos-varallas-projects/oddy-market/deployments',
      icon: '📋',
    },
    {
      title: '⚙️ Environment Variables',
      description: 'Gestionar variables de entorno',
      url: 'https://vercel.com/carlos-varallas-projects/oddy-market/settings/environment-variables',
      icon: '🔧',
    },
    {
      title: '📊 Analytics',
      description: 'Ver analytics de Vercel',
      url: 'https://vercel.com/carlos-varallas-projects/oddy-market/analytics',
      icon: '📈',
    },
  ];

  const codeLinks = [
    {
      title: '📦 Repositorio GitHub',
      description: 'Ver código fuente',
      url: 'https://github.com/CharlieUY711/oddy-market',
      icon: '🐙',
    },
    {
      title: '📝 Commits',
      description: 'Ver historial de cambios',
      url: 'https://github.com/CharlieUY711/oddy-market/commits/main',
      icon: '📜',
    },
  ];

  const handleOpenLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎛️ Panel de Administración</h1>
        <p className={styles.subtitle}>
          Accesos rápidos al backend, deployment y gestión del proyecto
        </p>
      </div>

      {/* Backend Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🗄️ Backend (Supabase)</h2>
        <div className={styles.grid}>
          {backendLinks.map((link, index) => (
            <Card key={index} className={styles.card}>
              <CardHeader>
                <div className={styles.cardIcon}>{link.icon}</div>
                <CardTitle className={styles.cardTitle}>{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={styles.cardDescription}>{link.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenLink(link.url)}
                  className={styles.cardButton}
                >
                  Abrir <ExternalLink size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Deployment Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>▲ Deployment (Vercel)</h2>
        <div className={styles.grid}>
          {deploymentLinks.map((link, index) => (
            <Card key={index} className={styles.card}>
              <CardHeader>
                <div className={styles.cardIcon}>{link.icon}</div>
                <CardTitle className={styles.cardTitle}>{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={styles.cardDescription}>{link.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenLink(link.url)}
                  className={styles.cardButton}
                >
                  Abrir <ExternalLink size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Code Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🐙 Código (GitHub)</h2>
        <div className={styles.grid}>
          {codeLinks.map((link, index) => (
            <Card key={index} className={styles.card}>
              <CardHeader>
                <div className={styles.cardIcon}>{link.icon}</div>
                <CardTitle className={styles.cardTitle}>{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={styles.cardDescription}>{link.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenLink(link.url)}
                  className={styles.cardButton}
                >
                  Abrir <ExternalLink size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.infoSection}>
        <Card className={styles.infoCard}>
          <CardContent>
            <h3 className={styles.infoTitle}>ℹ️ Información del Proyecto</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>URL Producción:</strong>
                <a href="https://oddy-market.vercel.app/" target="_blank" rel="noopener noreferrer">
                  https://oddy-market.vercel.app/
                </a>
              </div>
              <div className={styles.infoItem}>
                <strong>Supabase URL:</strong>
                <code>https://yomgqobfmgatavnbtvdz.supabase.co</code>
              </div>
              <div className={styles.infoItem}>
                <strong>Productos en BD:</strong>
                <span>20 productos (12 nuevos + 8 segunda mano)</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Última actualización:</strong>
                <span>2026-02-12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
