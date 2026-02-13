import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Package, ArrowLeft } from 'lucide-react';
import DashboardHeader from '../../../../components/Dashboard/DashboardHeader';
import Toolbar from '../../../../components/Dashboard/Toolbar';
import styles from './Articles.module.css';
import { TreeTable } from '../TreeTable';

export const ArticlesList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('navigation'); // 'navigation' | 'tree'
  
  // Navegación por niveles (solo para modo 'navigation')
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);

  // Modo selección
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState(new Set());

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  useEffect(() => {
    loadDepartments();
    loadArticles();
  }, []);

  const loadDepartments = async () => {
    try {
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
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/articles?entity_id=default`);
      const data = await response.json();
      
      let articlesData = Array.isArray(data) ? data : data.articles || [];
      
      if (articlesData.length === 0) {
        articlesData = getMockArticles();
      }
      
      setArticles(articlesData);
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles(getMockArticles());
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
      categories: [
        { 
          id: 'cat-1-1', 
          name: 'Frescos', 
          icon: '🥗',
          image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
          subcategories: ['Frutas', 'Verduras', 'Carnes'] 
        },
        { 
          id: 'cat-1-2', 
          name: 'Envasados', 
          icon: '🥫',
          image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400',
          subcategories: ['Conservas', 'Snacks', 'Cereales'] 
        }
      ]
    },
    {
      id: 'dept-2',
      name: 'Tecnología',
      icon: '💻',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
      active: true,
      categories: [
        { 
          id: 'cat-2-1', 
          name: 'Computadoras', 
          icon: '🖥️',
          image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400',
          subcategories: ['Notebooks', 'Desktops', 'Tablets', 'All-in-One'] 
        },
        { 
          id: 'cat-2-2', 
          name: 'Periféricos', 
          icon: '⌨️',
          image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400',
          subcategories: ['Mouse', 'Teclados', 'Webcams', 'Auriculares'] 
        },
        { 
          id: 'cat-2-3', 
          name: 'Monitores', 
          icon: '🖥️',
          image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
          subcategories: ['Full HD', '2K', '4K', 'Gaming'] 
        },
        { 
          id: 'cat-2-4', 
          name: 'Almacenamiento', 
          icon: '💾',
          image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
          subcategories: ['HDD', 'SSD', 'Pendrives', 'Tarjetas SD'] 
        }
      ]
    },
    {
      id: 'dept-3',
      name: 'Electrónica',
      icon: '📱',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      active: true,
      categories: [
        { 
          id: 'cat-3-1', 
          name: 'Smartphones', 
          icon: '📱',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
          subcategories: ['iPhone', 'Samsung', 'Xiaomi', 'Motorola'] 
        },
        { 
          id: 'cat-3-2', 
          name: 'Audio', 
          icon: '🎧',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          subcategories: ['Auriculares', 'Parlantes', 'Soundbars'] 
        }
      ]
    },
    {
      id: 'dept-4',
      name: 'Muebles',
      icon: '🪑',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      active: true,
      categories: [
        { 
          id: 'cat-4-1', 
          name: 'Living', 
          icon: '🛋️',
          image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400',
          subcategories: ['Sillones', 'Mesas', 'Bibliotecas'] 
        },
        { 
          id: 'cat-4-2', 
          name: 'Dormitorio', 
          icon: '🛏️',
          image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400',
          subcategories: ['Camas', 'Placares', 'Mesas de Luz'] 
        }
      ]
    }
  ];

  const getMockArticles = () => [
    {
      id: 'art-1',
      name: 'Notebook HP Pavilion 15.6"',
      sku: 'NB-HP-001',
      price: 899.99,
      stock: 15,
      department: 'Tecnología',
      category: 'Computadoras',
      subCategory: 'Notebooks',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
      status: 'active'
    },
    {
      id: 'art-2',
      name: 'MacBook Air M2',
      sku: 'NB-MAC-001',
      price: 1299.99,
      stock: 8,
      department: 'Tecnología',
      category: 'Computadoras',
      subCategory: 'Notebooks',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
      status: 'active'
    },
    {
      id: 'art-3',
      name: 'Mouse Logitech MX Master 3',
      sku: 'MOU-LOG-001',
      price: 99.99,
      stock: 45,
      department: 'Tecnología',
      category: 'Periféricos',
      subCategory: 'Mouse',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300',
      status: 'active'
    },
    {
      id: 'art-4',
      name: 'Monitor Samsung 27" 4K',
      sku: 'MON-SAM-001',
      price: 449.99,
      stock: 12,
      department: 'Tecnología',
      category: 'Monitores',
      subCategory: '4K',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300',
      status: 'active'
    },
    {
      id: 'art-5',
      name: 'iPhone 15 Pro 256GB',
      sku: 'IP-15P-256',
      price: 1199.99,
      stock: 20,
      department: 'Electrónica',
      category: 'Smartphones',
      subCategory: 'iPhone',
      image: 'https://images.unsplash.com/photo-1592286927505-c80e2a5e6c1c?w=300',
      status: 'active'
    },
    {
      id: 'art-6',
      name: 'Sillón 3 Cuerpos Gris',
      sku: 'SIL-3C-GR',
      price: 599.99,
      stock: 5,
      department: 'Muebles',
      category: 'Living',
      subCategory: 'Sillones',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300',
      status: 'active'
    }
  ];

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    
    try {
      await fetch(`${API_BASE}/articles/${id}?entity_id=default`, {
        method: 'DELETE'
      });
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error al eliminar el artículo');
    }
  };

  // Navegación
  const goBack = () => {
    if (currentSubCategory) {
      setCurrentSubCategory(null);
    } else if (currentCategory) {
      setCurrentCategory(null);
    } else if (currentDepartment) {
      setCurrentDepartment(null);
    }
  };

  const resetNavigation = () => {
    setCurrentDepartment(null);
    setCurrentCategory(null);
    setCurrentSubCategory(null);
  };

  // Modo selección
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedArticles(new Set()); // Limpiar selección al salir del modo
    }
  };

  const toggleArticleSelection = (articleId) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  // Construir breadcrumbs para el header
  const getBreadcrumbs = () => {
    const crumbs = [
      { label: 'eCommerce', path: '/admin-dashboard' },
      { label: 'Artículos', path: currentDepartment ? '/admin-dashboard/modules/articles' : null }
    ];
    
    if (currentDepartment) {
      crumbs.push({ 
        label: currentDepartment.name, 
        path: currentCategory ? null : null 
      });
    }
    
    if (currentCategory) {
      crumbs.push({ 
        label: currentCategory.name, 
        path: currentSubCategory ? null : null 
      });
    }
    
    if (currentSubCategory) {
      crumbs.push({ 
        label: currentSubCategory, 
        path: null 
      });
    }
    
    return crumbs;
  };

  // Filtrar artículos según navegación
  const getFilteredArticles = () => {
    if (!currentDepartment) return [];
    
    return articles.filter(art => {
      const matchDept = art.department === currentDepartment.name;
      const matchCat = !currentCategory || art.category === currentCategory.name;
      const matchSubCat = !currentSubCategory || art.subCategory === currentSubCategory;
      const matchSearch = art.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchDept && matchCat && matchSubCat && matchSearch;
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando artículos...</p>
      </div>
    );
  }

  // Construir datos para TreeTable
  const buildTreeData = () => {
    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      icon: dept.icon,
      type: 'department',
      children: dept.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        type: 'category',
        children: cat.subcategories?.map((subcat, idx) => ({
          id: `${cat.id}-${idx}`,
          name: subcat,
          icon: '📁',
          type: 'subcategory',
          children: articles
            .filter(art => 
              art.department === dept.name && 
              art.category === cat.name && 
              art.subCategory === subcat
            )
            .map(art => ({
              id: art.id,
              name: art.name,
              sku: art.sku,
              price: art.price,
              stock: art.stock,
              type: 'article',
              article: art
            }))
        })) || []
      })) || []
    }));
  };

  return (
    <div className={styles.articlesContainer}>
      {/* HEADER ESTANDARIZADO - Se define una sola vez y se reutiliza */}
      <DashboardHeader 
        title="📦 Artículos" 
        breadcrumbs={getBreadcrumbs()}
      />

      {/* TOOLBAR ESTANDARIZADA - Configuración específica del módulo */}
      <Toolbar config={{
        showViewToggle: true,
        viewMode: viewMode,
        onViewModeChange: setViewMode,
        showSearch: true,
        searchValue: searchTerm,
        onSearchChange: setSearchTerm,
        searchPlaceholder: 'Buscar artículos...',
        showSelectionMode: currentSubCategory && getFilteredArticles().length > 0,
        isSelectionMode: isSelectionMode,
        onToggleSelection: toggleSelectionMode,
        selectedCount: selectedArticles.size,
        actions: [
          {
            icon: Plus,
            label: 'Nuevo',
            onClick: () => navigate('/admin-dashboard/modules/articles/new'),
            variant: 'primary'
          }
        ],
        showBack: viewMode === 'navigation' && (currentDepartment || currentCategory || currentSubCategory),
        onBack: goBack
      }} />

      {/* MODO NAVEGACIÓN */}
      {viewMode === 'navigation' && (
        <>
          {/* Nivel 1: Departamentos */}
          {!currentDepartment && (
        <div className={styles.gridContainer}>
          {departments.filter(d => d.active).map((dept) => (
            <div 
              key={dept.id} 
              className={styles.navCard}
              onClick={() => setCurrentDepartment(dept)}
            >
              <div className={styles.navCardImage} style={{backgroundImage: `url(${dept.image})`}}></div>
              <div className={styles.navCardContent}>
                <span className={styles.navCardIcon}>{dept.icon}</span>
                <h3>{dept.name}</h3>
                <p>{dept.categories?.length || 0} categorías</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nivel 2: Categorías */}
      {currentDepartment && !currentCategory && (
        <div className={styles.gridContainer}>
          {currentDepartment.categories?.map((cat) => (
            <div 
              key={cat.id} 
              className={styles.navCard}
              onClick={() => setCurrentCategory(cat)}
            >
              <div className={styles.navCardImage} style={{backgroundImage: `url(${cat.image})`}}></div>
              <div className={styles.navCardContent}>
                <span className={styles.navCardIcon}>{cat.icon}</span>
                <h3>{cat.name}</h3>
                <p>{cat.subcategories?.length || 0} subcategorías</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nivel 3: SubCategorías */}
      {currentCategory && !currentSubCategory && (
        <div className={styles.gridContainer}>
          {currentCategory.subcategories?.map((subcat, idx) => (
            <div 
              key={idx} 
              className={styles.navCard}
              onClick={() => setCurrentSubCategory(subcat)}
            >
              <div className={styles.navCardImage} style={{backgroundImage: `url(${currentCategory.image})`}}></div>
              <div className={styles.navCardContent}>
                <span className={styles.navCardIcon}>📁</span>
                <h3>{subcat}</h3>
                <p>Ver artículos →</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nivel 4: Lista de Artículos */}
      {currentSubCategory && (
        <div className={styles.articlesList}>
          {getFilteredArticles().length === 0 ? (
            <div className={styles.articlesGrid}>
              <div 
                className={styles.emptyArticleCard}
                onClick={() => navigate('/admin-dashboard/modules/articles/new')}
              >
                <span className={styles.emptyCardText}>Crear</span>
              </div>
            </div>
          ) : (
            <div className={styles.articlesGrid}>
              {getFilteredArticles().map((article) => (
                <div 
                  key={article.id} 
                  className={`${styles.articleCard} ${isSelectionMode ? styles.selectable : ''} ${selectedArticles.has(article.id) ? styles.selected : ''}`}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleArticleSelection(article.id);
                    }
                  }}
                >
                  {/* Checkbox circular en modo selección */}
                  {isSelectionMode && (
                    <div className={styles.selectionCheckbox}>
                      <div className={`${styles.checkbox} ${selectedArticles.has(article.id) ? styles.checked : ''}`}>
                        {selectedArticles.has(article.id) && <span>✓</span>}
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className={styles.articleCardImage} 
                    style={{backgroundImage: `url(${article.image})`}}
                    onClick={(e) => {
                      if (!isSelectionMode) {
                        navigate(`/admin-dashboard/modules/articles/${article.id}/edit`);
                      }
                    }}
                  />
                  <div className={styles.articleCardContent}>
                    <h4 className={styles.articleCardTitle}>{article.name}</h4>
                    <p className={styles.articleCardPrice}>${article.price}</p>
                    <p className={styles.articleCardStock}>
                      <span className={article.stock < 10 ? styles.lowStock : styles.inStock}>
                        {article.stock} en stock
                      </span>
                    </p>
                    {!isSelectionMode && (
                      <div className={styles.articleCardActions}>
                        <button
                          className={styles.cardActionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin-dashboard/modules/articles/${article.id}/edit`);
                          }}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className={`${styles.cardActionBtn} ${styles.danger}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(article.id);
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Tarjeta "Crear" al final cuando hay artículos */}
              <div 
                className={styles.emptyArticleCard}
                onClick={() => navigate('/admin-dashboard/modules/articles/new')}
              >
                <span className={styles.emptyCardText}>Crear</span>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}

      {/* MODO ÁRBOL */}
      {viewMode === 'tree' && (
        <div className={styles.treeViewContainer}>
          <TreeTable 
            data={buildTreeData()}
            columns={[
              { 
                field: 'name', 
                label: 'Nombre',
                render: (item) => <span>{item.name}</span>
              },
              { 
                field: 'sku', 
                label: 'SKU',
                render: (item) => item.type === 'article' ? <code>{item.sku}</code> : null
              },
              { 
                field: 'price', 
                label: 'Precio',
                render: (item) => item.type === 'article' ? <strong>${item.price}</strong> : null
              },
              { 
                field: 'stock', 
                label: 'Stock',
                render: (item) => item.type === 'article' ? (
                  <span className={item.stock < 10 ? styles.lowStock : styles.inStock}>
                    {item.stock} unidades
                  </span>
                ) : null
              }
            ]}
            onEdit={(item) => item.type === 'article' && navigate(`/admin-dashboard/modules/articles/${item.id}/edit`)}
            onDelete={(item) => item.type === 'article' && handleDelete(item.id)}
          />
        </div>
      )}
    </div>
  );
};
