import React from 'react';
import styles from './Card.module.css';

/**
 * Card Component
 * Adaptado del proyecto del ZIP, simplificado para nuestra estructura
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.header} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h4 className={`${styles.title} ${className}`} {...props}>
      {children}
    </h4>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`${styles.description} ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.content} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.footer} ${className}`} {...props}>
      {children}
    </div>
  );
};
