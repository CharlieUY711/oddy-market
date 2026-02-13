import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import DashboardHeader from '../../../../components/Dashboard/DashboardHeader';
import Toolbar from '../../../../components/Dashboard/Toolbar';
import styles from './Departments.module.css';

export const DepartmentsList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepts, setExpandedDepts] = useState(new Set());
  const [viewMode, setViewMode] = useState('icons'); // 'icons' | 'list'

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/departments?entity_id=default`);
      const data = await response.json();
      
      let deptsData = Array.isArray(data) ? data : [];
      
      if (deptsData.length === 0) {
        deptsData = getMockDepartments();
      }
      
      setDepartments(deptsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments(getMockDepartments());
    } finally {
      setLoading(false);
    }
  };

  const getMockDepartments = () => [
    {
      id: 'dept-1',
      name: 'Alimentos',
      icon: '🍕',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      active: true,
      config: {
        requires_expiry: true,
        requires_batch: true,
        requires_elaboration_date: true,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: [
        { id: 'cat-1-1', name: 'Frescos', icon: '🥗', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', subcategories: ['Frutas', 'Verduras', 'Carnes'] },
        { id: 'cat-1-2', name: 'Envasados', icon: '🥫', image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400', subcategories: ['Conservas', 'Snacks'] }
      ]
    },
    {
      id: 'dept-2',
      name: 'Higiene y Cuidado Personal',
      icon: '🧴',
      active: true,
      config: {
        requires_expiry: true,
        requires_batch: true,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: [
        { id: 'cat-2-1', name: 'Cuidado Personal', subcategories: ['Shampoo', 'Jabones'] },
        { id: 'cat-2-2', name: 'Perfumería', subcategories: ['Perfumes', 'Colonias'] }
      ]
    },
    {
      id: 'dept-3',
      name: 'Tecnología',
      icon: '💻',
      active: true,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'usd',
        tax_rate: 21
      },
      categories: [
        { id: 'cat-3-1', name: 'Computadoras', subcategories: ['Notebooks', 'Desktops', 'Tablets'] },
        { id: 'cat-3-2', name: 'Periféricos', subcategories: ['Mouse', 'Teclados', 'Webcams'] },
        { id: 'cat-3-3', name: 'Monitores', subcategories: ['Full HD', '4K', '8K'] }
      ]
    },
    {
      id: 'dept-4',
      name: 'Accesorios',
      icon: '👜',
      active: true,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-5',
      name: 'Moda y Accesorios',
      icon: '👗',
      active: true,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-6',
      name: 'Home Shopping',
      icon: '🏠',
      active: true,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-7',
      name: 'Herramientas y Mejoras',
      icon: '🔧',
      active: false,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: 'adult',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-8',
      name: 'Electrodomésticos',
      icon: '🔌',
      active: false,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'usd',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-9',
      name: 'Bebés y Niños',
      icon: '👶',
      active: true,
      config: {
        requires_expiry: true,
        requires_batch: true,
        requires_elaboration_date: false,
        age_range: '0-12',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-10',
      name: 'Deportes y Fitness',
      icon: '⚽',
      active: true,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-11',
      name: 'Automotriz',
      icon: '🚗',
      active: false,
      config: {
        requires_expiry: false,
        requires_batch: true,
        requires_elaboration_date: false,
        age_range: 'adult',
        currency: 'usd',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-12',
      name: 'Mascotas',
      icon: '🐕',
      active: true,
      config: {
        requires_expiry: true,
        requires_batch: true,
        requires_elaboration_date: false,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-13',
      name: 'Salud y Bienestar',
      icon: '💊',
      active: true,
      config: {
        requires_expiry: true,
        requires_batch: true,
        requires_elaboration_date: true,
        age_range: 'all',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    },
    {
      id: 'dept-14',
      name: 'Juguetería',
      icon: '🎮',
      active: true,
      config: {
        requires_expiry: false,
        requires_batch: false,
        requires_elaboration_date: false,
        age_range: '3-16',
        currency: 'local',
        tax_rate: 21
      },
      categories: []
    }
  ];

  const toggleDepartment = (deptId) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este departamento? Se eliminarán todas sus categorías y artículos.')) return;
    
    try {
      await fetch(`${API_BASE}/departments/${id}?entity_id=default`, {
        method: 'DELETE'
      });
      loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Error al eliminar el departamento');
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando departamentos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER ESTANDARIZADO */}
      <DashboardHeader title="🏢 Gestión de Departamentos" />

      {/* TOOLBAR ESTANDARIZADA - TODOS LOS MÓDULOS TIENEN LOS MISMOS BOTONES */}
      <Toolbar config={{
        showViewToggle: true,
        viewMode: viewMode === 'icons' ? 'navigation' : 'list',
        onViewModeChange: (mode) => setViewMode(mode === 'navigation' ? 'icons' : 'list'),
        showSearch: true,
        searchValue: searchTerm,
        onSearchChange: setSearchTerm,
        searchPlaceholder: 'Buscar departamento...',
        // 4 BOTONES ESTÁNDAR
        onNew: () => navigate('/admin-dashboard/modules/departments/new'),
        onEdit: () => {},
        onToggleSelection: () => {},
        onActions: () => {},
        isSelectionMode: false,
        selectedCount: 0,
        showBack: false
      }} />

      <div className={styles.infoBox}>
        <p><strong>📋 Información Importante:</strong></p>
        <ul>
          <li>El recorrido correcto es: <strong>Departamento → Categoría → SubCategoría</strong></li>
          <li>Solo se pueden eliminar departamentos sin productos asociados</li>
          <li>Los cambios en departamentos afectan a todos los artículos dentro de él</li>
        </ul>
      </div>

      {/* Vista de Iconos */}
      {viewMode === 'icons' && (
        <div className={styles.gridContainer}>
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className={styles.deptCard}>
              <div className={styles.deptCardImage} style={{backgroundImage: `url(${dept.image})`}}>
                <div className={styles.deptCardBadge}>
                  <span className={dept.active ? styles.activeBadge : styles.inactiveBadge}>
                    {dept.active ? '✓ Visible' : '✗ Oculto'}
                  </span>
                </div>
              </div>
              <div className={styles.deptCardContent}>
                <span className={styles.deptCardIcon}>{dept.icon}</span>
                <h3>{dept.name}</h3>
                <p>{dept.categories?.length || 0} categorías</p>
                <div className={styles.deptCardTags}>
                  <span className={styles.tag}>
                    {dept.config?.currency === 'usd' ? '💵 USD' : '💱 Local'}
                  </span>
                  <span className={styles.tag}>
                    IVA {dept.config?.tax_rate}%
                  </span>
                </div>
                <div className={styles.deptCardActions}>
                  <button
                    className={styles.btnEdit}
                    onClick={() => navigate(`/admin-dashboard/modules/departments/${dept.id}/edit`)}
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    className={styles.btnDelete}
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
          <thead>
            <tr>
              <th>Visible</th>
              <th>Icono</th>
              <th>Nombre</th>
              <th>Rango de Edad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => (
              <React.Fragment key={dept.id}>
                <tr className={styles.deptRow}>
                  <td>
                    <input
                      type="checkbox"
                      checked={dept.active}
                      onChange={() => {/* Toggle active */}}
                      className={styles.checkbox}
                    />
                  </td>
                  <td>
                    <span className={styles.deptIcon}>{dept.icon}</span>
                  </td>
                  <td>
                    <div className={styles.deptName}>
                      {dept.categories?.length > 0 && (
                        <button
                          className={styles.expandBtn}
                          onClick={() => toggleDepartment(dept.id)}
                        >
                          {expandedDepts.has(dept.id) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      )}
                      <strong>{dept.name}</strong>
                      {dept.categories?.length > 0 && (
                        <span className={styles.categoryCount}>
                          ({dept.categories.length} categorías)
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select className={styles.ageSelect} value={dept.config?.age_range || 'all'}>
                      <option value="all">Todos</option>
                      <option value="0-12">0-12 años</option>
                      <option value="3-16">3-16 años</option>
                      <option value="adult">Adultos</option>
                    </select>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/admin-dashboard/modules/departments/${dept.id}/edit`)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => handleDelete(dept.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Categorías expandibles */}
                {expandedDepts.has(dept.id) && dept.categories?.map((cat) => (
                  <tr key={cat.id} className={styles.categoryRow}>
                    <td></td>
                    <td></td>
                    <td>
                      <div className={styles.categoryName}>
                        <span className={styles.indent}>└─ 📂 {cat.name}</span>
                        {cat.subcategories?.length > 0 && (
                          <span className={styles.subcatCount}>
                            ({cat.subcategories.length} subcategorías)
                          </span>
                        )}
                      </div>
                    </td>
                    <td colSpan="2">
                      <div className={styles.subcategories}>
                        {cat.subcategories?.map((subcat, idx) => (
                          <span key={idx} className={styles.subcatBadge}>
                            📁 {subcat}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Config Summary */}
      <div className={styles.configSummary}>
        <h3>🔧 Configuraciones de Departamentos</h3>
        <div className={styles.configGrid}>
          {filteredDepartments.filter(d => d.active).map((dept) => (
            <div key={dept.id} className={styles.configCard}>
              <div className={styles.configHeader}>
                <span className={styles.configIcon}>{dept.icon}</span>
                <strong>{dept.name}</strong>
              </div>
              <div className={styles.configBody}>
                <div className={styles.configItem}>
                  {dept.config?.requires_expiry ? <Check size={14} color="#4caf50" /> : <X size={14} color="#f44336" />}
                  <span>Vencimiento</span>
                </div>
                <div className={styles.configItem}>
                  {dept.config?.requires_batch ? <Check size={14} color="#4caf50" /> : <X size={14} color="#f44336" />}
                  <span>Lote/Batch</span>
                </div>
                <div className={styles.configItem}>
                  {dept.config?.requires_elaboration_date ? <Check size={14} color="#4caf50" /> : <X size={14} color="#f44336" />}
                  <span>Fecha Elaboración</span>
                </div>
                <div className={styles.configItem}>
                  <span className={styles.badge}>
                    {dept.config?.currency === 'usd' ? '💵 USD' : '💱 Local'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
