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
  AlertCircle
} from 'lucide-react';
import styles from './Articles.module.css';

export const ArticlesList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // all, basic, intermediate, advanced

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/articles?entity_id=default`);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

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
      </div>

      {/* Articles Grid */}
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
