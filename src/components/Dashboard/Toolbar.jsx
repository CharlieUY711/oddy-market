import React from 'react';
import { Plus, Edit, ListChecks, ArrowLeft, List, Network, Search } from 'lucide-react';
import styles from './Toolbar.module.css';

/**
 * Toolbar - Barra de herramientas estandarizada para módulos del dashboard
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
 * @param {Array} config.actions - Array de acciones personalizadas
 *   Cada acción: { icon: Component, label: string, onClick: function, variant: 'primary'|'secondary' }
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
    actions = [],
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

        {/* Acciones principales */}
        {actions.map((action, index) => (
          <button
            key={index}
            className={`${styles.toolbarBtn} ${action.variant === 'primary' ? styles.primaryBtn : ''}`}
            onClick={action.onClick}
            title={action.label}
          >
            {action.icon && <action.icon />}
            <span>{action.label}</span>
          </button>
        ))}
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
