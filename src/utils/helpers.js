/**
 * Helpers de manipulación de datos
 */

/**
 * Helpers de Arrays
 */

/**
 * Agrupa un array por una clave
 * @param {Array} array - Array a agrupar
 * @param {string|Function} key - Clave o función para agrupar
 * @returns {Object} Objeto con grupos
 */
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Ordena un array por una clave
 * @param {Array} array - Array a ordenar
 * @param {string} key - Clave para ordenar
 * @param {string} direction - 'asc' o 'desc' (default: 'asc')
 * @returns {Array} Array ordenado
 */
export const sortBy = (array, key, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  const sorted = [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

/**
 * Filtra un array por múltiples condiciones
 * @param {Array} array - Array a filtrar
 * @param {Object} filters - Objeto con condiciones de filtro
 * @returns {Array} Array filtrado
 */
export const filterBy = (array, filters) => {
  if (!Array.isArray(array)) return [];
  
  return array.filter((item) => {
    return Object.keys(filters).every((key) => {
      const filterValue = filters[key];
      const itemValue = item[key];
      
      if (filterValue === undefined || filterValue === null || filterValue === '') {
        return true;
      }
      
      if (typeof filterValue === 'string') {
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      }
      
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }
      
      return itemValue === filterValue;
    });
  });
};

/**
 * Obtiene valores únicos de un array
 * @param {Array} array - Array
 * @param {string} key - Clave opcional para obtener valores únicos
 * @returns {Array} Array con valores únicos
 */
export const unique = (array, key) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(array)];
};

/**
 * Helpers de Objetos
 */

/**
 * Selecciona propiedades específicas de un objeto
 * @param {Object} obj - Objeto
 * @param {Array} keys - Array de claves a seleccionar
 * @returns {Object} Objeto con solo las claves seleccionadas
 */
export const pick = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omite propiedades específicas de un objeto
 * @param {Object} obj - Objeto
 * @param {Array} keys - Array de claves a omitir
 * @returns {Object} Objeto sin las claves omitidas
 */
export const omit = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

/**
 * Combina múltiples objetos
 * @param {...Object} objects - Objetos a combinar
 * @returns {Object} Objeto combinado
 */
export const merge = (...objects) => {
  return objects.reduce((result, obj) => {
    return { ...result, ...obj };
  }, {});
};

/**
 * Verifica si un objeto está vacío
 * @param {Object} obj - Objeto
 * @returns {boolean} True si está vacío
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Helpers de Strings
 */

/**
 * Trunca un string a una longitud máxima
 * @param {string} str - String a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo (default: '...')
 * @returns {string} String truncado
 */
export const truncate = (str, maxLength, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Convierte un string a slug
 * @param {string} str - String a convertir
 * @returns {string} Slug
 */
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String
 * @returns {string} String capitalizado
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitaliza cada palabra de un string
 * @param {string} str - String
 * @returns {string} String con palabras capitalizadas
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Helpers de Números
 */

/**
 * Redondea un número a N decimales
 * @param {number} num - Número
 * @param {number} decimals - Decimales (default: 2)
 * @returns {number} Número redondeado
 */
export const round = (num, decimals = 2) => {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * Clampa un número entre min y max
 * @param {number} num - Número
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {number} Número clampado
 */
export const clamp = (num, min, max) => {
  if (typeof num !== 'number' || isNaN(num)) return min;
  return Math.min(Math.max(num, min), max);
};

/**
 * Helpers de Fechas
 */

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const daysBetween = (date1, date2) => {
  try {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return 0;
    }
    
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days between:', error);
    return 0;
  }
};

/**
 * Verifica si una fecha es hoy
 * @param {Date|string} date - Fecha
 * @returns {boolean} True si es hoy
 */
export const isToday = (date) => {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return false;
    
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha es en el futuro
 * @param {Date|string} date - Fecha
 * @returns {boolean} True si es en el futuro
 */
export const isFuture = (date) => {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return false;
    return d > new Date();
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha es en el pasado
 * @param {Date|string} date - Fecha
 * @returns {boolean} True si es en el pasado
 */
export const isPast = (date) => {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return false;
    return d < new Date();
  } catch (error) {
    return false;
  }
};
