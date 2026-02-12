import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Componente Skeleton para estados de carga
 * @param {object} props
 * @param {string} props.variant - Tipo de skeleton: 'text' | 'circular' | 'rectangular' | 'card' | 'product'
 * @param {string} props.width - Ancho (CSS)
 * @param {string} props.height - Alto (CSS)
 * @param {number} props.count - Cantidad de elementos (para text)
 * @param {string} props.className - Clases CSS adicionales
 */
export const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  ...props
}) => {
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  // Skeleton de producto completo
  if (variant === 'product') {
    return (
      <div className={`${styles.skeletonProduct} ${className}`} {...props}>
        <div className={styles.skeletonProductImage} />
        <div className={styles.skeletonProductContent}>
          <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '40%', height: '12px' }} />
          <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80%', height: '16px', marginTop: '8px' }} />
          <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '60%', height: '12px', marginTop: '8px' }} />
          <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '50%', height: '20px', marginTop: '16px' }} />
          <div className={`${styles.skeleton} ${styles.skeletonRectangular}`} style={{ width: '100%', height: '36px', marginTop: '12px' }} />
        </div>
      </div>
    );
  }

  // Skeleton de card genérico
  if (variant === 'card') {
    return (
      <div className={`${styles.skeletonCard} ${className}`} {...props}>
        <div className={`${styles.skeleton} ${styles.skeletonRectangular}`} style={{ width: '100%', height: '200px' }} />
        <div style={{ padding: '16px' }}>
          <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '60%', height: '20px' }} />
          <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '100%', height: '14px', marginTop: '12px' }} />
          <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80%', height: '14px', marginTop: '8px' }} />
        </div>
      </div>
    );
  }

  // Skeleton múltiple para texto
  if (count > 1) {
    return (
      <div className={className}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${styles.skeleton} ${styles[`skeleton${variant.charAt(0).toUpperCase()}${variant.slice(1)}`]}`}
            style={{ ...style, marginBottom: index < count - 1 ? '8px' : 0 }}
            {...props}
          />
        ))}
      </div>
    );
  }

  // Skeleton individual
  return (
    <div
      className={`${styles.skeleton} ${styles[`skeleton${variant.charAt(0).toUpperCase()}${variant.slice(1)}`]} ${className}`}
      style={style}
      {...props}
    />
  );
};

/**
 * Skeleton para lista de productos
 */
export const SkeletonProductGrid = ({ count = 8, className = '' }) => {
  return (
    <div className={`${styles.skeletonGrid} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="product" />
      ))}
    </div>
  );
};

/**
 * Skeleton para card individual
 */
export const SkeletonCard = ({ className = '' }) => {
  return <Skeleton variant="card" className={className} />;
};

/**
 * Skeleton para texto
 */
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${styles.skeleton} ${styles.skeletonText}`}
          style={{
            width: index === lines - 1 ? '60%' : '100%',
            marginBottom: index < lines - 1 ? '8px' : 0,
          }}
        />
      ))}
    </div>
  );
};
