import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { Loading } from '../../components/Loading';
import { api } from '../../utils/api';
import styles from './Products.module.css';

export const Products = () => {
  const { products, loading, error, setProducts, setLoading, addToCart } = useApp();

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
    }
  };

  const handleViewDetails = (productId) => {
    // Navegar a detalles del producto
    console.log('View product:', productId);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className={styles.products}>
        <div className={styles.error}>
          <p>Error al cargar productos: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.products}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuestros Productos</h1>
        <p className={styles.subtitle}>
          Explora nuestro catálogo completo de productos de calidad
        </p>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay productos disponibles en este momento.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              description={product.description}
              image={product.image}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
