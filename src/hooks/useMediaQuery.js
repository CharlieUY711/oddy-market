import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/constants';

/**
 * Hook para detectar media queries
 * @param {string|number} query - Media query string o breakpoint name
 * @returns {boolean} True si la query coincide
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    let mediaQuery;
    
    // Si es un nombre de breakpoint, convertirlo a media query
    if (typeof query === 'string' && BREAKPOINTS[query.toUpperCase()]) {
      const breakpoint = BREAKPOINTS[query.toUpperCase()];
      mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
    } else if (typeof query === 'number') {
      mediaQuery = window.matchMedia(`(min-width: ${query}px)`);
    } else {
      mediaQuery = window.matchMedia(query);
    }

    // Función para actualizar el estado
    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };

    // Verificar inicialmente
    updateMatches();

    // Escuchar cambios
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMatches);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(updateMatches);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches);
      } else {
        mediaQuery.removeListener(updateMatches);
      }
    };
  }, [query]);

  return matches;
};
