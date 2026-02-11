import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Card, CardContent } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { api } from '../../utils/api';
import styles from './ProductDetail.module.css';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, products } = useApp();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar en productos existentes primero
        const existingProduct = products.find(p => p.id === parseInt(id));
        if (existingProduct) {
          setProduct(existingProduct);
        } else {
          // Si no está, usar mock data
          const mockProducts = await api.getMockProducts();
          const foundProduct = mockProducts.find(p => p.id === parseInt(id));
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            setError('Producto no encontrado');
          }
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, products]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // Navegar al carrito después de agregar
      navigate('/cart');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(price);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Producto no encontrado</h2>
          <p>{error || 'El producto que buscas no existe'}</p>
          <Link to="/products">
            <Button variant="primary">Volver a Productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Inicio</Link>
        <span> / </span>
        <Link to="/products">Productos</Link>
        <span> / </span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.productDetail}>
        <div className={styles.imageSection}>
          <img
            src={product.image || '/placeholder-product.jpg'}
            alt={product.name}
            className={styles.image}
            loading="eager"
          />
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          
          <div className={styles.description}>
            <h2>Descripción</h2>
            <p>{product.description}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation.
            </p>
          </div>

          <div className={styles.quantity}>
            <label htmlFor="quantity">Cantidad:</label>
            <div className={styles.quantityControls}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Reducir cantidad"
              >
                -
              </Button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className={styles.quantityInput}
                aria-label="Cantidad"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Aumentar cantidad"
              >
                +
              </Button>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              className={styles.addButton}
            >
              Agregar al Carrito
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/products')}
            >
              Seguir Comprando
            </Button>
          </div>

          <Card className={styles.features}>
            <CardContent>
              <h3>Características</h3>
              <ul className={styles.featuresList}>
                <li>✓ Envío gratuito en compras mayores a $5000</li>
                <li>✓ Garantía de 30 días</li>
                <li>✓ Devolución sin cargo</li>
                <li>✓ Soporte 24/7</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
