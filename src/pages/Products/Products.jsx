import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import { ProductCard } from '../../components/ProductCard';
import { Loading } from '../../components/Loading';
import { SkeletonProductGrid } from '../../components/Skeleton';
import { ErrorMessage } from '../../components/ErrorMessage';
import { api } from '../../utils/api';
import styles from './Products.module.css';

export const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { products, loading, error, setProducts, setLoading, addToCart } = useApp();
  const { success } = useNotifications();

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Usar mock data por ahora
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
      <div className={styles.products}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuestros Productos</h1>
          <p className={styles.subtitle}>Cargando productos...</p>
        </div>
        <SkeletonProductGrid count={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.products}>
        <ErrorMessage
          title="No pudimos cargar los productos"
          message={error || 'Ocurrió un error al cargar los productos. Por favor intenta de nuevo.'}
          onRetry={() => window.location.reload()}
          onGoHome={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className={styles.products}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {searchQuery ? `Resultados para "${searchQuery}"` : 'Nuestros Productos'}
        </h1>
        <p className={styles.subtitle}>
          {searchQuery
            ? `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`
            : 'Explora nuestro catálogo completo de productos de calidad'}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className={styles.empty}>
          <p>
            {searchQuery
              ? `No se encontraron productos para "${searchQuery}"`
              : 'No hay productos disponibles en este momento.'}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
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
          ))}
        </div>
      )}
    </div>
  );
};
