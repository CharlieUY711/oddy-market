import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { formatCurrency } from '../../utils/formatting';
import styles from './Cart.module.css';

export const Cart = () => {
  const {
    cart,
    cartTotal,
    cartItemsCount,
    removeFromCart,
    updateCartItem,
    clearCart,
  } = useApp();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartItem(productId, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos para comenzar tu compra</p>
          <Link to="/products">
            <Button variant="primary" size="lg">
              Explorar Productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Carrito de Compras</h1>
      <p className={styles.subtitle}>
        {cartItemsCount} {cartItemsCount === 1 ? 'producto' : 'productos'} en tu carrito
      </p>

      <div className={styles.cartLayout}>
        <div className={styles.items}>
          {cart.map((item) => (
            <Card key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.name}
                  loading="lazy"
                />
              </div>
              <div className={styles.itemInfo}>
                <CardHeader>
                  <CardTitle className={styles.itemTitle}>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemPrice}>
                      {formatCurrency(item.price)} c/u
                    </div>
                    <div className={styles.quantityControls}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        aria-label="Reducir cantidad"
                      >
                        -
                      </Button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </Button>
                    </div>
                    <div className={styles.itemTotal}>
                      Total: {formatCurrency(item.price * item.quantity)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className={styles.removeButton}
                      aria-label="Eliminar producto"
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className={styles.summary}>
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.summaryRow}>
                <span>Subtotal ({cartItemsCount} items)</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío</span>
                <span>
                  {cartTotal > 5000 ? 'Gratis' : formatCurrency(500)}
                </span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={styles.summaryRowTotal}>
                <span>Total</span>
                <span>{formatCurrency(cartTotal + (cartTotal > 5000 ? 0 : 500))}</span>
              </div>
              {cartTotal < 5000 && (
                <p className={styles.freeShipping}>
                  Agrega {formatCurrency(5000 - cartTotal)} más para envío gratis
                </p>
              )}
              <div className={styles.checkoutActions}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  className={styles.checkoutButton}
                >
                  Proceder al Checkout
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/products')}
                >
                  Seguir Comprando
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className={styles.clearButton}
                >
                  Vaciar Carrito
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
