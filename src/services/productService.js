// src/services/productService.js

/**
 * Servicio para manejar operaciones con productos desde el Backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '';

// Helper para construir URL completa
const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${API_PREFIX}${endpoint}`;
};

export const productService = {
  /**
   * Obtener todos los productos
   * @returns {Promise<Array>} Lista de productos
   */
  async getAll() {
    try {
      console.log('🌐 Fetching products from backend API...');
      const url = getApiUrl('/articles?entity_id=default');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ ${data.articles?.length || 0} products fetched from backend`);
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Obtener un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  async getById(id) {
    try {
      const url = getApiUrl(`/articles/${id}?entity_id=default`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.article || null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar productos por término
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Productos encontrados
   */
  async search(searchTerm) {
    try {
      const url = getApiUrl(`/articles/search?q=${encodeURIComponent(searchTerm)}&entity_id=default`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Obtener productos por categoría
   * @param {string} category - Categoría
   * @returns {Promise<Array>} Productos de la categoría
   */
  async getByCategory(category) {
    try {
      // Obtener todos y filtrar por categoría
      const all = await this.getAll();
      return all.filter(p => p.category === category || p.basic?.category === category);
    } catch (error) {
      console.error(`Error fetching products by category ${category}:`, error);
      return [];
    }
  },

  /**
   * Obtener productos con descuento
   * @returns {Promise<Array>} Productos con descuento
   */
  async getDiscounted() {
    try {
      const all = await this.getAll();
      return all.filter(p => p.discount > 0 || (p.basic && p.basic.discount > 0));
    } catch (error) {
      console.error('Error fetching discounted products:', error);
      return [];
    }
  },

  /**
   * Obtener productos destacados (por rating)
   * @param {number} limit - Cantidad de productos a retornar
   * @returns {Promise<Array>} Productos destacados
   */
  async getFeatured(limit = 8) {
    try {
      const all = await this.getAll();
      return all
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  /**
   * Crear un nuevo producto (requiere autenticación)
   * @param {Object} product - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  async create(product) {
    try {
      const url = getApiUrl('/articles');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_id: 'default',
          ...product,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.article;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Actualizar un producto (requiere autenticación)
   * @param {number} id - ID del producto
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>} Producto actualizado
   */
  async update(id, updates) {
    try {
      const url = getApiUrl(`/articles/${id}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.article;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un producto (requiere autenticación)
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async delete(id) {
    try {
      const url = getApiUrl(`/articles/${id}`);
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};
