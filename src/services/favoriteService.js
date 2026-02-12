// src/services/favoriteService.js
import { supabase } from '../utils/supabase';

/**
 * Servicio para manejar favoritos en Supabase
 * Requiere autenticación
 */

export const favoriteService = {
  /**
   * Obtener todos los favoritos del usuario actual
   * @returns {Promise<Array>} Lista de favoritos con datos del producto
   */
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated');
        return [];
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          products (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  /**
   * Verificar si un producto está en favoritos
   * @param {number} productId - ID del producto
   * @returns {Promise<boolean>} True si está en favoritos
   */
  async isFavorite(productId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error(`Error checking favorite ${productId}:`, error);
      return false;
    }
  },

  /**
   * Agregar un producto a favoritos
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Favorito creado
   */
  async add(productId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, product_id: productId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error adding favorite ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un producto de favoritos
   * @param {number} productId - ID del producto
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async remove(productId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error removing favorite ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Alternar favorito (agregar si no existe, eliminar si existe)
   * @param {number} productId - ID del producto
   * @returns {Promise<boolean>} True si se agregó, False si se eliminó
   */
  async toggle(productId) {
    try {
      const isFav = await this.isFavorite(productId);
      
      if (isFav) {
        await this.remove(productId);
        return false;
      } else {
        await this.add(productId);
        return true;
      }
    } catch (error) {
      console.error(`Error toggling favorite ${productId}:`, error);
      throw error;
    }
  },
};
