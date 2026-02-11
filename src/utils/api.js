// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function for API calls
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
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

  // Mock data for development
  getMockProducts: () => {
    return Promise.resolve([
      {
        id: 1,
        name: 'Producto Ejemplo 1',
        price: 1990,
        description: 'Descripción del producto ejemplo número 1',
        image: 'https://via.placeholder.com/300x200?text=Producto+1',
      },
      {
        id: 2,
        name: 'Producto Ejemplo 2',
        price: 2990,
        description: 'Descripción del producto ejemplo número 2',
        image: 'https://via.placeholder.com/300x200?text=Producto+2',
      },
      {
        id: 3,
        name: 'Producto Ejemplo 3',
        price: 3990,
        description: 'Descripción del producto ejemplo número 3',
        image: 'https://via.placeholder.com/300x200?text=Producto+3',
      },
      {
        id: 4,
        name: 'Producto Ejemplo 4',
        price: 4990,
        description: 'Descripción del producto ejemplo número 4',
        image: 'https://via.placeholder.com/300x200?text=Producto+4',
      },
    ]);
  },
};
