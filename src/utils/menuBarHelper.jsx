import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';

/**
 * MenuBarRenderer - Componente para renderizar barra de menú con búsqueda y navegación
 * 
 * @param {Function} onSearchChange - Callback cuando cambia el valor de búsqueda
 * @param {Function} onBackClick - Callback cuando se hace click en el botón volver
 * @param {string} rutaPrincipal - Ruta principal para navegación
 * @param {string} searchValue - Valor actual del campo de búsqueda (opcional)
 * @param {string} searchPlaceholder - Placeholder del campo de búsqueda (opcional)
 */
export const MenuBarRenderer = ({ 
  onSearchChange, 
  onBackClick, 
  rutaPrincipal,
  searchValue = '',
  searchPlaceholder = 'Buscar...'
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 1.5rem',
      backgroundColor: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb',
      minHeight: '60px'
    }}>
      {/* Botón Volver */}
      {onBackClick && (
        <button
          onClick={onBackClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>
      )}

      {/* Campo de Búsqueda */}
      {onSearchChange && (
        <div style={{
          flex: 1,
          position: 'relative',
          maxWidth: '400px'
        }}>
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>
      )}
    </div>
  );
};
