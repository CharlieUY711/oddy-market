import { useState, useEffect, useRef } from 'react';

/**
 * Hook para throttle de valores
 * @param {any} value - Valor a throttle
 * @param {number} limit - Límite en milisegundos (default: 1000)
 * @returns {any} Valor throttled
 */
export const useThrottle = (value, limit = 1000) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};
