import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext';
import { useNotifications } from '@context/NotificationContext';
import { ProductCard } from '@components/ProductCard';
import { SkeletonProductGrid } from '@components/Skeleton';
import { ErrorMessage } from '@components/ErrorMessage';
import { Card, CardContent } from '@components/Card';
import { api } from '@utils/api';
import styles from './SecondHand.module.css';

const CONDITION_LABELS = {
  like_new: 'Como Nuevo',
  very_good: 'Muy Bueno',
  good: 'Buen Estado',
  acceptable: 'Aceptable',
  refurbished: 'Reacondicionado',
};

export const SecondHand = () => {
  const navigate = useNavigate();
  const { products, loading, error, setProducts, setLoading, addToCart } = useApp();
  const { success } = useNotifications();
  const [selectedCondition, setSelectedCondition] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await api.getMockProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (products.length === 0) {
      fetchProducts();
    }
  }, [setProducts, setLoading, products.length]);

  // Filtrar solo productos de segunda mano
  const secondHandProducts = useMemo(() => {
    return products.filter(product => 
      product.condition && product.condition !== 'new'
    );
  }, [products]);

  // Filtrar por condición seleccionada
  const filteredProducts = useMemo(() => {
    if (selectedCondition === 'all') {
      return secondHandProducts;
    }
    return secondHandProducts.filter(product => product.condition === selectedCondition);
  }, [secondHandProducts, selectedCondition]);

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product);
      success(`${product.name} agregado al carrito`);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className={styles.secondHand}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cargando...</h1>
        </div>
        <SkeletonProductGrid />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.secondHand}>
        <ErrorMessage
          title="Error al cargar productos"
          message={error}
          onRetry={() => window.location.reload()}
          actionText="Recargar página"
        />
      </div>
    );
  }

  return (
    <div className={styles.secondHand}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>🔄 Second Hand Market</h1>
          <p className={styles.heroSubtitle}>
            Productos de segunda mano en excelente estado. Comprá inteligente, ahorrá dinero.
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className={styles.infoSection}>
        <Card className={styles.infoCard}>
          <CardContent>
            <div className={styles.infoIcon}>✅</div>
            <h3 className={styles.infoTitle}>Verificados</h3>
            <p className={styles.infoText}>
              Todos los productos son verificados y probados antes de la venta
            </p>
          </CardContent>
        </Card>

        <Card className={styles.infoCard}>
          <CardContent>
            <div className={styles.infoIcon}>💰</div>
            <h3 className={styles.infoTitle}>Ahorro</h3>
            <p className={styles.infoText}>
              Hasta 50% de descuento comparado con productos nuevos
            </p>
          </CardContent>
        </Card>

        <Card className={styles.infoCard}>
          <CardContent>
            <div className={styles.infoIcon}>🌱</div>
            <h3 className={styles.infoTitle}>Sostenible</h3>
            <p className={styles.infoText}>
              Ayudás al medio ambiente dándole una segunda vida a los productos
            </p>
          </CardContent>
        </Card>

        <Card className={styles.infoCard}>
          <CardContent>
            <div className={styles.infoIcon}>🛡️</div>
            <h3 className={styles.infoTitle}>Garantía</h3>
            <p className={styles.infoText}>
              30 días de garantía en todos los productos de segunda mano
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <h2 className={styles.sectionTitle}>Explorá por Estado</h2>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${selectedCondition === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCondition('all')}
          >
            Todos ({secondHandProducts.length})
          </button>
          {Object.entries(CONDITION_LABELS).map(([key, label]) => {
            const count = secondHandProducts.filter(p => p.condition === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                className={`${styles.filterButton} ${selectedCondition === key ? styles.active : ''}`}
                onClick={() => setSelectedCondition(key)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.productsSection}>
        {filteredProducts.length === 0 ? (
          <ErrorMessage
            type="info"
            title="No hay productos disponibles"
            message={
              selectedCondition === 'all'
                ? 'Pronto agregaremos más productos de segunda mano.'
                : `No hay productos en estado "${CONDITION_LABELS[selectedCondition]}" en este momento.`
            }
            actionText="Ver todos los productos"
            onRetry={() => navigate('/products')}
          />
        ) : (
          <>
            <p className={styles.resultsCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <div key={product.id} className={styles.productWrapper}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    description={product.description}
                    image={product.image}
                    category={product.category}
                    discount={product.discount}
                    rating={product.rating}
                    stock={product.stock}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                  {product.condition && (
                    <div className={styles.conditionBadge}>
                      {CONDITION_LABELS[product.condition] || product.condition}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className={styles.ctaSection}>
        <Card className={styles.ctaCard}>
          <CardContent>
            <h2 className={styles.ctaTitle}>¿Tenés algo para vender?</h2>
            <p className={styles.ctaText}>
              Publicá tus productos usados y ganá dinero de forma fácil y segura
            </p>
            <button className={styles.ctaButton}>
              Vender mis productos
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
