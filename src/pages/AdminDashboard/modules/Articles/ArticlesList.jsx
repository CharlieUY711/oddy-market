import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Tag,
  AlertCircle,
  Grid,
  List
} from 'lucide-react';
import { TreeTable } from '../TreeTable';
import styles from './Articles.module.css';

export const ArticlesList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // all, basic, intermediate, advanced
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'tree'

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/articles?entity_id=default`);
      const data = await response.json();
      
      let articlesData = Array.isArray(data) ? data : [];
      
      // Si no hay datos del backend, usar datos mock
      if (articlesData.length === 0) {
        articlesData = getMockArticles();
      }
      
      setArticles(articlesData);
    } catch (error) {
      console.error('Error loading articles:', error);
      // En caso de error, usar datos mock
      setArticles(getMockArticles());
    } finally {
      setLoading(false);
    }
  };

  const getMockArticles = () => [
    {
      id: 'mock-1',
      entity_id: 'default',
      basic: {
        name: 'Notebook Lenovo ThinkPad X1',
        sku: 'NB-LEN-001',
        barcode: '7798001234567',
        price: 45000,
        cost: 38000,
        stock: 15,
        description: 'Notebook profesional Intel i7, 16GB RAM, 512GB SSD',
        images: ['https://via.placeholder.com/300x200?text=Notebook'],
        department: 'Tecnología',
        category_id: 'Computadoras',
        subcategory: 'Notebooks',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {
          batch: 'LOTE-2024-001',
          purchase_date: '2024-02-01',
          supplier_id: 'SUP-001',
          expiry_date: '2025-12-31'
        },
        mercadolibre: { sync_enabled: true }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-2',
      entity_id: 'default',
      basic: {
        name: 'Mouse Logitech MX Master 3',
        sku: 'MOU-LOG-001',
        barcode: '7798001234568',
        price: 8500,
        cost: 6800,
        stock: 45,
        description: 'Mouse ergonómico inalámbrico para profesionales',
        images: [],
        department: 'Tecnología',
        category_id: 'Periféricos',
        subcategory: 'Mouse',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {},
        mercadolibre: { sync_enabled: false }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-3',
      entity_id: 'default',
      basic: {
        name: 'Teclado Mecánico RGB Corsair',
        sku: 'KEY-RGB-001',
        barcode: '7798001234569',
        price: 12000,
        cost: 9500,
        stock: 8,
        description: 'Teclado mecánico gaming con iluminación RGB personalizable',
        images: [],
        department: 'Tecnología',
        category_id: 'Periféricos',
        subcategory: 'Teclados',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {},
        mercadolibre: { sync_enabled: true }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-4',
      entity_id: 'default',
      basic: {
        name: 'Monitor Samsung 27" 4K UHD',
        sku: 'MON-SAM-001',
        barcode: '7798001234570',
        price: 32000,
        cost: 26000,
        stock: 5,
        description: 'Monitor profesional 27 pulgadas resolución 4K UHD',
        images: [],
        department: 'Tecnología',
        category_id: 'Monitores',
        subcategory: '4K',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {},
        mercadolibre: { sync_enabled: false }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-5',
      entity_id: 'default',
      basic: {
        name: 'Webcam Logitech C920 HD Pro',
        sku: 'WEB-LOG-001',
        barcode: '7798001234571',
        price: 6500,
        cost: 5200,
        stock: 22,
        description: 'Webcam HD 1080p para videoconferencias profesionales',
        images: [],
        department: 'Tecnología',
        category_id: 'Periféricos',
        subcategory: 'Webcams',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {},
        mercadolibre: { sync_enabled: false }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-6',
      entity_id: 'default',
      basic: {
        name: 'Auriculares Sony WH-1000XM5',
        sku: 'AUD-SON-001',
        barcode: '7798001234572',
        price: 18500,
        cost: 15200,
        stock: 12,
        description: 'Auriculares inalámbricos con cancelación de ruido activa',
        images: [],
        department: 'Electrónica',
        category_id: 'Audio',
        subcategory: 'Auriculares',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {},
        mercadolibre: { sync_enabled: true }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-7',
      entity_id: 'default',
      basic: {
        name: 'SSD Samsung 970 EVO Plus 1TB',
        sku: 'SSD-SAM-001',
        barcode: '7798001234573',
        price: 9800,
        cost: 8200,
        stock: 28,
        description: 'Disco SSD NVMe M.2 de alta velocidad 1TB',
        images: [],
        department: 'Tecnología',
        category_id: 'Almacenamiento',
        subcategory: 'SSD',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {},
        mercadolibre: { sync_enabled: false }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-8',
      entity_id: 'default',
      basic: {
        name: 'Silla Gamer RGB Racer Pro',
        sku: 'SIL-GAM-001',
        barcode: '7798001234574',
        price: 24500,
        cost: 19800,
        stock: 3,
        description: 'Silla ergonómica para gaming con soporte lumbar ajustable',
        images: [],
        department: 'Muebles',
        category_id: 'Oficina',
        subcategory: 'Sillas Gaming',
        status: 'active'
      },
      intermediate: {
        variants: [],
        traceability: {},
        mercadolibre: { sync_enabled: true }
      },
      createdAt: new Date().toISOString()
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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.basic?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.basic?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.basic?.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || 
      (filterLevel === 'basic' && article.basic) ||
      (filterLevel === 'intermediate' && article.intermediate) ||
      (filterLevel === 'advanced' && article.advanced);

    return matchesSearch && matchesLevel;
  });

  // Convertir artículos a estructura de árbol
  const buildTreeData = () => {
    const tree = [];
    const departments = new Map();
    const categories = new Map();
    const subcategories = new Map();

    // Agrupar artículos por departamento → categoría → subcategoría
    filteredArticles.forEach(article => {
      const dept = article.basic?.department || 'Sin Departamento';
      const cat = article.basic?.category_id || 'Sin Categoría';
      const subcat = article.basic?.subcategory || null;

      // Crear departamento
      if (!departments.has(dept)) {
        departments.set(dept, {
          id: `dept-${dept}`,
          name: dept,
          icon: '🏢',
          type: 'department',
          children: []
        });
      }

      // Crear categoría
      const catKey = `${dept}|${cat}`;
      if (!categories.has(catKey)) {
        categories.set(catKey, {
          id: `cat-${catKey}`,
          name: cat,
          icon: '📂',
          type: 'category',
          parent: dept,
          children: []
        });
      }

      // Si hay subcategoría
      if (subcat) {
        const subcatKey = `${dept}|${cat}|${subcat}`;
        if (!subcategories.has(subcatKey)) {
          subcategories.set(subcatKey, {
            id: `subcat-${subcatKey}`,
            name: subcat,
            icon: '📁',
            type: 'subcategory',
            parent: catKey,
            children: []
          });
        }
        subcategories.get(subcatKey).children.push({
          ...article,
          type: 'article',
          name: article.basic?.name
        });
      } else {
        categories.get(catKey).children.push({
          ...article,
          type: 'article',
          name: article.basic?.name
        });
      }
    });

    // Construir árbol
    subcategories.forEach((subcat) => {
      const category = categories.get(subcat.parent);
      if (category) {
        category.children.push(subcat);
      }
    });

    categories.forEach((cat) => {
      const department = departments.get(cat.parent);
      if (department) {
        department.children.push(cat);
      }
    });

    departments.forEach((dept) => {
      tree.push(dept);
    });

    return tree;
  };

  const treeColumns = [
    {
      label: 'Nombre',
      field: 'name',
      render: (node) => node.name || node.basic?.name
    },
    {
      label: 'SKU',
      field: 'sku',
      render: (node) => node.type === 'article' ? node.basic?.sku : '-'
    },
    {
      label: 'Precio',
      field: 'price',
      render: (node) => node.type === 'article' ? formatCurrency(node.basic?.price) : '-'
    },
    {
      label: 'Stock',
      field: 'stock',
      render: (node) => {
        if (node.type !== 'article') return '-';
        const status = getStockStatus(node.basic?.stock);
        return (
          <span style={{ color: status.color, fontWeight: 600 }}>
            {node.basic?.stock || 0}
          </span>
        );
      }
    },
    {
      label: 'Estado',
      field: 'status',
      render: (node) => {
        if (node.type !== 'article') return '-';
        const statusMap = {
          active: { label: 'Activo', color: '#4caf50' },
          inactive: { label: 'Inactivo', color: '#9e9e9e' },
          draft: { label: 'Borrador', color: '#ff9800' }
        };
        const status = statusMap[node.basic?.status] || statusMap.active;
        return (
          <span style={{ color: status.color, fontWeight: 600 }}>
            {status.label}
          </span>
        );
      }
    }
  ];

  const getStockStatus = (stock) => {
    if (!stock || stock === 0) return { label: 'Sin Stock', color: '#f44336' };
    if (stock < 10) return { label: 'Stock Bajo', color: '#ff9800' };
    return { label: 'En Stock', color: '#4caf50' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando artículos...</p>
      </div>
    );
  }

  return (
    <div className={styles.articlesContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>📦 Artículos</h1>
          <p className={styles.subtitle}>
            {filteredArticles.length} artículo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          className={styles.btnPrimary}
          onClick={() => navigate('/admin-dashboard/ecommerce/articles/new')}
        >
          <Plus size={20} />
          Nuevo Artículo
        </button>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterBtn} ${filterLevel === 'all' ? styles.active : ''}`}
            onClick={() => setFilterLevel('all')}
          >
            Todos
          </button>
          <button 
            className={`${styles.filterBtn} ${filterLevel === 'basic' ? styles.active : ''}`}
            onClick={() => setFilterLevel('basic')}
          >
            Básicos
          </button>
          <button 
            className={`${styles.filterBtn} ${filterLevel === 'intermediate' ? styles.active : ''}`}
            onClick={() => setFilterLevel('intermediate')}
          >
            Intermedios
          </button>
          <button 
            className={`${styles.filterBtn} ${filterLevel === 'advanced' ? styles.active : ''}`}
            onClick={() => setFilterLevel('advanced')}
          >
            Avanzados
          </button>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista de Iconos"
            >
              <Grid size={20} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'tree' ? styles.active : ''}`}
              onClick={() => setViewMode('tree')}
              title="Vista de Lista (Árbol)"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Articles View */}
      {filteredArticles.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={64} color="#bdbdbd" />
          <h3>No hay artículos</h3>
          <p>Comienza creando tu primer artículo</p>
          <button 
            className={styles.btnPrimary}
            onClick={() => navigate('/admin-dashboard/ecommerce/articles/new')}
          >
            <Plus size={20} />
            Crear Artículo
          </button>
        </div>
      ) : viewMode === 'tree' ? (
        <TreeTable
          data={buildTreeData()}
          columns={treeColumns}
          onRowClick={(node) => {
            if (node.type === 'article') {
              navigate(`/admin-dashboard/modules/articles/${node.id}`);
            }
          }}
          onEdit={(node) => {
            if (node.type === 'article') {
              navigate(`/admin-dashboard/modules/articles/${node.id}/edit`);
            }
          }}
          onDelete={(node) => {
            if (node.type === 'article') {
              handleDelete(node.id);
            }
          }}
        />
      ) : (
        <div className={styles.articlesGrid}>
          {filteredArticles.map((article) => {
            const stockStatus = getStockStatus(article.basic?.stock);
            const hasVariants = article.intermediate?.variants?.length > 0;

            return (
              <div key={article.id} className={styles.articleCard}>
                {/* Image */}
                <div className={styles.articleImage}>
                  {article.basic?.images?.[0] ? (
                    <img src={article.basic.images[0]} alt={article.basic?.name} />
                  ) : (
                    <div className={styles.noImage}>
                      <Package size={48} color="#bdbdbd" />
                    </div>
                  )}
                  {hasVariants && (
                    <span className={styles.variantBadge}>
                      {article.intermediate.variants.length} variantes
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className={styles.articleContent}>
                  <h3 className={styles.articleName}>{article.basic?.name || 'Sin nombre'}</h3>
                  <p className={styles.articleSku}>SKU: {article.basic?.sku || 'N/A'}</p>
                  
                  <div className={styles.articleMeta}>
                    <span className={styles.price}>
                      {formatCurrency(article.basic?.price)}
                    </span>
                    <span 
                      className={styles.stock}
                      style={{ color: stockStatus.color }}
                    >
                      <Tag size={14} />
                      {stockStatus.label}
                    </span>
                  </div>

                  {/* Level Indicator */}
                  <div className={styles.levelIndicator}>
                    <span className={`${styles.levelDot} ${article.basic ? styles.active : ''}`}></span>
                    <span className={`${styles.levelDot} ${article.intermediate ? styles.active : ''}`}></span>
                    <span className={`${styles.levelDot} ${article.advanced ? styles.active : ''}`}></span>
                  </div>

                  {/* Alerts */}
                  {article.intermediate?.traceability?.expiry_date && (
                    <div className={styles.alert}>
                      <AlertCircle size={14} />
                      <span>Vence: {new Date(article.intermediate.traceability.expiry_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.articleActions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate(`/admin-dashboard/ecommerce/articles/${article.id}`)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate(`/admin-dashboard/ecommerce/articles/${article.id}/edit`)}
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={() => handleDelete(article.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
