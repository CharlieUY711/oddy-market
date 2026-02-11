/**
 * Utilidades de formateo
 */

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'UYU')
 * @param {string} locale - Locale (default: 'es-UY')
 * @returns {string} Moneda formateada
 */
export const formatCurrency = (amount, currency = 'UYU', locale = 'es-UY') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return formatCurrency(0, currency, locale);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea una fecha
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} locale - Locale (default: 'es-UY')
 * @param {object} options - Opciones de formateo
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, locale = 'es-UY', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} locale - Locale (default: 'es-UY')
 * @returns {string} Fecha relativa formateada
 */
export const formatRelativeDate = (date, locale = 'es-UY') => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
      return 'hace unos segundos';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

/**
 * Formatea un número
 * @param {number} number - Número a formatear
 * @param {string} locale - Locale (default: 'es-UY')
 * @param {object} options - Opciones de formateo
 * @returns {string} Número formateado
 */
export const formatNumber = (number, locale = 'es-UY', options = {}) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };
  return new Intl.NumberFormat(locale, defaultOptions).format(number);
};

/**
 * Formatea un teléfono
 * @param {string} phone - Teléfono a formatear
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato para Uruguay: +598 XX XXX XXX
  if (cleaned.length >= 9) {
    const countryCode = cleaned.startsWith('598') ? '598' : '';
    const rest = cleaned.startsWith('598') ? cleaned.slice(3) : cleaned;
    
    if (rest.length === 8) {
      return `+598 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
    }
  }
  
  return phone; // Retornar original si no coincide con formato esperado
};

/**
 * Formatea el tamaño de un archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Decimales (default: 0)
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 0) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
};
