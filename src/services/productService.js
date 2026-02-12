// src/services/productService.js
import { supabase } from '../utils/supabase';

/**
 * Servicio para manejar operaciones con productos desde Supabase
 */

export const productService = {
  /**
   * Obtener todos los productos
   * @returns {Promise<Array>} Lista de productos
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching products by category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Obtener productos con descuento
   * @returns {Promise<Array>} Productos con descuento
   */
  async getDiscounted() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('discount', 0)
        .order('discount', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching discounted products:', error);
      throw error;
    }
  },

  /**
   * Obtener productos destacados (por rating)
   * @param {number} limit - Cantidad de productos a retornar
   * @returns {Promise<Array>} Productos destacados
   */
  async getFeatured(limit = 8) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo producto (requiere autenticación)
   * @param {Object} product - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  async create(product) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};
