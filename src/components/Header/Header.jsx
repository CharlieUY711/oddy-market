import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, ShoppingCart, Menu, ChevronDown } from 'lucide-react';
import { Button } from '../Button';
import { SearchBar } from '../SearchBar';
import { MegaMenu } from '../MegaMenu';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

export const Header = () => {
  const navigate = useNavigate();
  const { cartItemsCount } = useApp();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <p>🎉 Envío gratis en compras superiores a $50.000</p>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <div className={styles.container}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <button
              className={styles.mobileMenuButton}
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setMegaMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Menú móvil"
            >
              <Menu className={styles.icon} />
            </button>
            <Link to="/" className={styles.logo} aria-label="ODDY Market - Ir al inicio">
              <img
                src="/logo.svg"
                alt="ODDY Market"
                className={styles.logoImage}
                style={{
                  filter: 'brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(2476%) hue-rotate(346deg) brightness(101%) contrast(101%)',
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className={styles.nav} aria-label="Navegación principal">
            <Link to="/" className={styles.navLink}>Inicio</Link>
            <button
              className={styles.navLink}
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              Departamentos
              <ChevronDown className={styles.navChevron} />
            </button>
            <Link to="/products" className={styles.navLink}>Productos</Link>
            <Link to="/products" className={styles.navLink}>
              🔄 Second Hand
            </Link>
            <Link to="/products" className={styles.navLink}>Ofertas</Link>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              <Search className={styles.icon} />
            </button>

            <button
              className={styles.actionButton}
              onClick={() => navigate('/favorites')}
              aria-label="Favoritos"
            >
              <Heart className={styles.icon} />
            </button>

            {user ? (
              <button
                className={styles.userButton}
                onClick={() => navigate('/profile')}
                aria-label="Mi cuenta"
              >
                <div className={styles.userAvatar}>
                  {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className={styles.userName}>{user.name || 'Mi cuenta'}</span>
              </button>
            ) : (
              <Link to="/login" className={styles.userButton}>
                <User className={styles.icon} />
                <span className={styles.userName}>Iniciar Sesión</span>
              </Link>
            )}

            <Link to="/cart" className={styles.cartButton} aria-label={`Carrito con ${cartItemsCount} items`}>
              <ShoppingCart className={styles.icon} />
              {cartItemsCount > 0 && (
                <span className={styles.badge}>{cartItemsCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
      <MegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
      />
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};
