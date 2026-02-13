import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  TrendingUp, 
  Settings as SettingsIcon,
  FileText,
  Wrench,
  ChevronRight,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    sales: { value: 0, loading: true },
    orders: { value: 0, loading: true },
    products: { value: 0, loading: true },
    clients: { value: 0, loading: true }
  });
  const [systemHealth, setSystemHealth] = useState({ score: 0, loading: true });

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Cargar estadísticas desde el backend
      const [ordersRes, productsRes, partiesRes] = await Promise.all([
        fetch(`${API_BASE}/orders?entity_id=default`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/articles?entity_id=default`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/parties?entity_id=default`).then(r => r.json()).catch(() => [])
      ]);

      const orders = Array.isArray(ordersRes) ? ordersRes : [];
      const products = Array.isArray(productsRes) ? productsRes : [];
      const parties = Array.isArray(partiesRes) ? partiesRes : [];

      // Calcular ventas totales
      const totalSales = orders.reduce((sum, order) => {
        return sum + (order.totals?.grand_total || 0);
      }, 0);

      setStats({
        sales: { value: totalSales, loading: false },
        orders: { value: orders.length, loading: false },
        products: { value: products.length, loading: false },
        clients: { value: parties.filter(p => p.roles?.includes('customer')).length, loading: false }
      });

      // Calcular salud del sistema (simulado por ahora)
      const completeTasks = 117;
      const partialTasks = 31;
      const failedTasks = 25;
      const total = completeTasks + partialTasks + failedTasks;
      const score = ((completeTasks + partialTasks * 0.5) / total * 10).toFixed(1);

      setSystemHealth({ score, loading: false, completeTasks, partialTasks, failedTasks });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats({
        sales: { value: 0, loading: false },
        orders: { value: 0, loading: false },
        products: { value: 0, loading: false },
        clients: { value: 0, loading: false }
      });
      setSystemHealth({ score: 0, loading: false });
    }
  };

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

  const handleSectionClick = (section) => {
    setActiveSection(section.id);
    navigate(section.path);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(value);
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
              className={`${styles.menuItem} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => handleSectionClick(section)}
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
        {/* Header */}
        <header className={styles.contentHeader}>
          <div>
            <h2 className={styles.pageTitle}>Dashboard</h2>
            <p className={styles.pageSubtitle}>Vista general del sistema</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary}>⚙️ Personalizar Dashboard</button>
            <button className={styles.btnPrimary} onClick={() => navigate('/')}>
              Volver a la tienda
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#e8f5e9' }}>
              <DollarSign size={24} color="#4caf50" />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Ventas Totales</p>
              {stats.sales.loading ? (
                <p className={styles.kpiValue}>Cargando...</p>
              ) : (
                <p className={styles.kpiValue}>{formatCurrency(stats.sales.value)}</p>
              )}
            </div>
            <button className={styles.kpiMore}>⋯</button>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#fff3e0' }}>
              <ShoppingBag size={24} color="#ff9800" />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Órdenes</p>
              {stats.orders.loading ? (
                <p className={styles.kpiValue}>Cargando...</p>
              ) : (
                <p className={styles.kpiValue}>{stats.orders.value}</p>
              )}
            </div>
            <button className={styles.kpiMore}>⋯</button>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#fce4ec' }}>
              <Package size={24} color="#e91e63" />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Artículos</p>
              {stats.products.loading ? (
                <p className={styles.kpiValue}>Cargando...</p>
              ) : (
                <p className={styles.kpiValue}>{stats.products.value}</p>
              )}
            </div>
            <button className={styles.kpiMore}>⋯</button>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#f3e5f5' }}>
              <Users size={24} color="#9c27b0" />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Clientes</p>
              {stats.clients.loading ? (
                <p className={styles.kpiValue}>Cargando...</p>
              ) : (
                <p className={styles.kpiValue}>{stats.clients.value}</p>
              )}
            </div>
            <button className={styles.kpiMore}>⋯</button>
          </div>
        </div>

        {/* System Health */}
        <div className={styles.systemHealth}>
          <div className={styles.healthHeader}>
            <div className={styles.healthIcon}>
              <AlertCircle size={24} color="#ff9800" />
            </div>
            <div>
              <h3 className={styles.healthTitle}>Estado del Sistema</h3>
              <p className={styles.healthSubtitle}>Evaluación automática de funcionalidades</p>
            </div>
            <div className={styles.healthScore}>
              {systemHealth.loading ? (
                <span className={styles.scoreValue}>-</span>
              ) : (
                <span className={styles.scoreValue}>{systemHealth.score}</span>
              )}
              <span className={styles.scoreMax}>/10</span>
            </div>
          </div>

          <div className={styles.healthProgress}>
            <p className={styles.progressLabel}>Puntuación General</p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: systemHealth.loading ? '0%' : `${systemHealth.score * 10}%` }}
              ></div>
            </div>
            <p className={styles.progressInfo}>
              {!systemHealth.loading && `+12% desde última evaluación`}
            </p>
          </div>

          <div className={styles.healthMetrics}>
            <div className={styles.healthMetric}>
              <div className={styles.metricIcon} style={{ background: '#e8f5e9' }}>✓</div>
              <div className={styles.metricContent}>
                <p className={styles.metricValue}>{systemHealth.completeTasks || 0}</p>
                <p className={styles.metricLabel}>Completas</p>
              </div>
            </div>
            <div className={styles.healthMetric}>
              <div className={styles.metricIcon} style={{ background: '#fff3e0' }}>⚠</div>
              <div className={styles.metricContent}>
                <p className={styles.metricValue}>{systemHealth.partialTasks || 0}</p>
                <p className={styles.metricLabel}>Parciales</p>
              </div>
            </div>
            <div className={styles.healthMetric}>
              <div className={styles.metricIcon} style={{ background: '#ffebee' }}>✕</div>
              <div className={styles.metricContent}>
                <p className={styles.metricValue}>{systemHealth.failedTasks || 0}</p>
                <p className={styles.metricLabel}>Faltantes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Performance */}
        <div className={styles.categoriesSection}>
          <h3 className={styles.sectionTitle}>Categorías Principales</h3>
          <div className={styles.categoryList}>
            {[
              { name: 'Core E-commerce', score: 8.8, color: '#2196f3' },
              { name: 'Seguridad', score: 9.2, color: '#4caf50' },
              { name: 'Pagos', score: 7.8, color: '#00bcd4' },
              { name: 'ERP', score: 8.7, color: '#2196f3' },
              { name: 'CRM', score: 8.3, color: '#2196f3' },
              { name: 'Marketing', score: 8.5, color: '#2196f3' }
            ].map((category, index) => (
              <div key={index} className={styles.categoryItem}>
                <span className={styles.categoryName}>{category.name}</span>
                <div className={styles.categoryProgress}>
                  <div 
                    className={styles.categoryBar} 
                    style={{ width: `${category.score * 10}%`, background: category.color }}
                  ></div>
                </div>
                <span className={styles.categoryScore}>{category.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className={styles.alertsSection}>
          <div className={styles.alertsHeader}>
            <AlertCircle size={20} color="#ff9800" />
            <h3 className={styles.alertsTitle}>Inicializar Sistema</h3>
          </div>
          <p className={styles.alertsSubtitle}>¿Los módulos están vacíos? Crea datos de prueba</p>
          <div className={styles.alertsList}>
            <div className={styles.alertItem}>
              <span className={styles.alertText}>Artículos, Pedidos, CRM, Inventario</span>
              <span className={styles.alertBadge} style={{ background: '#4caf50' }}>LISTO</span>
            </div>
          </div>
          <button 
            className={styles.alertsButton}
            onClick={() => navigate('/admin-dashboard/seed-data')}
          >
            🌱 Inicializar Datos de Prueba <ChevronRight size={16} />
          </button>
          <p className={styles.alertsFooter}>Ejecutar solo una vez para poblar el sistema</p>
        </div>
      </main>
    </div>
  );
};
