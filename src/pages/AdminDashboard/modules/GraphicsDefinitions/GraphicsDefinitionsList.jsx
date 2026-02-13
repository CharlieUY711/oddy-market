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

  // Datos de ejemplo para los grids
  const grid1Items = [
    { id: 1, name: 'Logo Principal', type: 'Logo', size: '1920x1080', format: 'PNG' },
    { id: 2, name: 'Logo Secundario', type: 'Logo', size: '1024x768', format: 'SVG' },
    { id: 3, name: 'Icono App', type: 'Icono', size: '512x512', format: 'PNG' },
  ];

  const grid2Items = [
    { id: 4, name: 'Banner Principal', type: 'Banner', size: '1920x400', format: 'JPG' },
    { id: 5, name: 'Banner Promocional', type: 'Banner', size: '1200x300', format: 'PNG' },
  ];

  const grid3Items = [
    { id: 6, name: 'Fondo Dashboard', type: 'Fondo', size: '1920x1080', format: 'JPG' },
    { id: 7, name: 'Textura Card', type: 'Textura', size: '800x600', format: 'PNG' },
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
              📐 Grid 1 - Logos e Iconos
            </button>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'grid2' ? styles.active : ''}`}
              onClick={() => setActiveGrid('grid2')}
            >
              🎨 Grid 2 - Banners
            </button>
            <button
              className={`${styles.sidebarItem} ${activeGrid === 'grid3' ? styles.active : ''}`}
              onClick={() => setActiveGrid('grid3')}
            >
              🖼️ Grid 3 - Fondos y Texturas
            </button>
          </nav>
        </aside>

        {/* ÁREA PRINCIPAL CON LOS GRIDS */}
        <main className={styles.mainContent}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>
              {activeGrid === 'grid1' && 'Logos e Iconos'}
              {activeGrid === 'grid2' && 'Banners'}
              {activeGrid === 'grid3' && 'Fondos y Texturas'}
            </h2>
            <button 
              className={styles.previewBtn}
              onClick={() => navigate(`/admin-dashboard/modules/graphics/preview/${activeGrid}`)}
            >
              👁️ Vista Previa
            </button>
          </div>

          {/* GRID DINÁMICO */}
          <div className={styles.grid}>
            {getCurrentItems().map((item) => (
              <div key={item.id} className={styles.gridCard}>
                <div className={styles.cardImage}>
                  <div className={styles.imagePlaceholder}>
                    {item.type}
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h4 className={styles.cardTitle}>{item.name}</h4>
                  <p className={styles.cardInfo}>{item.size}</p>
                  <p className={styles.cardFormat}>{item.format}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
