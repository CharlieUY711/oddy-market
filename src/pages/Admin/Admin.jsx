import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@components/Card';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { ExternalLink, Lock } from 'lucide-react';
import styles from './Admin.module.css';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin2024'; // Cambiar en producción

export const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    // En desarrollo, permitir acceso sin contraseña
    if (isDevelopment) {
      setIsAuthenticated(true);
    } else {
      // En producción, verificar si ya está autenticado en esta sesión
      const isAuth = sessionStorage.getItem('admin_auth') === 'true';
      setIsAuthenticated(isAuth);
    }
  }, [isDevelopment]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <Card className={styles.loginCard}>
          <CardHeader>
            <div className={styles.lockIcon}>
              <Lock size={48} />
            </div>
            <CardTitle>🔐 Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.loginDescription}>
              Esta página es solo para administradores. Ingresa la contraseña para continuar.
            </p>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && <p className={styles.error}>{error}</p>}
              <Button type="submit" variant="primary" size="lg" className={styles.loginButton}>
                Ingresar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className={styles.backButton}
              >
                Volver al inicio
              </Button>
            </form>
            {isDevelopment && (
              <p className={styles.devNote}>
                💡 Modo desarrollo: La contraseña por defecto es "admin2024"
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
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
        <div className={styles.headerTop}>
          <h1 className={styles.title}>🎛️ Panel de Administración</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className={styles.logoutButton}>
            Cerrar Sesión
          </Button>
        </div>
        <p className={styles.subtitle}>
          Accesos rápidos al backend, deployment y gestión del proyecto
        </p>
        {isDevelopment && (
          <div className={styles.devBadge}>🔧 Modo Desarrollo</div>
        )}
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
