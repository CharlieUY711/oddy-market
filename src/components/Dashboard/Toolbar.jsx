import React from 'react';
import { Plus, Edit, ListChecks, ArrowLeft, List, Network, Search, CheckSquare, Settings } from 'lucide-react';
import styles from './Toolbar.module.css';

/**
 * Toolbar - Barra de herramientas ESTANDARIZADA para TODOS los módulos del dashboard
 * TODOS LOS MÓDULOS TIENEN LOS MISMOS 4 BOTONES: Nuevo, Editar, Seleccionar, Acciones
 * 
 * Props:
 * @param {Object} config - Configuración de la barra de herramientas
 * @param {boolean} config.showViewToggle - Mostrar selector de vista (íconos/lista/árbol)
 * @param {string} config.viewMode - Modo de vista actual ('navigation' | 'tree' | 'list')
 * @param {function} config.onViewModeChange - Callback cuando cambia el modo de vista
 * @param {boolean} config.showSearch - Mostrar campo de búsqueda
 * @param {string} config.searchValue - Valor actual del buscador
 * @param {function} config.onSearchChange - Callback cuando cambia la búsqueda
 * @param {string} config.searchPlaceholder - Placeholder del buscador
 * @param {function} config.onNew - Callback del botón Nuevo
 * @param {function} config.onEdit - Callback del botón Editar
 * @param {function} config.onActions - Callback del botón Acciones
 * @param {boolean} config.isSelectionMode - Si está en modo selección
 * @param {function} config.onToggleSelection - Callback para activar/desactivar modo selección
 * @param {number} config.selectedCount - Cantidad de elementos seleccionados
 * @param {boolean} config.showBack - Mostrar botón de volver
 * @param {function} config.onBack - Callback del botón volver
 */
const Toolbar = ({ config = {} }) => {
  const {
    showViewToggle = false,
    viewMode = 'navigation',
    onViewModeChange,
    showSearch = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Buscar...',
    onNew,
    onEdit,
    onActions,
    isSelectionMode = false,
    onToggleSelection,
    selectedCount = 0,
    showBack = false,
    onBack,
  } = config;

  return (
    <div className={styles.toolbar}>
      {/* Grupo izquierdo: Selector de vista */}
      <div className={styles.leftGroup}>
        {showViewToggle && (
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'navigation' ? styles.active : ''}`}
              onClick={() => onViewModeChange?.('navigation')}
              title="Vista Navegación"
            >
              <List size={14} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'tree' ? styles.active : ''}`}
              onClick={() => onViewModeChange?.('tree')}
              title="Vista Árbol"
            >
              <Network size={14} />
            </button>
          </div>
        )}

        {/* BOTONES ESTÁNDAR - IGUALES PARA TODOS LOS MÓDULOS */}
        
        {/* Botón Nuevo (siempre naranja/primario) */}
        {onNew && (
          <button
            className={`${styles.toolbarBtn} ${styles.primaryBtn}`}
            onClick={onNew}
            title="Crear nuevo"
          >
            <Plus size={14} />
            <span>Nuevo</span>
          </button>
        )}

        {/* Botón Editar */}
        {onEdit && (
          <button
            className={styles.toolbarBtn}
            onClick={onEdit}
            title="Editar"
            disabled={!isSelectionMode || selectedCount === 0}
          >
            <Edit size={14} />
            <span>Editar</span>
          </button>
        )}

        {/* Botón Seleccionar */}
        {onToggleSelection && (
          <button
            className={`${styles.toolbarBtn} ${isSelectionMode ? styles.selectActive : ''}`}
            onClick={onToggleSelection}
            title={isSelectionMode ? 'Cancelar selección' : 'Seleccionar'}
          >
            <CheckSquare size={14} />
            <span>{isSelectionMode ? `Seleccionados (${selectedCount})` : 'Seleccionar'}</span>
          </button>
        )}

        {/* Botón Acciones */}
        {onActions && (
          <button
            className={styles.toolbarBtn}
            onClick={onActions}
            title="Acciones por lote"
            disabled={!isSelectionMode || selectedCount === 0}
          >
            <Settings size={14} />
            <span>Acciones</span>
          </button>
        )}
      </div>

      {/* Grupo central: Buscador */}
      {showSearch && (
        <div className={styles.centerGroup}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Grupo derecho: Volver */}
      <div className={styles.rightGroup}>
        {showBack && (
          <button
            className={styles.toolbarBtn}
            onClick={onBack}
            title="Volver"
          >
            <ArrowLeft size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
