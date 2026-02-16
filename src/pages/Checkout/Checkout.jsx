import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext';
import { useNotifications } from '@context/NotificationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@components/Card';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Loading } from '@components/Loading';
import { AgeVerification, requiresAgeVerification, getRequiredAge } from '@components/age-verification';
import {
  validateCheckoutForm,
  formatCardNumber,
  formatCardExpiry,
} from '@utils/validation';
import { formatCurrency } from '@utils/formatting';
import styles from './Checkout.module.css';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useApp();
  const { success, error } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
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
    let formattedValue = value;

    // Formatear campos especiales
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'cardExpiry') {
      formattedValue = formatCardExpiry(value);
    } else if (name === 'cardCVC') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    // Validar en tiempo real si el campo fue tocado
    if (touched[name]) {
      const newFormData = { ...formData, [name]: formattedValue };
      const validation = validateCheckoutForm(newFormData);
      setFormErrors((prev) => ({
        ...prev,
        [name]: validation.errors[name] || null,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const validation = validateCheckoutForm(formData);
    setFormErrors((prev) => ({
      ...prev,
      [name]: validation.errors[name] || null,
    }));
  };

  // Verificar restricciones de edad en el carrito
  const checkCartAgeRestrictions = () => {
    for (const item of cart) {
      if (requiresAgeVerification(item)) {
        const stored = localStorage.getItem('age_verification');
        if (!stored) {
          return { 
            hasRestricted: true, 
            product: item,
            minAge: getRequiredAge(item, 'AR')
          };
        }
        
        try {
          const verification = JSON.parse(stored);
          const expiresAt = new Date(verification.expiresAt);
          const minAge = getRequiredAge(item, 'AR');
          
          if (expiresAt < new Date() || verification.age < minAge) {
            return { 
              hasRestricted: true, 
              product: item,
              minAge
            };
          }
        } catch (err) {
          return { 
            hasRestricted: true, 
            product: item,
            minAge: getRequiredAge(item, 'AR')
          };
        }
      }
    }
    
    return { hasRestricted: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      error('Tu carrito está vacío');
      navigate('/products');
      return;
    }

    // Verificar restricciones de edad ANTES de validar el formulario
    const { hasRestricted, product, minAge } = checkCartAgeRestrictions();
    
    if (hasRestricted) {
      error(`Debes verificar tu edad para comprar "${product.name}"`);
      setShowAgeVerification(true);
      setPendingCheckout(true);
      return;
    }

    // Marcar todos los campos como tocados
    const allFields = Object.keys(formData);
    const newTouched = {};
    allFields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validar formulario completo
    const validation = validateCheckoutForm(formData);
    setFormErrors(validation.errors);

    if (!validation.isValid) {
      error('Por favor corrige los errores en el formulario');
      // Scroll al primer error
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
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

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    
    if (pendingCheckout) {
      setPendingCheckout(false);
      // Reintentar checkout después de verificación
      const form = document.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
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
                      onBlur={handleBlur}
                      required
                      aria-invalid={formErrors.firstName ? 'true' : 'false'}
                      aria-describedby={formErrors.firstName ? 'firstName-error' : undefined}
                    />
                    {formErrors.firstName && touched.firstName && (
                      <span id="firstName-error" className={styles.errorMessage} role="alert">
                        {formErrors.firstName}
                      </span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName">Apellido *</label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      aria-invalid={formErrors.lastName ? 'true' : 'false'}
                      aria-describedby={formErrors.lastName ? 'lastName-error' : undefined}
                    />
                    {formErrors.lastName && touched.lastName && (
                      <span id="lastName-error" className={styles.errorMessage} role="alert">
                        {formErrors.lastName}
                      </span>
                    )}
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
                    onBlur={handleBlur}
                    required
                    aria-invalid={formErrors.email ? 'true' : 'false'}
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                  />
                  {formErrors.email && touched.email && (
                    <span id="email-error" className={styles.errorMessage} role="alert">
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Teléfono</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    aria-invalid={formErrors.phone ? 'true' : 'false'}
                    aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                  />
                  {formErrors.phone && touched.phone && (
                    <span id="phone-error" className={styles.errorMessage} role="alert">
                      {formErrors.phone}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address">Dirección *</label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    aria-invalid={formErrors.address ? 'true' : 'false'}
                    aria-describedby={formErrors.address ? 'address-error' : undefined}
                  />
                  {formErrors.address && touched.address && (
                    <span id="address-error" className={styles.errorMessage} role="alert">
                      {formErrors.address}
                    </span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="city">Ciudad *</label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      aria-invalid={formErrors.city ? 'true' : 'false'}
                      aria-describedby={formErrors.city ? 'city-error' : undefined}
                    />
                    {formErrors.city && touched.city && (
                      <span id="city-error" className={styles.errorMessage} role="alert">
                        {formErrors.city}
                      </span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="zipCode">Código Postal</label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      aria-invalid={formErrors.zipCode ? 'true' : 'false'}
                      aria-describedby={formErrors.zipCode ? 'zipCode-error' : undefined}
                    />
                    {formErrors.zipCode && touched.zipCode && (
                      <span id="zipCode-error" className={styles.errorMessage} role="alert">
                        {formErrors.zipCode}
                      </span>
                    )}
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
                        onBlur={handleBlur}
                        maxLength="19"
                        aria-invalid={formErrors.cardNumber ? 'true' : 'false'}
                        aria-describedby={formErrors.cardNumber ? 'cardNumber-error' : undefined}
                      />
                      {formErrors.cardNumber && touched.cardNumber && (
                        <span id="cardNumber-error" className={styles.errorMessage} role="alert">
                          {formErrors.cardNumber}
                        </span>
                      )}
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
                          onBlur={handleBlur}
                          maxLength="5"
                          aria-invalid={formErrors.cardExpiry ? 'true' : 'false'}
                          aria-describedby={formErrors.cardExpiry ? 'cardExpiry-error' : undefined}
                        />
                        {formErrors.cardExpiry && touched.cardExpiry && (
                          <span id="cardExpiry-error" className={styles.errorMessage} role="alert">
                            {formErrors.cardExpiry}
                          </span>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="cardCVC">CVC *</label>
                        <Input
                          id="cardCVC"
                          name="cardCVC"
                          placeholder="123"
                          value={formData.cardCVC}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          maxLength="4"
                          type="password"
                          aria-invalid={formErrors.cardCVC ? 'true' : 'false'}
                          aria-describedby={formErrors.cardCVC ? 'cardCVC-error' : undefined}
                        />
                        {formErrors.cardCVC && touched.cardCVC && (
                          <span id="cardCVC-error" className={styles.errorMessage} role="alert">
                            {formErrors.cardCVC}
                          </span>
                        )}
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
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Envío</span>
                  <span>{shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
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

      {/* Modal de verificación de edad */}
      <AgeVerification
        isOpen={showAgeVerification}
        onClose={() => {
          setShowAgeVerification(false);
          setPendingCheckout(false);
        }}
        onVerified={handleAgeVerified}
        requiredAge={18}
        productName={
          checkCartAgeRestrictions().hasRestricted
            ? checkCartAgeRestrictions().product?.name || 'productos con restricción de edad'
            : 'productos con restricción de edad'
        }
      />
    </div>
  );
};
