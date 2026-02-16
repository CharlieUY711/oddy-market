import React, { useState } from 'react';
import { X, Calendar, CreditCard, Camera, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { useNotifications } from '@context/NotificationContext';
import styles from './AgeVerification.module.css';

// Edades legales por país
const LEGAL_AGES = {
  AR: { alcohol: 18, tobacco: 18, gambling: 18 },
  UY: { alcohol: 18, tobacco: 18, gambling: 18 },
  MX: { alcohol: 18, tobacco: 18, gambling: 18 },
  CL: { alcohol: 18, tobacco: 18, gambling: 18 },
  CO: { alcohol: 18, tobacco: 18, gambling: 18 },
  BR: { alcohol: 18, tobacco: 18, gambling: 18 },
};

// Duración de validez por método (en días)
const VERIFICATION_DURATION = {
  birthdate: 30,
  document: 90,
  facial: 7,
  creditcard: 30,
};

export const AgeVerification = ({
  isOpen,
  onClose,
  onVerified,
  requiredAge = 18,
  productName = 'este producto',
}) => {
  const { success, error } = useNotifications();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [birthdate, setBirthdate] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState('dni');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Calcular edad desde fecha de nacimiento
  const calculateAge = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    if (!day || !month || !year) return null;
    
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Guardar verificación en localStorage
  const saveVerification = (method, age) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + VERIFICATION_DURATION[method]);
    
    const verification = {
      verified: true,
      method,
      age,
      timestamp: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    localStorage.setItem('age_verification', JSON.stringify(verification));
    return verification;
  };

  // Verificar con fecha de nacimiento
  const handleBirthdateVerification = () => {
    if (!birthdate) {
      error('Por favor ingresa tu fecha de nacimiento');
      return;
    }

    const age = calculateAge(birthdate);
    if (age === null) {
      error('Fecha de nacimiento inválida. Usa el formato DD/MM/AAAA');
      return;
    }

    if (age < requiredAge) {
      error(`Debes tener al menos ${requiredAge} años para comprar ${productName}`);
      return;
    }

    setIsProcessing(true);
    
    // Simular delay de verificación
    setTimeout(() => {
      saveVerification('birthdate', age);
      success(`Edad verificada correctamente. Tienes ${age} años.`);
      setIsProcessing(false);
      onVerified?.();
    }, 1000);
  };

  // Verificar con documento
  const handleDocumentVerification = async () => {
    if (!documentNumber) {
      error('Por favor ingresa tu número de documento');
      return;
    }

    setIsProcessing(true);

    try {
      // Simular verificación con API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En producción, aquí harías la llamada real a la API
      // const response = await fetch('/api/verify-document', { ... });
      
      // Simular edad extraída del documento (en producción vendría de la API)
      const simulatedAge = 25; // Esto vendría de la API real
      
      if (simulatedAge < requiredAge) {
        error(`Debes tener al menos ${requiredAge} años para comprar ${productName}`);
        setIsProcessing(false);
        return;
      }

      saveVerification('document', simulatedAge);
      success('Documento verificado correctamente');
      setIsProcessing(false);
      onVerified?.();
    } catch (err) {
      error('Error al verificar el documento. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  // Verificar con cámara facial
  const handleFacialVerification = async () => {
    setIsProcessing(true);

    try {
      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Aquí iría la lógica de IA para estimar edad
      // Por ahora simulamos
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Detener la cámara
      stream.getTracks().forEach(track => track.stop());
      
      // Simular edad estimada (en producción vendría de la IA)
      const estimatedAge = 28;
      
      if (estimatedAge < requiredAge) {
        error(`Debes tener al menos ${requiredAge} años para comprar ${productName}`);
        setIsProcessing(false);
        return;
      }

      saveVerification('facial', estimatedAge);
      success('Verificación facial completada');
      setIsProcessing(false);
      onVerified?.();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        error('Se necesita acceso a la cámara para verificar tu edad');
      } else {
        error('Error al acceder a la cámara. Por favor intenta de nuevo.');
      }
      setIsProcessing(false);
    }
  };

  // Verificar con tarjeta de crédito
  const handleCreditCardVerification = async () => {
    setIsProcessing(true);

    try {
      // Simular verificación con gateway de pagos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En producción, aquí verificarías con el gateway de pagos
      // que valida la edad del titular de la tarjeta
      
      // Simular edad verificada
      const verifiedAge = 30;
      
      if (verifiedAge < requiredAge) {
        error(`Debes tener al menos ${requiredAge} años para comprar ${productName}`);
        setIsProcessing(false);
        return;
      }

      saveVerification('creditcard', verifiedAge);
      success('Tarjeta verificada correctamente');
      setIsProcessing(false);
      onVerified?.();
    } catch (err) {
      error('Error al verificar la tarjeta. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedMethod(null);
      setBirthdate('');
      setDocumentNumber('');
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Shield className={styles.shieldIcon} />
            <h2 className={styles.title}>Verificación de Edad</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isProcessing}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.warning}>
            <AlertCircle className={styles.alertIcon} />
            <p>
              <strong>{productName}</strong> requiere verificar que tienes al menos{' '}
              <strong>{requiredAge} años</strong>
            </p>
          </div>

          {!selectedMethod ? (
            <div className={styles.methods}>
              <p className={styles.methodsTitle}>Selecciona un método de verificación:</p>
              
              <div className={styles.methodsGrid}>
                <button
                  className={styles.methodCard}
                  onClick={() => setSelectedMethod('birthdate')}
                  disabled={isProcessing}
                >
                  <Calendar className={styles.methodIcon} />
                  <h3>Fecha de Nacimiento</h3>
                  <p>Rápido y simple</p>
                  <span className={styles.methodBadge}>⭐ Recomendado</span>
                </button>

                <button
                  className={styles.methodCard}
                  onClick={() => setSelectedMethod('document')}
                  disabled={isProcessing}
                >
                  <Shield className={styles.methodIcon} />
                  <h3>Documento de Identidad</h3>
                  <p>Más seguro</p>
                  <span className={styles.methodBadge}>🆔 Válido 90 días</span>
                </button>

                <button
                  className={styles.methodCard}
                  onClick={() => setSelectedMethod('facial')}
                  disabled={isProcessing}
                >
                  <Camera className={styles.methodIcon} />
                  <h3>Verificación Facial</h3>
                  <p>Innovador</p>
                  <span className={styles.methodBadge}>📷 Válido 7 días</span>
                </button>

                <button
                  className={styles.methodCard}
                  onClick={() => setSelectedMethod('creditcard')}
                  disabled={isProcessing}
                >
                  <CreditCard className={styles.methodIcon} />
                  <h3>Tarjeta de Crédito</h3>
                  <p>Rápido</p>
                  <span className={styles.methodBadge}>💳 Válido 30 días</span>
                </button>
              </div>

              <div className={styles.privacy}>
                <Shield className={styles.privacyIcon} />
                <p>Tu privacidad está protegida. No almacenamos información sensible.</p>
              </div>
            </div>
          ) : (
            <div className={styles.verificationForm}>
              {selectedMethod === 'birthdate' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresa tu Fecha de Nacimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.formGroup}>
                      <label htmlFor="birthdate">Fecha de Nacimiento (DD/MM/AAAA)</label>
                      <Input
                        id="birthdate"
                        type="text"
                        placeholder="15/03/1995"
                        value={birthdate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                          if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
                          setBirthdate(value);
                        }}
                        maxLength="10"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className={styles.formActions}>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(null)}
                        disabled={isProcessing}
                      >
                        Volver
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleBirthdateVerification}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Verificando...' : 'Verificar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedMethod === 'document' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verificación con Documento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.formGroup}>
                      <label htmlFor="documentType">Tipo de Documento</label>
                      <select
                        id="documentType"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        disabled={isProcessing}
                        className={styles.select}
                      >
                        <option value="dni">DNI / Cédula</option>
                        <option value="passport">Pasaporte</option>
                        <option value="license">Licencia de Conducir</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="documentNumber">Número de Documento</label>
                      <Input
                        id="documentNumber"
                        type="text"
                        placeholder="12345678"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value.replace(/\D/g, ''))}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className={styles.formActions}>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(null)}
                        disabled={isProcessing}
                      >
                        Volver
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleDocumentVerification}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Verificando...' : 'Verificar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedMethod === 'facial' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verificación Facial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.facialInfo}>
                      <Camera className={styles.facialIcon} />
                      <p>Se solicitará acceso a tu cámara para verificar tu edad.</p>
                      <p className={styles.facialNote}>
                        No guardamos tu foto. Solo estimamos tu edad de forma anónima.
                      </p>
                    </div>
                    <div className={styles.formActions}>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(null)}
                        disabled={isProcessing}
                      >
                        Volver
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleFacialVerification}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Verificando...' : 'Iniciar Verificación'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedMethod === 'creditcard' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verificación con Tarjeta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.creditCardInfo}>
                      <CreditCard className={styles.creditCardIcon} />
                      <p>Verificaremos tu edad mediante el gateway de pagos.</p>
                      <p className={styles.creditCardNote}>
                        Solo verificamos la edad del titular, no procesamos el pago.
                      </p>
                    </div>
                    <div className={styles.formActions}>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(null)}
                        disabled={isProcessing}
                      >
                        Volver
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleCreditCardVerification}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Verificando...' : 'Verificar con Tarjeta'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Funciones helper para detectar productos restringidos
export const requiresAgeVerification = (product) => {
  if (!product) return false;
  
  // Verificar flag manual
  if (product.ageRestricted === true) return true;
  
  // Verificar edad mínima
  if (product.minimumAge && product.minimumAge >= 18) return true;
  
  // Verificar categoría
  const restrictedCategories = [
    'alcohol', 'vino', 'cerveza', 'licor', 'bebidas alcoholicas',
    'tabaco', 'cigarrillos', 'cigarros', 'vaper',
    'gambling', 'apuestas', 'casino'
  ];
  
  if (product.category && restrictedCategories.includes(product.category.toLowerCase())) {
    return true;
  }
  
  // Verificar nombre
  const restrictedKeywords = [
    'vino', 'cerveza', 'whisky', 'ron', 'vodka', 'tequila',
    'cigarrillo', 'tabaco', 'cigarro', 'vaper'
  ];
  
  if (product.name) {
    const nameLower = product.name.toLowerCase();
    if (restrictedKeywords.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
  }
  
  // Verificar tags
  if (product.tags && Array.isArray(product.tags)) {
    const tagsLower = product.tags.map(tag => tag.toLowerCase());
    if (restrictedKeywords.some(keyword => tagsLower.includes(keyword))) {
      return true;
    }
  }
  
  return false;
};

// Obtener edad mínima requerida
export const getRequiredAge = (product, countryCode = 'AR') => {
  if (product.minimumAge) return product.minimumAge;
  
  // Determinar tipo de restricción
  const category = product.category?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';
  
  let restrictionType = 'alcohol'; // default
  
  if (category.includes('tabaco') || name.includes('cigarrillo') || name.includes('tabaco')) {
    restrictionType = 'tobacco';
  } else if (category.includes('gambling') || name.includes('apuesta') || name.includes('casino')) {
    restrictionType = 'gambling';
  }
  
  const countryAges = LEGAL_AGES[countryCode] || LEGAL_AGES.AR;
  return countryAges[restrictionType] || 18;
};

// Hook para usar verificación de edad
export const useAgeVerification = () => {
  const [isCheckingAge, setIsCheckingAge] = useState(false);
  
  const checkVerification = () => {
    try {
      const stored = localStorage.getItem('age_verification');
      if (!stored) return { isVerified: false, verification: null };
      
      const verification = JSON.parse(stored);
      if (!verification.verified) return { isVerified: false, verification };
      
      // Verificar expiración
      const expiresAt = new Date(verification.expiresAt);
      if (expiresAt < new Date()) {
        localStorage.removeItem('age_verification');
        return { isVerified: false, verification: null };
      }
      
      return { isVerified: true, verification };
    } catch (err) {
      console.error('Error checking age verification:', err);
      return { isVerified: false, verification: null };
    }
  };
  
  const clearVerification = () => {
    localStorage.removeItem('age_verification');
  };
  
  const { isVerified, verification } = checkVerification();
  
  return {
    isVerified,
    isCheckingAge,
    verification,
    clearVerification,
  };
};
