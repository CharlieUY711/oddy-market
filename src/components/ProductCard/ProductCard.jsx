import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../Card';
import { Button } from '../Button';
import styles from './ProductCard.module.css';

export const ProductCard = ({
  id,
  name,
  price,
  image,
  description,
  onAddToCart,
  onViewDetails,
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(price);
  };

  return (
    <Card className={styles.productCard}>
      <div className={styles.imageContainer}>
        <img
          src={image || '/placeholder-product.jpg'}
          alt={name}
          className={styles.image}
          loading="lazy"
        />
      </div>
      <CardHeader>
        <CardTitle className={styles.title}>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={styles.description}>{description}</p>
        <div className={styles.price}>{formatPrice(price)}</div>
      </CardContent>
      <CardFooter className={styles.footer}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(id)}
          className={styles.viewButton}
        >
          Ver Detalles
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAddToCart?.(id)}
          className={styles.cartButton}
        >
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
};
