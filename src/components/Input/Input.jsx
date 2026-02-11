import React from 'react';
import styles from './Input.module.css';

/**
 * Input Component
 * Adaptado del proyecto del ZIP, simplificado para nuestra estructura
 */
export const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  error = false,
  ...props
}) => {
  const inputClasses = [
    styles.input,
    error && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      type={type}
      className={inputClasses}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-invalid={error}
      {...props}
    />
  );
};
