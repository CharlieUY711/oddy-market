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

  // GRID 1: Títulos Principales del Sistema
  const grid1Items = [
    { id: 'header', name: 'Encabezado (Header)', type: 'Componente', size: 'Min 50px alto', format: 'CSS', usage: 'DashboardHeader' },
    { id: 'toolbar', name: 'Menú 1 (Toolbar)', type: 'Componente', size: 'Min 45px alto', format: 'CSS', usage: 'Barra de herramientas' },
    { id: 'ecommerce', name: 'Título eCommerce', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal' },
    { id: 'marketing', name: 'Título Marketing', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal' },
    { id: 'herramientas', name: 'Título Herramientas', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal' },
    { id: 'gestion', name: 'Título Gestión', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal' },
    { id: 'sistema', name: 'Título Sistema', type: 'Título', size: '1.25rem', format: 'Text', usage: 'Sección principal' },
  ];

  // GRID 2: Departamentos (Tarjetas de Navegación)
  const grid2Items = [
    { id: 'dept-card', name: 'Tarjeta Departamento', type: 'Card', size: '220px ancho', format: 'CSS', usage: 'Alimentos, Tecnología, etc.' },
    { id: 'dept-image', name: 'Imagen Departamento', type: 'Image', size: '140px alto', format: 'JPG/PNG', usage: 'Foto de categoría' },
    { id: 'dept-icon', name: 'Icono Departamento', type: 'Icon', size: '48px', format: 'Emoji/SVG', usage: 'Ícono visual' },
    { id: 'alimentos', name: 'Departamento Alimentos', type: 'Categoría', size: '🍕', format: 'Data', usage: 'Categoría principal' },
    { id: 'tecnologia', name: 'Departamento Tecnología', type: 'Categoría', size: '💻', format: 'Data', usage: 'Categoría principal' },
    { id: 'electronica', name: 'Departamento Electrónica', type: 'Categoría', size: '📱', format: 'Data', usage: 'Categoría principal' },
    { id: 'muebles', name: 'Departamento Muebles', type: 'Categoría', size: '🪑', format: 'Data', usage: 'Categoría principal' },
  ];

  // GRID 3: Artículos (Tarjetas de Productos)
  const grid3Items = [
    { id: 'article-card', name: 'Tarjeta Artículo', type: 'Card', size: '220px ancho', format: 'CSS', usage: 'Productos finales' },
    { id: 'article-image', name: 'Imagen Artículo', type: 'Image', size: '140px alto', format: 'JPG/PNG', usage: 'Foto de producto' },
    { id: 'create-card', name: 'Tarjeta Crear', type: 'Card', size: '220px ancho', format: 'CSS', usage: 'Agregar artículo' },
    { id: 'article-price', name: 'Precio Artículo', type: 'Text', size: '16px', format: 'Number', usage: 'Precio en naranja' },
    { id: 'article-stock', name: 'Stock Artículo', type: 'Text', size: '12px', format: 'Number', usage: 'Cantidad disponible' },
  ];

  const getCurrentItems = () => {
    switch (activeGrid) {
      case 'grid1': return grid1Items;
      case 'grid2': return grid2Items;
      case 'grid3': return grid3Items;
      default: return [];
    }
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
          </nav>
        </aside>

        {/* ÁREA PRINCIPAL CON LOS GRIDS */}
        <main className={styles.mainContent}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>
              {activeGrid === 'grid1' && 'Títulos y Componentes Principales'}
              {activeGrid === 'grid2' && 'Departamentos y Categorías'}
              {activeGrid === 'grid3' && 'Artículos y Productos'}
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
                  <div className={styles.imagePlaceholder}>
                    {item.type}
                  </div>
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
                </div>
                <div className={styles.previewDemo}>
                  <p>Demostración visual del elemento aquí</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
