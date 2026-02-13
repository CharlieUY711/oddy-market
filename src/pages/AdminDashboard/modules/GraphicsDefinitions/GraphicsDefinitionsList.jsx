import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../../components/Dashboard/DashboardHeader';
import Toolbar from '../../../../components/Dashboard/Toolbar';
import styles from './GraphicsDefinitions.module.css';

export const GraphicsDefinitionsList = () => {
  const navigate = useNavigate();
  const [activeGrid, setActiveGrid] = useState('grid1'); // 'grid1' | 'grid2' | 'grid3'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [previewItem, setPreviewItem] = useState(null);

  // VISTAS DEL SISTEMA
  const systemViews = {
    menuPrincipal: [
      { id: 'dashboard', name: 'Dashboard', icon: '🏠', route: '/admin-dashboard', description: 'Vista principal del panel de administración' },
      { id: 'ecommerce', name: 'eCommerce', icon: '🛒', route: '/admin-dashboard/sections/ecommerce', description: 'Gestión de tienda online' },
      { id: 'marketing', name: 'Marketing', icon: '📢', route: '/admin-dashboard/sections/marketing', description: 'Campañas y promociones' },
      { id: 'herramientas', name: 'Herramientas', icon: '🛠️', route: '/admin-dashboard/sections/herramientas', description: 'Utilidades del sistema' },
      { id: 'gestion', name: 'Gestión', icon: '📊', route: '/admin-dashboard/sections/gestion', description: 'Gestión empresarial' },
      { id: 'sistema', name: 'Sistema', icon: '⚙️', route: '/admin-dashboard/sections/sistema', description: 'Configuración del sistema' },
    ],
    ecommerce: [
      { id: 'articulos', name: 'Artículos', icon: '📦', route: '/admin-dashboard/modules/articles', description: 'Gestión de productos' },
      { id: 'departamentos', name: 'Departamentos', icon: '🏢', route: '/admin-dashboard/modules/departments', description: 'Categorías principales' },
      { id: 'pedidos', name: 'Pedidos', icon: '📋', route: '/admin-dashboard/modules/orders', description: 'Órdenes de compra' },
      { id: 'clientes', name: 'Clientes', icon: '👥', route: '/admin-dashboard/modules/customers', description: 'Base de clientes' },
    ],
    sistema: [
      { id: 'usuarios', name: 'Usuarios', icon: '👤', route: '/admin-dashboard/modules/users', description: 'Gestión de usuarios' },
      { id: 'definiciones-graficas', name: 'Definiciones Gráficas', icon: '🎨', route: '/admin-dashboard/modules/graphics-definitions', description: 'Elementos visuales del sistema' },
    ],
  };

  // GRID 1: Títulos Principales del Sistema
  const grid1Items = [
    { id: 'header', name: 'Encabezado (Header)', type: 'Componente', size: 'Min 50px alto', format: 'CSS', usage: 'DashboardHeader', image: 'https://via.placeholder.com/220x140/3b82f6/ffffff?text=Header+50px', color: '#3b82f6' },
    { id: 'toolbar', name: 'Menú 1 (Toolbar)', type: 'Componente', size: 'Min 45px alto', format: 'CSS', usage: 'Barra de herramientas', image: 'https://via.placeholder.com/220x140/8b5cf6/ffffff?text=Toolbar+45px', color: '#8b5cf6' },
    { id: 'ecommerce', name: 'Título eCommerce', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal', image: 'https://via.placeholder.com/220x140/10b981/ffffff?text=eCommerce', color: '#10b981' },
    { id: 'marketing', name: 'Título Marketing', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal', image: 'https://via.placeholder.com/220x140/f59e0b/ffffff?text=Marketing', color: '#f59e0b' },
    { id: 'herramientas', name: 'Título Herramientas', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal', image: 'https://via.placeholder.com/220x140/ef4444/ffffff?text=Herramientas', color: '#ef4444' },
    { id: 'gestion', name: 'Título Gestión', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal', image: 'https://via.placeholder.com/220x140/06b6d4/ffffff?text=Gestion', color: '#06b6d4' },
    { id: 'sistema', name: 'Título Sistema', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal', image: 'https://via.placeholder.com/220x140/6366f1/ffffff?text=Sistema', color: '#6366f1' },
  ];

  // GRID 2: Departamentos (Tarjetas de Navegación)
  const grid2Items = [
    { id: 'dept-card', name: 'Tarjeta Departamento', type: 'Card', size: '220px ancho', format: 'CSS', usage: 'Alimentos, Tecnología, etc.', image: 'https://via.placeholder.com/220x140/f3f4f6/1f2937?text=Tarjeta+Dept', color: '#f3f4f6' },
    { id: 'dept-image', name: 'Imagen Departamento', type: 'Image', size: '140px alto', format: 'JPG/PNG', usage: 'Foto de categoría', image: 'https://via.placeholder.com/220x140/e5e7eb/6b7280?text=Imagen+140px', color: '#e5e7eb' },
    { id: 'dept-icon', name: 'Icono Departamento', type: 'Icon', size: '48px', format: 'Emoji/SVG', usage: 'Ícono visual', image: 'https://via.placeholder.com/220x140/fef3c7/f59e0b?text=Icono+48px', color: '#fef3c7' },
    { id: 'alimentos', name: 'Departamento Alimentos', type: 'Categoría', size: '🍕', format: 'Data', usage: 'Categoría principal', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', emoji: '🍕', color: '#ef4444' },
    { id: 'tecnologia', name: 'Departamento Tecnología', type: 'Categoría', size: '💻', format: 'Data', usage: 'Categoría principal', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop', emoji: '💻', color: '#3b82f6' },
    { id: 'electronica', name: 'Departamento Electrónica', type: 'Categoría', size: '📱', format: 'Data', usage: 'Categoría principal', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop', emoji: '📱', color: '#8b5cf6' },
    { id: 'muebles', name: 'Departamento Muebles', type: 'Categoría', size: '🪑', format: 'Data', usage: 'Categoría principal', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', emoji: '🪑', color: '#06b6d4' },
  ];

  // GRID 3: Artículos (Tarjetas de Productos)
  const grid3Items = [
    { id: 'article-card', name: 'Tarjeta Artículo', type: 'Card', size: '220px ancho', format: 'CSS', usage: 'Productos finales', image: 'https://via.placeholder.com/220x140/ffffff/1f2937?text=Tarjeta+Articulo', color: '#ffffff' },
    { id: 'article-image', name: 'Imagen Artículo', type: 'Image', size: '140px alto', format: 'JPG/PNG', usage: 'Foto de producto', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', color: '#f3f4f6' },
    { id: 'create-card', name: 'Tarjeta Crear', type: 'Card', size: '220px ancho', format: 'CSS', usage: 'Agregar artículo', image: 'https://via.placeholder.com/220x140/ffffff/ff6b35?text=+Crear', color: '#ffffff' },
    { id: 'article-price', name: 'Precio Artículo', type: 'Text', size: '16px', format: 'Number', usage: 'Precio en naranja', image: 'https://via.placeholder.com/220x140/ff6b35/ffffff?text=$+1.999', color: '#ff6b35' },
    { id: 'article-stock', name: 'Stock Artículo', type: 'Text', size: '12px', format: 'Number', usage: 'Cantidad disponible', image: 'https://via.placeholder.com/220x140/10b981/ffffff?text=Stock:+150', color: '#10b981' },
  ];

  const getCurrentItems = () => {
    let items = [];
    
    switch (activeGrid) {
      case 'grid1': 
        items = grid1Items;
        break;
      case 'grid2': 
        items = grid2Items;
        break;
      case 'grid3': 
        items = grid3Items;
        break;
      case 'vistas-menu':
        items = systemViews.menuPrincipal.map(view => ({
          ...view,
          type: 'Vista',
          size: 'Full Page',
          format: 'React Component',
          usage: view.description,
          image: `https://via.placeholder.com/220x140/3b82f6/ffffff?text=${encodeURIComponent(view.icon + ' ' + view.name)}`,
          color: '#3b82f6'
        }));
        break;
      case 'vistas-ecommerce':
        items = systemViews.ecommerce.map(view => ({
          ...view,
          type: 'Módulo',
          size: 'Full Page',
          format: 'React Component',
          usage: view.description,
          image: `https://via.placeholder.com/220x140/10b981/ffffff?text=${encodeURIComponent(view.icon + ' ' + view.name)}`,
          color: '#10b981'
        }));
        break;
      case 'vistas-sistema':
        items = systemViews.sistema.map(view => ({
          ...view,
          type: 'Módulo',
          size: 'Full Page',
          format: 'React Component',
          usage: view.description,
          image: `https://via.placeholder.com/220x140/6366f1/ffffff?text=${encodeURIComponent(view.icon + ' ' + view.name)}`,
          color: '#6366f1'
        }));
        break;
      default: 
        items = [];
    }

    if (searchTerm) {
      return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedItems(new Set());
    }
  };

  const breadcrumbs = [
    { label: 'Sistema', path: '/admin-dashboard', onClick: () => navigate('/admin-dashboard') },
    { label: 'Definiciones Gráficas', path: null, onClick: null }
  ];

  return (
    <div className={styles.container}>
      {/* HEADER ESTANDARIZADO */}
      <DashboardHeader breadcrumbs={breadcrumbs} />

      {/* TOOLBAR ESTANDARIZADA - MENÚ 1 */}
      <Toolbar config={{
        showViewToggle: false,
        showSearch: true,
        searchValue: searchTerm,
        onSearchChange: setSearchTerm,
        searchPlaceholder: 'Buscar definiciones gráficas...',
        onNew: () => console.log('Nuevo elemento gráfico'),
        onEdit: () => console.log('Editar seleccionados'),
        onToggleSelection: toggleSelectionMode,
        onActions: () => console.log('Acciones'),
        isSelectionMode: isSelectionMode,
        selectedCount: selectedItems.size,
        showBack: false
      }} />

      <div className={styles.contentWrapper}>
        {/* MENÚ LATERAL 1 */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Categorías</h3>
          <nav className={styles.sidebarNav}>
            <h3 className={styles.sidebarSection}>📐 GRIDS</h3>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'grid1' ? styles.active : ''}`}
              onClick={() => setActiveGrid('grid1')}
            >
              📝 Grid 1 - Títulos y Componentes
            </button>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'grid2' ? styles.active : ''}`}
              onClick={() => setActiveGrid('grid2')}
            >
              🏢 Grid 2 - Departamentos
            </button>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'grid3' ? styles.active : ''}`}
              onClick={() => setActiveGrid('grid3')}
            >
              📦 Grid 3 - Artículos
            </button>

            <div className={styles.divider}></div>

            <h3 className={styles.sidebarSection}>🗂️ VISTAS</h3>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'vistas-menu' ? styles.active : ''}`}
              onClick={() => setActiveGrid('vistas-menu')}
            >
              🏠 Menú Principal
            </button>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'vistas-ecommerce' ? styles.active : ''}`}
              onClick={() => setActiveGrid('vistas-ecommerce')}
            >
              🛒 Módulos eCommerce
            </button>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'vistas-sistema' ? styles.active : ''}`}
              onClick={() => setActiveGrid('vistas-sistema')}
            >
              ⚙️ Módulos Sistema
            </button>
          </nav>
        </aside>

        {/* ÁREA PRINCIPAL CON LOS GRIDS */}
        <main className={styles.mainContent}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>
              {activeGrid === 'grid1' && 'Títulos y Componentes Principales'}
              {activeGrid === 'grid2' && 'Departamentos y Categorías'}
              {activeGrid === 'grid3' && 'Artículos y Productos'}
              {activeGrid === 'vistas-menu' && 'Vistas del Menú Principal'}
              {activeGrid === 'vistas-ecommerce' && 'Módulos de eCommerce'}
              {activeGrid === 'vistas-sistema' && 'Módulos de Sistema'}
            </h2>
          </div>

          {/* GRID DINÁMICO */}
          <div className={styles.grid}>
            {getCurrentItems().map((item) => (
              <div 
                key={item.id} 
                className={`${styles.gridCard} ${previewItem?.id === item.id ? styles.selected : ''}`}
                onClick={() => setPreviewItem(item)}
              >
                <div className={styles.cardImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className={styles.image} />
                  ) : (
                    <div className={styles.imagePlaceholder} style={{ backgroundColor: item.color }}>
                      {item.emoji || item.type}
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h4 className={styles.cardTitle}>{item.name}</h4>
                  <p className={styles.cardInfo}>{item.size}</p>
                  <p className={styles.cardFormat}>{item.format}</p>
                  <p className={styles.cardUsage}>{item.usage}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PANEL DE PREVISUALIZACIÓN */}
          {previewItem && (
            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <h3 className={styles.previewTitle}>Vista Previa: {previewItem.name}</h3>
                <button 
                  className={styles.closePreview}
                  onClick={() => setPreviewItem(null)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewInfo}>
                  <p><strong>Tipo:</strong> {previewItem.type}</p>
                  <p><strong>Tamaño:</strong> {previewItem.size}</p>
                  <p><strong>Formato:</strong> {previewItem.format}</p>
                  <p><strong>Uso:</strong> {previewItem.usage}</p>
                  {previewItem.route && <p><strong>Ruta:</strong> <code style={{ fontSize: '0.75rem', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{previewItem.route}</code></p>}
                  {previewItem.emoji && <p><strong>Emoji:</strong> <span style={{ fontSize: '2rem' }}>{previewItem.emoji}</span></p>}
                  {previewItem.icon && !previewItem.emoji && <p><strong>Icono:</strong> <span style={{ fontSize: '2rem' }}>{previewItem.icon}</span></p>}
                </div>
                <div className={styles.previewDemo}>
                  {previewItem.image ? (
                    <img src={previewItem.image} alt={previewItem.name} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '220px', height: '140px', backgroundColor: previewItem.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      {previewItem.emoji || previewItem.icon || previewItem.type}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
