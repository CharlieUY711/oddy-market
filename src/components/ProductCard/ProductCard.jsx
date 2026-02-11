import React, { useState } from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { Button } from '../Button';
import styles from './ProductCard.module.css';

export const ProductCard = ({
  id,
  name,
  price,
  image,
  description,
  category,
  discount,
  rating,
  stock,
  onAddToCart,
  onViewDetails,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(price);
  };

  const discountedPrice = discount ? price * (1 - discount / 100) : price;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onAddToCart?.(id);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onViewDetails?.(id);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card
      className={styles.productCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(id)}
    >
      <div className={styles.imageContainer}>
        <img
          src={image || '/placeholder-product.jpg'}
          alt={name}
          className={styles.image}
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discount && (
          <div className={styles.discountBadge}>
            -{discount}%
          </div>
        )}

        {/* Stock Badge */}
        {stock !== undefined && stock < 5 && stock > 0 && (
          <div className={styles.stockBadge}>
            ¡Últimas unidades!
          </div>
        )}

        {/* Quick Actions */}
        <div className={`${styles.quickActions} ${isHovered ? styles.visible : ''}`}>
          <button
            className={styles.quickActionButton}
            onClick={handleFavorite}
            aria-label="Agregar a favoritos"
          >
            <Heart className={`${styles.quickActionIcon} ${isFavorite ? styles.favorite : ''}`} />
          </button>
          <button
            className={styles.quickActionButton}
            onClick={handleQuickView}
            aria-label="Ver detalles"
          >
            <Eye className={styles.quickActionIcon} />
          </button>
        </div>
      </div>

      <CardHeader>
        {category && (
          <p className={styles.category}>{category}</p>
        )}
        <CardTitle className={styles.title}>{name}</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Rating */}
        {rating && (
          <div className={styles.rating}>
            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.star} ${i < Math.floor(rating) ? styles.starFilled : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className={styles.ratingText}>({rating})</span>
          </div>
        )}

        {/* Price */}
        <div className={styles.priceContainer}>
          {discount ? (
            <>
              <div className={styles.priceOriginal}>{formatPrice(price)}</div>
              <div className={styles.price}>{formatPrice(discountedPrice)}</div>
            </>
          ) : (
            <div className={styles.price}>{formatPrice(price)}</div>
          )}
        </div>

        {/* Quick Add Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleQuickAdd}
          className={styles.quickAddButton}
          aria-label="Agregar al carrito"
        >
          <ShoppingCart className={styles.cartIcon} />
          Agregar
        </Button>
      </CardContent>
    </Card>
  );
};
