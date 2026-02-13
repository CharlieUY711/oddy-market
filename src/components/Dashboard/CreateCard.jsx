import React from 'react';
import styles from './CreateCard.module.css';

/**
 * CreateCard - Tarjeta reutilizable para crear/agregar elementos
 * 
 * @param {string} label - Texto a mostrar (por defecto "Crear")
 * @param {function} onClick - Callback cuando se hace click
 * @param {string} className - Clases CSS adicionales (opcional)
 */
const CreateCard = ({ label = 'Crear', onClick, className = '' }) => {
  return (
    <div 
      className={`${styles.createCard} ${className}`}
      onClick={onClick}
    >
      <span className={styles.createCardText}>{label}</span>
    </div>
  );
};

export default CreateCard;
