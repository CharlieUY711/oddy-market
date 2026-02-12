import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.title}>ODDY Market</h3>
          <p className={styles.description}>
            Tu tienda departamental moderna con las mejores ofertas y servicio al cliente excepcional.
          </p>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>Enlaces</h4>
          <ul className={styles.links}>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/products">Productos</Link></li>
            <li><Link to="/about">Nosotros</Link></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>Soporte</h4>
          <ul className={styles.links}>
            <li><Link to="/contact">Contacto</Link></li>
            <li><Link to="/faq">Preguntas Frecuentes</Link></li>
            <li><Link to="/shipping">Envíos</Link></li>
            <li><Link to="/admin" className={styles.adminLink}>🎛️ Admin</Link></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>Legal</h4>
          <ul className={styles.links}>
            <li><Link to="/privacy">Privacidad</Link></li>
            <li><Link to="/terms">Términos</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} ODDY Market. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
