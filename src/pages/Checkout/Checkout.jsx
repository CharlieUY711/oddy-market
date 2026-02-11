import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import styles from './Checkout.module.css';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useApp();
  const { success, error } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
      error('Por favor completa todos los campos requeridos');
      return;
    }

    if (cart.length === 0) {
      error('Tu carrito está vacío');
      navigate('/products');
      return;
    }

    setLoading(true);

    try {
      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Éxito
      success('¡Compra realizada con éxito!', 'Pedido confirmado');
      clearCart();
      
      // Redirigir después de un momento
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      error('Error al procesar el pago. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(price);
  };

  const shippingCost = cartTotal > 5000 ? 0 : 500;
  const total = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos para continuar con el checkout</p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Explorar Productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formLayout}>
          <div className={styles.formSection}>
            <Card>
              <CardHeader>
                <CardTitle>Información de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName">Nombre *</label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName">Apellido *</label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Teléfono</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address">Dirección *</label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="city">Ciudad *</label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="zipCode">Código Postal</label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.formGroup}>
                  <label htmlFor="paymentMethod">Método *</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="card">Tarjeta de Crédito/Débito</option>
                    <option value="transfer">Transferencia Bancaria</option>
                    <option value="cash">Efectivo</option>
                  </select>
                </div>

                {formData.paymentMethod === 'card' && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="cardNumber">Número de Tarjeta *</label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength="19"
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="cardExpiry">Vencimiento *</label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          placeholder="MM/AA"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          maxLength="5"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="cardCVC">CVC *</label>
                        <Input
                          id="cardCVC"
                          name="cardCVC"
                          placeholder="123"
                          value={formData.cardCVC}
                          onChange={handleInputChange}
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={styles.summarySection}>
            <Card className={styles.summaryCard}>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.summaryItem}>
                  <span>Subtotal ({cart.length} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Envío</span>
                  <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? <Loading size="sm" /> : 'Confirmar Pedido'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/cart')}
                  className={styles.backButton}
                >
                  Volver al Carrito
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
