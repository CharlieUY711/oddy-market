import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import styles from './MegaMenu.module.css';

const departments = [
  {
    id: '1',
    name: 'Alimentos y Bebidas',
    icon: '🍕',
    categories: [
      { id: '1-1', name: 'Bebidas', subcategories: ['Refrescos', 'Jugos', 'Agua'] },
      { id: '1-2', name: 'Snacks', subcategories: ['Papas', 'Galletas', 'Dulces'] },
      { id: '1-3', name: 'Lácteos', subcategories: ['Leche', 'Quesos', 'Yogures'] },
    ],
  },
  {
    id: '2',
    name: 'Tecnología',
    icon: '💻',
    categories: [
      { id: '2-1', name: 'Smartphones', subcategories: ['Apple', 'Samsung', 'Xiaomi'] },
      { id: '2-2', name: 'Computadoras', subcategories: ['Laptops', 'Desktops', 'Tablets'] },
      { id: '2-3', name: 'Accesorios', subcategories: ['Auriculares', 'Cargadores', 'Fundas'] },
    ],
  },
  {
    id: '3',
    name: 'Moda y Accesorios',
    icon: '👜',
    categories: [
      { id: '3-1', name: 'Ropa', subcategories: ['Hombre', 'Mujer', 'Niños'] },
      { id: '3-2', name: 'Calzado', subcategories: ['Deportivo', 'Casual', 'Formal'] },
      { id: '3-3', name: 'Accesorios', subcategories: ['Bolsos', 'Relojes', 'Gafas'] },
    ],
  },
  {
    id: '4',
    name: 'Hogar y Decoración',
    icon: '🏠',
    categories: [
      { id: '4-1', name: 'Muebles', subcategories: ['Sala', 'Cocina', 'Dormitorio'] },
      { id: '4-2', name: 'Decoración', subcategories: ['Lámparas', 'Cuadros', 'Plantas'] },
      { id: '4-3', name: 'Electrodomésticos', subcategories: ['Cocina', 'Limpieza', 'Climatización'] },
    ],
  },
  {
    id: '5',
    name: 'Deportes y Fitness',
    icon: '⚽',
    categories: [
      { id: '5-1', name: 'Fitness', subcategories: ['Pesas', 'Máquinas', 'Accesorios'] },
      { id: '5-2', name: 'Deportes', subcategories: ['Fútbol', 'Básquet', 'Tenis'] },
      { id: '5-3', name: 'Ropa Deportiva', subcategories: ['Hombre', 'Mujer', 'Niños'] },
    ],
  },
  {
    id: '6',
    name: 'Salud y Bienestar',
    icon: '💊',
    categories: [
      { id: '6-1', name: 'Vitaminas', subcategories: ['Multivitamínicos', 'Específicos'] },
      { id: '6-2', name: 'Cuidado Personal', subcategories: ['Higiene', 'Belleza', 'Cuidado Facial'] },
      { id: '6-3', name: 'Equipamiento Médico', subcategories: ['Termómetros', 'Tensiómetros'] },
    ],
  },
];

export const MegaMenu = ({ isOpen, onClose, onCategorySelect }) => {
  const navigate = useNavigate();
  const [hoveredDept, setHoveredDept] = useState(null);
  const [expandedMobileDept, setExpandedMobileDept] = useState(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCategoryClick = (deptName, categoryName, subcategoryName) => {
    if (onCategorySelect) {
      onCategorySelect(deptName, categoryName, subcategoryName);
    } else {
      navigate(`/products?department=${encodeURIComponent(deptName)}&category=${encodeURIComponent(categoryName || '')}&subcategory=${encodeURIComponent(subcategoryName || '')}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop Mega Menu */}
      <div className={styles.desktopMenu}>
        <div className={styles.menuContainer}>
          <div className={styles.departmentsList}>
            {departments.map((dept) => (
              <div
                key={dept.id}
                className={styles.departmentItem}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
              >
                <button
                  className={`${styles.departmentButton} ${hoveredDept === dept.id ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(dept.name)}
                >
                  <span className={styles.deptIcon}>{dept.icon}</span>
                  <span className={styles.deptName}>{dept.name}</span>
                  {dept.categories.length > 0 && (
                    <ChevronDown className={styles.chevron} />
                  )}
                </button>

                {/* Dropdown */}
                {hoveredDept === dept.id && dept.categories.length > 0 && (
                  <div className={styles.dropdown}>
                    <div className={styles.categoriesGrid}>
                      {dept.categories.map((category) => (
                        <div key={category.id} className={styles.categoryColumn}>
                          <button
                            className={styles.categoryTitle}
                            onClick={() => handleCategoryClick(dept.name, category.name)}
                          >
                            {category.name}
                            <ChevronRight className={styles.chevronSmall} />
                          </button>
                          <div className={styles.subcategoriesList}>
                            {category.subcategories.map((subcat, index) => (
                              <button
                                key={index}
                                className={styles.subcategoryItem}
                                onClick={() => handleCategoryClick(dept.name, category.name, subcat)}
                              >
                                {subcat}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={styles.mobileOverlay} onClick={onClose}>
        <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
          <div className={styles.mobileHeader}>
            <h2 className={styles.mobileTitle}>Menú</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar menú">
              <X className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.mobileDepartments}>
            {departments.map((dept) => (
              <div key={dept.id} className={styles.mobileDepartmentItem}>
                <button
                  className={styles.mobileDepartmentButton}
                  onClick={() => {
                    if (expandedMobileDept === dept.id) {
                      setExpandedMobileDept(null);
                      setExpandedMobileCat(null);
                    } else {
                      setExpandedMobileDept(dept.id);
                      setExpandedMobileCat(null);
                    }
                  }}
                >
                  <span className={styles.mobileDeptIcon}>{dept.icon}</span>
                  <span className={styles.mobileDeptName}>{dept.name}</span>
                  {dept.categories.length > 0 && (
                    <ChevronRight
                      className={`${styles.mobileChevron} ${expandedMobileDept === dept.id ? styles.expanded : ''}`}
                    />
                  )}
                </button>

                {/* Mobile Categories */}
                {expandedMobileDept === dept.id && dept.categories.length > 0 && (
                  <div className={styles.mobileCategories}>
                    {dept.categories.map((category) => (
                      <div key={category.id} className={styles.mobileCategoryItem}>
                        <button
                          className={styles.mobileCategoryButton}
                          onClick={() => {
                            if (expandedMobileCat === category.id) {
                              setExpandedMobileCat(null);
                            } else {
                              setExpandedMobileCat(category.id);
                            }
                          }}
                        >
                          {category.name}
                          {category.subcategories.length > 0 && (
                            <ChevronRight
                              className={`${styles.mobileChevron} ${expandedMobileCat === category.id ? styles.expanded : ''}`}
                            />
                          )}
                        </button>

                        {/* Mobile Subcategories */}
                        {expandedMobileCat === category.id && category.subcategories.length > 0 && (
                          <div className={styles.mobileSubcategories}>
                            {category.subcategories.map((subcat, index) => (
                              <button
                                key={index}
                                className={styles.mobileSubcategoryItem}
                                onClick={() => handleCategoryClick(dept.name, category.name, subcat)}
                              >
                                {subcat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
