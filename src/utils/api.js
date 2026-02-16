// API Configuration
import { productService } from '../services/productService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '';

// Construir URL completa del API
const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${API_PREFIX}${endpoint}`;
};

// Flag para usar datos reales del backend o datos mock
const USE_REAL_DATA = false; // Cambiar a true para intentar backend (aún en desarrollo)

// Helper function for API calls
async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 API Request: ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// API Methods
export const api = {
  // Products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProduct: (id) => {
    return apiRequest(`/products/${id}`);
  },

  // Cart
  getCart: () => {
    return apiRequest('/cart');
  },

  addToCart: (productId, quantity = 1) => {
    return apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Auth
  login: (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: (email, password, name) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  logout: () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Orders
  createOrder: (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: () => {
    return apiRequest('/orders');
  },

  // Get products from backend API (con fallback a mock data)
  getMockProducts: async () => {
    try {
      console.log('📡 Fetching products from Backend API...');
      const products = await productService.getAll();
      console.log(`✅ ${products.length} products fetched from backend`);
      return products;
    } catch (error) {
      console.warn('⚠️ Error fetching from backend, using mock data:', error.message || error);
      // Fallback a mock data si falla el backend
      // No re-lanzar el error, continuar con mock data
    }
    
    // Mock data (fallback si el backend falla)
    return Promise.resolve([
      {
        id: 1,
        name: 'Smartphone Samsung Galaxy S23',
        price: 29990,
        description: 'Teléfono inteligente con pantalla AMOLED de 6.1 pulgadas, 128GB de almacenamiento',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        category: 'Tecnología',
        discount: 15,
        rating: 4.5,
        stock: 10,
      },
      {
        id: 2,
        name: 'Auriculares Bluetooth Sony WH-1000XM5',
        price: 12990,
        description: 'Auriculares inalámbricos con cancelación de ruido activa y batería de 30 horas',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        category: 'Tecnología',
        discount: 20,
        rating: 4.8,
        stock: 5,
      },
      {
        id: 3,
        name: 'Zapatillas Nike Air Max 270',
        price: 8990,
        description: 'Zapatillas deportivas con tecnología Air Max para máximo confort',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        category: 'Deportes y Fitness',
        rating: 4.3,
        stock: 15,
      },
      {
        id: 4,
        name: 'Cafetera Nespresso Essenza Mini',
        price: 5990,
        description: 'Cafetera de cápsulas compacta, perfecta para espacios pequeños',
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
        category: 'Hogar y Decoración',
        discount: 10,
        rating: 4.6,
        stock: 8,
      },
      {
        id: 5,
        name: 'Tablet iPad Air 10.9"',
        price: 34990,
        description: 'Tablet Apple con chip M1, pantalla Liquid Retina y 64GB de almacenamiento',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
        category: 'Tecnología',
        discount: 5,
        rating: 4.9,
        stock: 3,
      },
      {
        id: 6,
        name: 'Reloj Inteligente Apple Watch Series 9',
        price: 19990,
        description: 'Smartwatch con GPS, monitor de frecuencia cardíaca y resistencia al agua',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        category: 'Tecnología',
        rating: 4.7,
        stock: 12,
      },
      {
        id: 7,
        name: 'Bolso de Cuero Genuino',
        price: 4990,
        description: 'Bolso elegante de cuero genuino, perfecto para uso diario o formal',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        category: 'Moda y Accesorios',
        discount: 25,
        rating: 4.4,
        stock: 7,
      },
      {
        id: 8,
        name: 'Cámara Canon EOS R50',
        price: 44990,
        description: 'Cámara mirrorless con sensor APS-C y grabación de video 4K',
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
        category: 'Tecnología',
        rating: 4.8,
        stock: 4,
      },
      {
        id: 9,
        name: 'Pizza Margherita Premium',
        price: 890,
        description: 'Pizza artesanal con mozzarella fresca, tomate y albahaca',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
        category: 'Alimentos y Bebidas',
        discount: 30,
        rating: 4.5,
        stock: 20,
      },
      {
        id: 10,
        name: 'Suplemento Vitamínico Multivitamínico',
        price: 1990,
        description: 'Complejo vitamínico con 30 vitaminas y minerales esenciales',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
        category: 'Salud y Bienestar',
        rating: 4.2,
        stock: 25,
      },
      {
        id: 11,
        name: 'Lámpara de Escritorio LED',
        price: 2490,
        description: 'Lámpara LED ajustable con 3 niveles de brillo y puerto USB',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
        category: 'Hogar y Decoración',
        discount: 15,
        rating: 4.3,
        stock: 18,
      },
      {
        id: 12,
        name: 'Pelota de Fútbol Adidas',
        price: 1990,
        description: 'Pelota oficial de fútbol con diseño clásico y durabilidad superior',
        image: 'https://images.unsplash.com/photo-1614634713290-4b1ab2668329?w=400&h=400&fit=crop',
        category: 'Deportes y Fitness',
        rating: 4.6,
        stock: 30,
      },
    ]);
  },
};
