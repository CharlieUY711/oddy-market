import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';
import { useApp } from '../../context/AppContext';
import styles from './Header.module.css';

export const Header = () => {
  const { cartItemsCount } = useApp();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="ODDY Market - Ir al inicio">
          <img src="/logo.svg" alt="ODDY Market" className={styles.logoImage} />
          <span className={styles.logoText}>ODDY Market</span>
        </Link>

        <nav className={styles.nav} aria-label="Navegación principal">
          <Link to="/" className={styles.navLink}>Inicio</Link>
          <Link to="/products" className={styles.navLink}>Productos</Link>
          <Link to="/about" className={styles.navLink}>Nosotros</Link>
        </nav>

        <div className={styles.actions}>
          <Button variant="ghost" size="sm" aria-label={`Carrito con ${cartItemsCount} items`}>
            Carrito {cartItemsCount > 0 && <span className={styles.badge}>{cartItemsCount}</span>}
          </Button>
          <Button variant="primary" size="sm">Iniciar Sesión</Button>
        </div>
      </div>
    </header>
  );
};
