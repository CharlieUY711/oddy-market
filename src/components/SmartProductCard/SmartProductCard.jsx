import React, { useState } from 'react';
import { ProductCard } from '../ProductCard';
import { AgeVerification, requiresAgeVerification, getRequiredAge, useAgeVerification } from '../age-verification';
import { useNotifications } from '@context/NotificationContext';
import styles from './SmartProductCard.module.css';

export const SmartProductCard = ({
  product,
  onAddToCart,
  onViewDetails,
  ...productCardProps
}) => {
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const { success } = useNotifications();
  const { isVerified, verification } = useAgeVerification();
  
  // Verificar si el producto requiere verificación de edad
  const needsVerification = requiresAgeVerification(product);
  const minimumAge = getRequiredAge(product, 'AR'); // Por ahora usamos AR como default
  
  // Verificar si ya está verificado y cumple con la edad mínima
  const checkAgeVerification = () => {
    if (!needsVerification) return true;
    
    if (!isVerified) return false;
    
    // Verificar que no expiró
    if (verification) {
      const expiresAt = new Date(verification.expiresAt);
      if (expiresAt < new Date()) return false;
      
      // Verificar que cumple con la edad mínima
      if (verification.age < minimumAge) return false;
    }
    
    return true;
  };
  
  const handleAddToCart = (productId) => {
    if (needsVerification) {
      const isVerified = checkAgeVerification();
      
      if (!isVerified) {
        console.log(`[Age] Product requires verification: ${product.name} (${minimumAge}+)`);
        setShowAgeVerification(true);
        return;
      }
      
      console.log('[Age] User already verified, adding to cart');
    }
    
    onAddToCart?.(productId);
  };
  
  const handleVerified = () => {
    console.log('[Age] Verification successful, adding to cart');
    success('Edad verificada correctamente');
    setShowAgeVerification(false);
    onAddToCart?.(product.id);
  };
  
  return (
    <>
      <div className={styles.wrapper}>
        <ProductCard
          {...productCardProps}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          description={product.description}
          category={product.category}
          discount={product.discount}
          rating={product.rating}
          stock={product.stock}
          onAddToCart={handleAddToCart}
          onViewDetails={onViewDetails}
        />
        
        {needsVerification && (
          <div className={styles.ageBadge}>
            🔞 {minimumAge}+
          </div>
        )}
      </div>
      
      <AgeVerification
        isOpen={showAgeVerification}
        onClose={() => setShowAgeVerification(false)}
        onVerified={handleVerified}
        requiredAge={minimumAge}
        productName={product.name}
      />
    </>
  );
};
