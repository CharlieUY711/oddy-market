import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import styles from './Articles.module.css';

export const ArticleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    intermediate: false,
    advanced: false
  });

  const [formData, setFormData] = useState({
    entity_id: 'default',
    basic: {
      name: '',
      sku: '',
      barcode: '',
      price: 0,
      cost: 0,
      stock: 0,
      description: '',
      images: [],
      category_id: '',
      status: 'active'
    },
    intermediate: {
      variants: [],
      traceability: {
        batch: '',
        elaboration_date: '',
        purchase_date: '',
        supplier_id: '',
        expiry_date: ''
      },
      mercadolibre: {
        ml_id: '',
        ml_permalink: '',
        sync_enabled: false
      }
    },
    advanced: {
      seo: {
        meta_title: '',
        meta_description: '',
        keywords: []
      },
      dimensions: {
        weight: 0,
        width: 0,
        height: 0,
        length: 0
      },
      custom_fields: {}
    }
  });

  useEffect(() => {
    if (isEdit) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/articles/${id}?entity_id=default`);
      const data = await response.json();
      if (data.article) {
        setFormData(data.article);
      }
    } catch (error) {
      console.error('Error loading article:', error);
      alert('Error al cargar el artículo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.basic.name) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      setSaving(true);
      const url = isEdit 
        ? `${API_BASE}/articles/${id}?entity_id=default`
        : `${API_BASE}/articles?entity_id=default`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.article) {
        alert(isEdit ? 'Artículo actualizado' : 'Artículo creado');
        navigate('/admin-dashboard/ecommerce/articles');
      } else {
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateBasic = (field, value) => {
    setFormData(prev => ({
      ...prev,
      basic: { ...prev.basic, [field]: value }
    }));
  };

  const updateIntermediate = (field, value) => {
    setFormData(prev => ({
      ...prev,
      intermediate: { ...prev.intermediate, [field]: value }
    }));
  };

  const updateTraceability = (field, value) => {
    setFormData(prev => ({
      ...prev,
      intermediate: {
        ...prev.intermediate,
        traceability: { ...prev.intermediate.traceability, [field]: value }
      }
    }));
  };

  const updateAdvanced = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [section]: { ...prev.advanced[section], [field]: value }
      }
    }));
  };

  const addVariant = () => {
    const newVariant = {
      id: `variant-${Date.now()}`,
      name: '',
      sku: '',
      price: formData.basic.price,
      stock: 0,
      attributes: {}
    };
    updateIntermediate('variants', [...formData.intermediate.variants, newVariant]);
    toggleSection('intermediate');
  };

  const removeVariant = (variantId) => {
    updateIntermediate(
      'variants',
      formData.intermediate.variants.filter(v => v.id !== variantId)
    );
  };

  const updateVariant = (variantId, field, value) => {
    updateIntermediate(
      'variants',
      formData.intermediate.variants.map(v =>
        v.id === variantId ? { ...v, [field]: value } : v
      )
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando artículo...</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      {/* Header */}
      <header className={styles.formHeader}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? '✏️ Editar Artículo' : '➕ Nuevo Artículo'}
          </h1>
          <p className={styles.subtitle}>
            Completá la información en 3 niveles: Básico, Intermedio y Avanzado
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate('/admin-dashboard/ecommerce/articles')}
          >
            <X size={20} />
            Cancelar
          </button>
          <button 
            type="button"
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={saving}
          >
            <Save size={20} />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* NIVEL BÁSICO */}
        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => toggleSection('basic')}
          >
            <div className={styles.sectionTitle}>
              <span className={`${styles.levelBadge} ${styles.basic}`}>A</span>
              <span>Nivel Básico</span>
              <span className={styles.required}>* Obligatorio</span>
            </div>
            {expandedSections.basic ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {expandedSections.basic && (
            <div className={styles.sectionContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.basic.name}
                    onChange={(e) => updateBasic('name', e.target.value)}
                    placeholder="Ej: Remera Nike Dri-FIT"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>SKU *</label>
                  <input
                    type="text"
                    value={formData.basic.sku}
                    onChange={(e) => updateBasic('sku', e.target.value)}
                    placeholder="Ej: REM-NIKE-001"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Código de Barras</label>
                  <input
                    type="text"
                    value={formData.basic.barcode}
                    onChange={(e) => updateBasic('barcode', e.target.value)}
                    placeholder="Ej: 7798123456789"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basic.price}
                    onChange={(e) => updateBasic('price', parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basic.cost}
                    onChange={(e) => updateBasic('cost', parseFloat(e.target.value))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={formData.basic.stock}
                    onChange={(e) => updateBasic('stock', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Descripción</label>
                <textarea
                  value={formData.basic.description}
                  onChange={(e) => updateBasic('description', e.target.value)}
                  placeholder="Describe el producto..."
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Estado</label>
                <select
                  value={formData.basic.status}
                  onChange={(e) => updateBasic('status', e.target.value)}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* NIVEL INTERMEDIO */}
        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => toggleSection('intermediate')}
          >
            <div className={styles.sectionTitle}>
              <span className={`${styles.levelBadge} ${styles.intermediate}`}>A+B</span>
              <span>Nivel Intermedio</span>
              <span className={styles.optional}>Opcional</span>
            </div>
            {expandedSections.intermediate ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {expandedSections.intermediate && (
            <div className={styles.sectionContent}>
              {/* Trazabilidad */}
              <h4>📦 Trazabilidad</h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Lote/Batch</label>
                  <input
                    type="text"
                    value={formData.intermediate.traceability.batch}
                    onChange={(e) => updateTraceability('batch', e.target.value)}
                    placeholder="Ej: LOTE-2024-001"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Fecha Elaboración</label>
                  <input
                    type="date"
                    value={formData.intermediate.traceability.elaboration_date}
                    onChange={(e) => updateTraceability('elaboration_date', e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Fecha Compra</label>
                  <input
                    type="date"
                    value={formData.intermediate.traceability.purchase_date}
                    onChange={(e) => updateTraceability('purchase_date', e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={formData.intermediate.traceability.expiry_date}
                    onChange={(e) => updateTraceability('expiry_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Variantes */}
              <div className={styles.variantsSection}>
                <div className={styles.variantsHeader}>
                  <h4>🎨 Variantes</h4>
                  <button
                    type="button"
                    className={styles.btnSmall}
                    onClick={addVariant}
                  >
                    <Plus size={16} />
                    Agregar Variante
                  </button>
                </div>

                {formData.intermediate.variants.map((variant) => (
                  <div key={variant.id} className={styles.variantCard}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Nombre</label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                          placeholder="Ej: Talle M - Azul"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                          placeholder="Ej: REM-NIKE-001-M-AZUL"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Precio</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              {/* Mercado Libre */}
              <h4>🛒 Mercado Libre</h4>
              <div className={styles.formGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.intermediate.mercadolibre.sync_enabled}
                    onChange={(e) => updateIntermediate('mercadolibre', {
                      ...formData.intermediate.mercadolibre,
                      sync_enabled: e.target.checked
                    })}
                  />
                  <span>Sincronizar con Mercado Libre</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* NIVEL AVANZADO */}
        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => toggleSection('advanced')}
          >
            <div className={styles.sectionTitle}>
              <span className={`${styles.levelBadge} ${styles.advanced}`}>A+B+C</span>
              <span>Nivel Avanzado</span>
              <span className={styles.optional}>Opcional</span>
            </div>
            {expandedSections.advanced ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {expandedSections.advanced && (
            <div className={styles.sectionContent}>
              {/* SEO */}
              <h4>🔍 SEO</h4>
              <div className={styles.formGroup}>
                <label>Meta Título</label>
                <input
                  type="text"
                  value={formData.advanced.seo.meta_title}
                  onChange={(e) => updateAdvanced('seo', 'meta_title', e.target.value)}
                  placeholder="Título para buscadores"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Meta Descripción</label>
                <textarea
                  value={formData.advanced.seo.meta_description}
                  onChange={(e) => updateAdvanced('seo', 'meta_description', e.target.value)}
                  placeholder="Descripción para buscadores"
                  rows={2}
                />
              </div>

              {/* Dimensiones */}
              <h4>📏 Dimensiones y Peso</h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.advanced.dimensions.weight}
                    onChange={(e) => updateAdvanced('dimensions', 'weight', parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ancho (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.advanced.dimensions.width}
                    onChange={(e) => updateAdvanced('dimensions', 'width', parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Alto (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.advanced.dimensions.height}
                    onChange={(e) => updateAdvanced('dimensions', 'height', parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Largo (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.advanced.dimensions.length}
                    onChange={(e) => updateAdvanced('dimensions', 'length', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Validation Alert */}
        {formData.intermediate.mercadolibre.sync_enabled && 
         !formData.intermediate.variants.length && (
          <div className={styles.alert}>
            <AlertCircle size={20} />
            <span>Para sincronizar con Mercado Libre se requiere nivel A+B+C completo</span>
          </div>
        )}
      </form>
    </div>
  );
};
