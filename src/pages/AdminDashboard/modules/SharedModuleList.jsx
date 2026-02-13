import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import DashboardHeader from '../../../components/Dashboard/DashboardHeader';
import Toolbar from '../../../components/Dashboard/Toolbar';
import styles from './SharedModule.module.css';

/**
 * Componente reutilizable para listados de módulos
 * @param {string} endpoint - Endpoint del API (ej: '/inventory/stock')
 * @param {string} title - Título del módulo
 * @param {string} icon - Emoji del módulo
 * @param {function} renderCard - Función para renderizar cada card
 * @param {string} createPath - Ruta para crear nuevo item
 * @param {array} columns - Columnas para vista de tabla
 */
export const SharedModuleList = ({ 
  endpoint, 
  title, 
  icon = '📦',
  renderCard,
  createPath,
  columns = [],
  viewMode = 'cards', // 'cards' | 'table'
  mockData = [] // Datos mock para fallback
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  useEffect(() => {
    loadItems();
  }, [endpoint]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}${endpoint}?entity_id=default`);
      const data = await response.json();
      
      let itemsData = Array.isArray(data) ? data : [];
      
      // Si no hay datos del backend, usar datos mock
      if (itemsData.length === 0 && mockData.length > 0) {
        itemsData = mockData;
      }
      
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading items:', error);
      // En caso de error, usar datos mock si están disponibles
      setItems(mockData.length > 0 ? mockData : []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    
    try {
      await fetch(`${API_BASE}${endpoint}/${id}?entity_id=default`, {
        method: 'DELETE'
      });
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error al eliminar');
    }
  };

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return JSON.stringify(item).toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER ESTANDARIZADO */}
      <DashboardHeader title={`${icon} ${title}`} />

      {/* TOOLBAR ESTANDARIZADA - TODOS LOS MÓDULOS TIENEN LOS MISMOS BOTONES */}
      <Toolbar config={{
        showViewToggle: false,
        showSearch: true,
        searchValue: searchTerm,
        onSearchChange: setSearchTerm,
        searchPlaceholder: 'Buscar...',
        // 4 BOTONES ESTÁNDAR
        onNew: createPath ? () => navigate(createPath) : null,
        onEdit: () => {},
        onToggleSelection: () => {},
        onActions: () => {},
        isSelectionMode: false,
        selectedCount: 0,
        showBack: false
      }} />

      <div className={styles.subtitle}>
        {filteredItems.length} elemento{filteredItems.length !== 1 ? 's' : ''}
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No hay elementos</h3>
          <p>Comienza creando el primer elemento</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className={styles.grid}>
          {filteredItems.map(item => renderCard(item, { handleDelete }))}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  {columns.map((col, idx) => (
                    <td key={idx}>{col.render ? col.render(item) : item[col.field]}</td>
                  ))}
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn}>
                        <Eye size={16} />
                      </button>
                      <button className={styles.actionBtn}>
                        <Edit size={16} />
                      </button>
                      <button className={styles.actionBtn} onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
