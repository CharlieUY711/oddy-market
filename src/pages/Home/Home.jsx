import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Truck, Shield, Zap, Headphones } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/Button';
import { api } from '../../utils/api';
import styles from './Home.module.css';

export const Home = () => {
  const navigate = useNavigate();
  const { products, setProducts, setLoading, addToCart } = useApp();

  useEffect(() => {
    const fetchProducts = async () => {
      if (products.length === 0) {
        try {
          setLoading(true);
          const data = await api.getMockProducts();
          setProducts(data);
        } catch (err) {
          console.error('Error fetching products:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProducts();
  }, [products.length, setProducts, setLoading]);
  
  const featuredProducts = products.slice(0, 8);
  const newArrivals = products.slice(8, 12);

  const departments = [
    { id: '1', name: 'Alimentos y Bebidas', icon: '🍕' },
    { id: '2', name: 'Tecnología', icon: '💻' },
    { id: '3', name: 'Moda y Accesorios', icon: '👜' },
    { id: '4', name: 'Hogar y Decoración', icon: '🏠' },
    { id: '5', name: 'Deportes y Fitness', icon: '⚽' },
    { id: '6', name: 'Salud y Bienestar', icon: '💊' },
  ];

  const features = [
    {
      icon: Truck,
      title: 'Envío Gratis',
      description: 'En compras superiores a $50.000',
    },
    {
      icon: Shield,
      title: 'Compra Segura',
      description: 'Protección total en tu compra',
    },
    {
      icon: Zap,
      title: 'Envío Rápido',
      description: 'Recibí en 24-48hs',
    },
    {
      icon: Headphones,
      title: 'Soporte 24/7',
      description: 'Te ayudamos cuando lo necesites',
    },
  ];

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero} aria-label="Hero section">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              Descubrí las mejores
              <span className={styles.titleAccent}> ofertas</span>
            </h1>
            <p className={styles.subtitle}>
              Miles de productos con envío gratis y las mejores marcas del mercado
            </p>
            <div className={styles.actions}>
              <Link to="/products">
                <Button variant="primary" size="lg" className={styles.heroButton}>
                  Ver productos
                  <ChevronRight className={styles.icon} />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className={styles.heroButton}>
                Ver ofertas
              </Button>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop"
                alt="Hero"
                className={styles.heroImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <IconComponent className={styles.icon} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Second Hand Banner */}
      <section className={styles.secondHandBanner}>
        <div className={styles.container}>
          <div className={styles.secondHandContent}>
            <div className={styles.secondHandEmoji}>🔄</div>
            <h2 className={styles.secondHandTitle}>Second Hand Market</h2>
            <p className={styles.secondHandDescription}>
              Compra y vende productos de segunda mano. Dale una segunda vida a tus cosas o encuentra gangas increíbles.
            </p>
            <Button
              variant="primary"
              size="lg"
              className={styles.secondHandButton}
              onClick={() => navigate('/second-hand')}
            >
              Explorar Second Hand
              <ChevronRight className={styles.icon} />
            </Button>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className={styles.departments}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Departamentos</h2>
          <div className={styles.departmentsGrid}>
            {departments.map((dept) => (
              <button
                key={dept.id}
                className={styles.departmentCard}
                onClick={() => navigate('/products')}
              >
                <div className={styles.departmentEmoji}>{dept.icon}</div>
                <p className={styles.departmentName}>{dept.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className={styles.featuredProducts}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Productos destacados</h2>
              <Link to="/products" className={styles.seeAll}>
                Ver todos
                <ChevronRight className={styles.iconSmall} />
              </Link>
            </div>
            <div className={styles.productsGrid}>
              {featuredProducts.map((product) => (
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
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className={styles.newArrivals}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recién llegados</h2>
              <Link to="/products" className={styles.seeAll}>
                Ver todos
                <ChevronRight className={styles.iconSmall} />
              </Link>
            </div>
            <div className={styles.productsGrid}>
              {newArrivals.map((product) => (
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
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterTitle}>
              Suscribite a nuestro newsletter
            </h2>
            <p className={styles.newsletterDescription}>
              Recibí las mejores ofertas y novedades directamente en tu email
            </p>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Tu email"
                className={styles.newsletterInput}
              />
              <Button variant="primary" size="lg" className={styles.newsletterButton}>
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
