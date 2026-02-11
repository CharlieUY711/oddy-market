/**
 * Constantes de la aplicación
 */

// API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
};

// Rutas
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ORDERS: '/orders',
  FAVORITES: '/favorites',
  ABOUT: '/about',
  SECOND_HAND: '/secondhand',
  OFFERS: '/offers',
};

// Mensajes
export const MESSAGES = {
  // Éxito
  SUCCESS: {
    PRODUCT_ADDED: 'Producto agregado al carrito',
    PRODUCT_REMOVED: 'Producto eliminado del carrito',
    ORDER_CREATED: '¡Pedido creado exitosamente!',
    LOGIN_SUCCESS: '¡Bienvenido de nuevo!',
    REGISTER_SUCCESS: '¡Cuenta creada exitosamente!',
    PROFILE_UPDATED: 'Perfil actualizado',
    PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
  },
  
  // Errores
  ERROR: {
    GENERIC: 'Ha ocurrido un error. Por favor intenta de nuevo.',
    NETWORK: 'Error de conexión. Verifica tu internet.',
    NOT_FOUND: 'No se encontró el recurso solicitado',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
    VALIDATION: 'Por favor completa todos los campos requeridos',
    CART_EMPTY: 'Tu carrito está vacío',
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    ORDER_NOT_FOUND: 'Pedido no encontrado',
  },
  
  // Información
  INFO: {
    LOADING: 'Cargando...',
    NO_PRODUCTS: 'No hay productos disponibles',
    NO_RESULTS: 'No se encontraron resultados',
    CART_EMPTY: 'Tu carrito está vacío. Agrega productos para continuar.',
    NO_ORDERS: 'No tienes pedidos aún',
    NO_FAVORITES: 'No tienes productos favoritos',
  },
  
  // Validación
  VALIDATION: {
    REQUIRED: 'Este campo es requerido',
    EMAIL: 'Ingresa un email válido',
    PHONE: 'Ingresa un teléfono válido',
    MIN_LENGTH: (min) => `Mínimo ${min} caracteres`,
    MAX_LENGTH: (max) => `Máximo ${max} caracteres`,
    PASSWORD_MATCH: 'Las contraseñas no coinciden',
    CARD_NUMBER: 'Número de tarjeta inválido',
    CARD_EXPIRY: 'Fecha de vencimiento inválida',
    CARD_CVC: 'CVC inválido',
  },
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'ODDY Market',
  DESCRIPTION: 'Tu tienda departamental online',
  CURRENCY: 'UYU',
  LOCALE: 'es-UY',
  FREE_SHIPPING_THRESHOLD: 50000, // $50.000
  SHIPPING_COST: 500, // $500
  ITEMS_PER_PAGE: 12,
  MAX_CART_ITEMS: 100,
};

// Departamentos
export const DEPARTMENTS = [
  { id: '1', name: 'Alimentos y Bebidas', icon: '🍕', slug: 'alimentos-bebidas' },
  { id: '2', name: 'Tecnología', icon: '💻', slug: 'tecnologia' },
  { id: '3', name: 'Moda y Accesorios', icon: '👜', slug: 'moda-accesorios' },
  { id: '4', name: 'Hogar y Decoración', icon: '🏠', slug: 'hogar-decoracion' },
  { id: '5', name: 'Deportes y Fitness', icon: '⚽', slug: 'deportes-fitness' },
  { id: '6', name: 'Salud y Bienestar', icon: '💊', slug: 'salud-bienestar' },
];

// Estados de pedidos
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmado',
  [ORDER_STATUS.PROCESSING]: 'En proceso',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregado',
  [ORDER_STATUS.CANCELLED]: 'Cancelado',
};

// Métodos de pago
export const PAYMENT_METHODS = {
  CARD: 'card',
  TRANSFER: 'transfer',
  CASH: 'cash',
  MERCADOPAGO: 'mercadopago',
  PAYPAL: 'paypal',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CARD]: 'Tarjeta de Crédito/Débito',
  [PAYMENT_METHODS.TRANSFER]: 'Transferencia Bancaria',
  [PAYMENT_METHODS.CASH]: 'Efectivo',
  [PAYMENT_METHODS.MERCADOPAGO]: 'Mercado Pago',
  [PAYMENT_METHODS.PAYPAL]: 'PayPal',
};

// Breakpoints (debe coincidir con CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Storage keys
export const STORAGE_KEYS = {
  CART: 'oddy_cart',
  FAVORITES: 'oddy_favorites',
  USER: 'oddy_user',
  THEME: 'oddy_theme',
  LANGUAGE: 'oddy_language',
};

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9+\-\s()]+$/,
  CARD_NUMBER: /^\d{13,19}$/,
  CARD_EXPIRY: /^(0[1-9]|1[0-2])\/\d{2}$/,
  CVC: /^\d{3,4}$/,
  ZIP_CODE: /^\d{4,10}$/,
  URL: /^https?:\/\/.+/,
};
