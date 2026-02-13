import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../../components/Dashboard/DashboardHeader';
import Toolbar from '../../../../components/Dashboard/Toolbar';
import styles from './GraphicsDefinitions.module.css';

export const GraphicsDefinitionsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItems, setPreviewItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [savedViews, setSavedViews] = useState([]);
  const [currentViewName, setCurrentViewName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [assignedScreens, setAssignedScreens] = useState([]);

  // PANTALLAS DEL SISTEMA
  const pantallas = [
    { id: 'dashboard', name: 'Dashboard Principal' },
    { id: 'ecommerce', name: 'Sección eCommerce' },
    { id: 'articulos', name: 'Módulo Artículos' },
    { id: 'departamentos', name: 'Módulo Departamentos' },
    { id: 'pedidos', name: 'Módulo Pedidos' },
    { id: 'clientes', name: 'Módulo Clientes' },
    { id: 'inventario', name: 'Módulo Inventario' },
    { id: 'marketing', name: 'Sección Marketing' },
    { id: 'sistema', name: 'Sección Sistema' },
    { id: 'gestion', name: 'Sección Gestión' },
  ];

  // CONTENEDORES Y ELEMENTOS DEL SISTEMA
  const contenedores = [
    // TARJETAS
    { id: 'card-articulo', name: 'Tarjeta Artículo', tipo: 'Tarjeta', dimension: '220px × flexible', color: '#ffffff', descripcion: 'Tarjeta para mostrar productos' },
    { id: 'card-departamento', name: 'Tarjeta Departamento', tipo: 'Tarjeta', dimension: '220px × flexible', color: '#ffffff', descripcion: 'Categorías principales' },
    { id: 'card-modulo', name: 'Tarjeta Módulo', tipo: 'Tarjeta', dimension: 'minmax(380px, 1fr)', color: '#ffffff', descripcion: 'Módulos del dashboard' },
    { id: 'card-crear', name: 'Tarjeta Crear', tipo: 'Tarjeta', dimension: '220px × flexible', color: '#ffffff', descripcion: 'Botón para agregar' },
    
    // BARRAS
    { id: 'header', name: 'Barra Encabezado', tipo: 'Barra', dimension: 'Min 50px alto × 100% ancho', color: '#ffffff', descripcion: 'Header con breadcrumbs' },
    { id: 'toolbar', name: 'Barra Menú (Toolbar)', tipo: 'Barra', dimension: 'Min 45px alto × 100% ancho', color: '#f3f4f6', descripcion: 'Nuevo, Editar, Seleccionar, Acciones' },
    { id: 'search', name: 'Barra Búsqueda', tipo: 'Input', dimension: 'Flexible × centrado', color: 'transparent', descripcion: 'Input sin borde' },
    
    // BOTONES
    { id: 'btn-30', name: 'Botón Estándar', tipo: 'Botón', dimension: '30px alto × 8px radius', color: '#3b82f6', descripcion: 'Botón actual del sistema' },
    { id: 'btn-32', name: 'Botón Mediano', tipo: 'Botón', dimension: '32px alto × 8px radius', color: '#10b981', descripcion: 'Botón secundario' },
    { id: 'btn-35', name: 'Botón Grande', tipo: 'Botón', dimension: '35px alto × 8px radius', color: '#6b7280', descripcion: 'Obsoleto' },
    
    // ICONOS
    { id: 'icon-home', name: 'Icono Home', tipo: 'Icono', dimension: '30px × 30px', color: 'transparent', emoji: '🏠', descripcion: 'Volver al inicio' },
    { id: 'icon-store', name: 'Icono Tienda', tipo: 'Icono', dimension: '30px × 30px', color: 'transparent', emoji: '🛍️', descripcion: 'Ir a la tienda' },
    { id: 'icon-search', name: 'Icono Buscar', tipo: 'Icono', dimension: '20px × 20px', color: 'transparent', emoji: '🔍', descripcion: 'Lupa de búsqueda' },
    
    // IMÁGENES
    { id: 'img-articulo', name: 'Imagen Artículo', tipo: 'Imagen', dimension: '220px × 140px', color: '#f3f4f6', descripcion: 'Foto de producto' },
    { id: 'img-departamento', name: 'Imagen Departamento', tipo: 'Imagen', dimension: '220px × 140px', color: '#f3f4f6', descripcion: 'Foto de categoría' },
    { id: 'img-modulo', name: 'Icono Módulo', tipo: 'Imagen', dimension: '72px × 72px', color: '#fff3e0', descripcion: 'Icono grande' },
    
    // TEXTOS
    { id: 'text-precio', name: 'Texto Precio', tipo: 'Texto', dimension: '16px font', color: '#ff6b35', descripcion: 'Precio en naranja' },
    { id: 'text-stock', name: 'Texto Stock', tipo: 'Texto', dimension: '12px font', color: '#10b981', descripcion: 'Cantidad disponible' },
    { id: 'text-titulo', name: 'Texto Título', tipo: 'Texto', dimension: '1.25rem font', color: '#1f2937', descripcion: 'Títulos de secciones' },
  ];


  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem) {
      setPreviewItems([...previewItems, { ...draggedItem, id: Date.now() }]);
      setDraggedItem(null);
    }
  };

  const removePreviewItem = (itemId) => {
    setPreviewItems(previewItems.filter(item => item.id !== itemId));
  };

  const handleSaveView = () => {
    if (!currentViewName.trim()) {
      alert('Por favor ingresá un nombre para la vista');
      return;
    }
    const newView = {
      id: Date.now(),
      name: currentViewName,
      elements: previewItems,
      assignedTo: [],
      createdAt: new Date().toISOString()
    };
    setSavedViews([...savedViews, newView]);
    setCurrentViewName('');
    setShowSaveModal(false);
    alert('Vista guardada exitosamente!');
  };

  const handleLoadView = (view) => {
    setPreviewItems(view.elements.map(el => ({ ...el, id: Date.now() + Math.random() })));
    setCurrentViewName(view.name);
  };

  const handleAssignView = (view) => {
    setSelectedView(view);
    setAssignedScreens(view.assignedTo || []);
    setShowAssignModal(true);
  };

  const toggleScreen = (screenId) => {
    if (assignedScreens.includes(screenId)) {
      setAssignedScreens(assignedScreens.filter(id => id !== screenId));
    } else {
      setAssignedScreens([...assignedScreens, screenId]);
    }
  };

  const saveAssignments = () => {
    const updatedViews = savedViews.map(view => 
      view.id === selectedView.id 
        ? { ...view, assignedTo: assignedScreens }
        : view
    );
    setSavedViews(updatedViews);
    setShowAssignModal(false);
    alert('Asignaciones guardadas!');
  };

  const deleteView = (viewId) => {
    if (confirm('¿Estás seguro de eliminar esta vista?')) {
      setSavedViews(savedViews.filter(v => v.id !== viewId));
    }
  };

  const clearComposition = () => {
    if (confirm('¿Limpiar la composición actual?')) {
      setPreviewItems([]);
      setCurrentViewName('');
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

      <div className={styles.contentWrapper}>
        {/* MENÚ LATERAL con CONTENEDORES Y VISTAS GUARDADAS */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Contenedores</h3>
          <div className={styles.contenedoresList}>
            {contenedores.map((item) => (
              <div
                key={item.id}
                className={styles.contenedorItem}
                draggable
                onDragStart={() => handleDragStart(item)}
              >
                <div className={styles.contenedorIcon} style={{ backgroundColor: item.color }}>
                  {item.emoji || '📦'}
                </div>
                <div className={styles.contenedorInfo}>
                  <div className={styles.contenedorName}>{item.name}</div>
                  <div className={styles.contenedorTipo}>{item.tipo}</div>
                  <div className={styles.contenedorDimension}>{item.dimension}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.divider}></div>

          <h3 className={styles.sidebarTitle}>Vistas Guardadas</h3>
          <div className={styles.savedViewsList}>
            {savedViews.length === 0 ? (
              <p className={styles.emptyMessage}>No hay vistas guardadas</p>
            ) : (
              savedViews.map((view) => (
                <div key={view.id} className={styles.savedViewItem}>
                  <div className={styles.viewInfo}>
                    <div className={styles.viewName}>{view.name}</div>
                    <div className={styles.viewMeta}>
                      {view.elements.length} elementos • {view.assignedTo?.length || 0} pantallas
                    </div>
                  </div>
                  <div className={styles.viewActions}>
                    <button 
                      className={styles.viewActionBtn}
                      onClick={() => handleLoadView(view)}
                      title="Cargar vista"
                    >
                      📂
                    </button>
                    <button 
                      className={styles.viewActionBtn}
                      onClick={() => handleAssignView(view)}
                      title="Asignar pantallas"
                    >
                      🔗
                    </button>
                    <button 
                      className={styles.viewActionBtn}
                      onClick={() => deleteView(view.id)}
                      title="Eliminar vista"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ÁREA DE PREVISUALIZACIÓN */}
        <main 
          className={styles.previewArea}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className={styles.previewHeader}>
            <div>
              <h2 className={styles.previewTitle}>Composición de Vista</h2>
              <p className={styles.previewSubtitle}>Arrastrá los contenedores aquí para armar tu vista</p>
            </div>
            <div className={styles.previewActions}>
              <button 
                className={styles.btnSecondary}
                onClick={clearComposition}
                disabled={previewItems.length === 0}
              >
                🗑️ Limpiar
              </button>
              <button 
                className={styles.btnPrimary}
                onClick={() => setShowSaveModal(true)}
                disabled={previewItems.length === 0}
              >
                💾 Guardar Vista
              </button>
            </div>
          </div>

          {previewItems.length === 0 ? (
            <div className={styles.previewEmpty}>
              <div className={styles.emptyIcon}>📦</div>
              <p className={styles.emptyText}>Arrastrá elementos desde el menú lateral</p>
            </div>
          ) : (
            <div className={styles.previewGrid}>
              {previewItems.map((item) => (
                <div key={item.id} className={styles.previewCard}>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => removePreviewItem(item.id)}
                  >
                    ✕
                  </button>
                  <div 
                    className={styles.previewCardContent}
                    style={{ backgroundColor: item.color }}
                  >
                    <div className={styles.previewCardIcon}>
                      {item.emoji || '📦'}
                    </div>
                    <div className={styles.previewCardName}>{item.name}</div>
                    <div className={styles.previewCardDimension}>{item.dimension}</div>
                    <div className={styles.previewCardTipo}>{item.tipo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL GUARDAR VISTA */}
      {showSaveModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSaveModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Guardar Vista</h3>
              <button className={styles.modalClose} onClick={() => setShowSaveModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>
                Nombre de la vista:
                <input 
                  type="text"
                  className={styles.input}
                  value={currentViewName}
                  onChange={(e) => setCurrentViewName(e.target.value)}
                  placeholder="Ej: Vista Dashboard Principal"
                  autoFocus
                />
              </label>
              <div className={styles.modalInfo}>
                <p>Esta vista contiene <strong>{previewItems.length}</strong> elementos</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowSaveModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={handleSaveView}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR PANTALLAS */}
      {showAssignModal && selectedView && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Asignar Vista: {selectedView.name}</h3>
              <button className={styles.modalClose} onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalSubtitle}>Seleccioná las pantallas donde aplicar esta vista:</p>
              <div className={styles.screensList}>
                {pantallas.map((screen) => (
                  <label key={screen.id} className={styles.screenItem}>
                    <input 
                      type="checkbox"
                      checked={assignedScreens.includes(screen.id)}
                      onChange={() => toggleScreen(screen.id)}
                    />
                    <span className={styles.screenName}>{screen.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowAssignModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={saveAssignments}>
                Guardar Asignaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
