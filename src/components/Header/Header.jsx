import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.svg" alt="ODDY Market" className={styles.logoImage} />
          <span className={styles.logoText}>ODDY Market</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Inicio</Link>
          <Link to="/products" className={styles.navLink}>Productos</Link>
          <Link to="/about" className={styles.navLink}>Nosotros</Link>
        </nav>

        <div className={styles.actions}>
          <Button variant="ghost" size="sm">Carrito</Button>
          <Button variant="primary" size="sm">Iniciar Sesión</Button>
        </div>
      </div>
    </header>
  );
};
